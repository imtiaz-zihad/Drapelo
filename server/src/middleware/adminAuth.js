const crypto = require("crypto");

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sign = (data) =>
  crypto.createHmac("sha256", process.env.ADMIN_TOKEN_SECRET).update(data).digest("base64url");

// constant-time compare
const safeEq = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const configured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_TOKEN_SECRET);

exports.login = (req, res) => {
  if (!configured()) return res.status(500).json({ message: "Admin auth is not configured" });

  const { password } = req.body || {};
  if (typeof password !== "string" || !safeEq(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ message: "Incorrect password. Please try again." });
  }

  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString("base64url");
  res.json({ token: `${payload}.${sign(payload)}` });
};

exports.requireAdmin = (req, res, next) => {
  if (!configured()) return res.status(500).json({ message: "Admin auth is not configured" });

  const token = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEq(sig, sign(payload))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!(exp > Date.now())) return res.status(401).json({ message: "Session expired" });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};