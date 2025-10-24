import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = express.Router();

const saltRounds = 10;

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
    const queryText = "SELECT * FROM users WHERE email = $1;";
    const result = await db.query(queryText, [email]);
    const user = result.rows[0];

    // Check if user exists
    if (!user) return res.json({ error: "Wrong email or password" });

    // Check if password correct
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.json({ error: "Wrong email or password" });

    // Password match
    res.json(user);
  } catch (err) {
    if (err.message.includes("bcrypt")) {
      console.error("Bcrypt Error:", err);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
