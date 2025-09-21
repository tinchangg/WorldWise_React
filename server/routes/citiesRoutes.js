import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all cities
router.get("/cities", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM visited_cities");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
