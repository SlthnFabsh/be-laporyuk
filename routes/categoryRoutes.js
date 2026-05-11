import express from "express";
import db from "../config/database.js";

const router = express.Router();

// ✅ Route publik (tanpa auth)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM categories ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;