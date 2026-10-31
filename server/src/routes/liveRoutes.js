// src/routes/liveRoutes.js
const router = require("express").Router();
const { requireAdmin } = require("../middleware/adminAuth");

const ACTIVE_MS = 45_000; // "online" = pinged in the last 45s
const MAX_SESSIONS = 5000; // memory guard
const sessions = new Map(); // id -> { path, lastSeen }

// drop stale sessions every minute
setInterval(() => {
  const cutoff = Date.now() - 5 * 60_000;
  for (const [id, s] of sessions) {
    if (s.lastSeen < cutoff) sessions.delete(id);
  }
}, 60_000).unref();

// Public: the website pings this
router.post("/ping", (req, res) => {
  const { id, path } = req.body || {};
  if (typeof id === "string" && id.length >= 8 && id.length <= 64) {
    if (sessions.size < MAX_SESSIONS || sessions.has(id)) {
      sessions.set(id, {
        path: typeof path === "string" ? path.slice(0, 100) : "/",
        lastSeen: Date.now(),
      });
    }
  }
  res.status(204).end();
});

// Admin only: live count
router.get("/", requireAdmin, (_req, res) => {
  const cutoff = Date.now() - ACTIVE_MS;
  const byPath = {};
  let online = 0;

  for (const s of sessions.values()) {
    if (s.lastSeen >= cutoff) {
      online++;
      byPath[s.path] = (byPath[s.path] || 0) + 1;
    }
  }

  const pages = Object.entries(byPath)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  res.json({ online, pages });
});

module.exports = router;