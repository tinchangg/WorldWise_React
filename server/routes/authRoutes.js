import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

const saltRounds = 10;
const maxAge = 15 * 60; // jwt -> sec

// Fn
const createToken = (payloadObject) => {
  return jwt.sign(payloadObject, process.env.JWT_ACCESS_SECRET, {
    expiresIn: maxAge,
  });
};

// Register
router.post("/register", async (req, res) => {
  // user input
  const { email, password } = req.body;
  // hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Check existing user
    const checkQuery = "SELECT * FROM users WHERE email = $1;";
    const checkResult = await db.query(checkQuery, [email]);

    if (checkResult.rows.length > 0)
      return res.json({ error: "Email already exists" });

    // Create user
    const queryText =
      "INSERT INTO users(email, password_hash) VALUES ($1, $2) RETURNING *;";
    const values = [email, hashedPassword];
    const result = await db.query(queryText, values);
    res.json(result.rows[0]);
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
    if (!user) return res.json({ error: "Wrong email or password" });

    // If there's user -> check password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.json({ error: "Wrong email or password" });

    // Password correct -> create JWT
    const userPayload = { id: user.id, email: user.email };
    const token = createToken(userPayload);

    // Send token in HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: maxAge * 1000, // cookie -> millisecond
    });
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
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json(user);
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;
