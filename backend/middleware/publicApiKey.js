// Public API key gate — mirrors Benna's PUBLIC_API_KEY middleware.
// Every /api request must send the x-api-key header matching PUBLIC_API_KEY.
// If PUBLIC_API_KEY is unset in .env, the gate is disabled (dev convenience).
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;

module.exports = (req, res, next) => {
  if (!PUBLIC_API_KEY) return next();
  if (req.headers["x-api-key"] === PUBLIC_API_KEY) return next();
  return res
    .status(401)
    .json({ success: false, message: "Invalid or missing API key" });
};
