import jwt from "jsonwebtoken";

// Config
const maxAge = 15 * 60; // jwt -> sec
const isProduction = process.env.NODE_ENV === "production";
// Send token in HTTP-only cookie
const cookieConfig = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: maxAge * 1000, // cookie -> millisecond
};

// Create new token
export const createToken = (payloadObject) => {
  return jwt.sign(payloadObject, process.env.JWT_ACCESS_SECRET, {
    expiresIn: maxAge,
  });
};

// Verify token
export const verifyToken = (userToken) => {
  return jwt.verify(userToken, process.env.JWT_ACCESS_SECRET);
};

// Set cookie
export const setCookieToken = (res, token) => {
  res.cookie("jwt", token, cookieConfig);
};

// Clear cookie
export const clearCookieToken = (res) => {
  res.clearCookie("jwt");
};
