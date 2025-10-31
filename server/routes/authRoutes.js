import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { updateLastLogin } from "../services/userService.js";

const router = express.Router();

const saltRounds = 10;
const maxAge = 15 * 60; // jwt -> sec
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: maxAge * 1000, // cookie -> millisecond
};

// Fn
const createToken = (payloadObject) => {
  return jwt.sign(payloadObject, process.env.JWT_ACCESS_SECRET, {
    expiresIn: maxAge,
  });
};

// Register
router.post("/register", async (req, res) => {
  // user input
  const { name, email, password } = req.body;
  // hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check existing user
    const checkQuery = "SELECT * FROM users WHERE email = $1;";
    const checkResult = await db.query(checkQuery, [email]);

    if (checkResult.rows.length > 0)
      return res.status(409).json({ error: "Email already exists" });

    // Create user
    const queryText =
      "INSERT INTO users(email, password_hash, name, avatar) VALUES ($1, $2, $3, $4) RETURNING *;";
    const values = [
      email,
      hashedPassword,
      name,
      "https://i.pravatar.cc/100?u=zz", // temporary avatar
    ];
    const result = await db.query(queryText, values);
    const user = result.rows[0];

    // Create JWT
    const userPayload = { id: user.id };
    const token = createToken(userPayload);

    // Send token in HTTP-only cookie
    res.cookie("jwt", token, cookieConfig);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err.message.includes("bcrypt")) {
      console.error("Bcrypt Error:", err);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  // user input
  const { email, password } = req.body;

  try {
    // Find user
    const queryText = "SELECT * FROM users WHERE email = $1;";
    const result = await db.query(queryText, [email]);
    const user = result.rows[0];

    // If no user -> return error
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // If there's user -> check password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Password correct -> update last login
    await updateLastLogin(user.id);

    // Create JWT
    const userPayload = { id: user.id };
    const token = createToken(userPayload);

    // Send token in HTTP-only cookie
    res.cookie("jwt", token, cookieConfig);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err.message.includes("bcrypt")) {
      console.error("Bcrypt Error:", err);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Check login
router.get("/check", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, avatar, name FROM users WHERE id = $1;",
      [req.userId]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user });
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out" });
});

export default router;
