import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all cities
router.get("/cities", async (req, res) => {
  try {
    const queryText = "SELECT * FROM visited_cities";
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET one city
router.get("/cities/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const queryText = "SELECT * FROM visited_cities WHERE id = $1";
    const result = await db.query(queryText, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST city
router.post("/cities", async (req, res) => {
  const newCity = req.body;

  try {
    const { city, country, emoji, date, notes, position } = newCity;
    const queryText =
      "INSERT INTO visited_cities(city, country, emoji, date, notes, position, user_id) VALUES ($1, $2, $3, $4, $5, point($6, $7), $8) RETURNING *";
    const values = [
      city,
      country,
      emoji,
      date,
      notes,
      parseFloat(position.x),
      parseFloat(position.y),
      1, // temporary user_id
    ];
    const result = await db.query(queryText, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE city
router.delete("/cities/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const queryText = "DELETE FROM visited_cities WHERE id = $1 RETURNING *";
    const result = await db.query(queryText, [id]);

    if (result.rowCount === 0)
      res.status(404).json({ message: "Item not found" });

    res.json({
      message: "Items deleted successfully",
      deletedItem: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
