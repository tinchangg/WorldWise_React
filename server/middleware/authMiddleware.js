import { verifyToken } from "../services/tokenService.js";

export function authenticate(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token)
    return res.status(401).json({ success: false, error: "Not authenticated" });

  try {
    const userPayload = verifyToken(token);
    // Keep only the minimal info in req (e.g. user id)
    req.userId = userPayload.id;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, error: "Invalid or expired token" });
  }
}
