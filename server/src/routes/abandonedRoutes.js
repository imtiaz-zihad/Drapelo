// src/routes/abandonedRoutes.js
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { capture, list, update, remove } = require("../controllers/abandonedController");
const { requireAdmin } = require("../middleware/adminAuth");

// router.get("/", requireAdmin, list); router.patch("/:id", requireAdmin, update); router.delete("/:id", requireAdmin, remove);
// The checkout page saves progress a few times per visit; cap abuse per IP


const captureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { ok: true, skipped: true },
});

router.post("/", captureLimiter, capture);
router.get("/",requireAdmin, list);
router.patch("/:id",requireAdmin, update);
router.delete("/:id",requireAdmin, remove);

module.exports = router;
