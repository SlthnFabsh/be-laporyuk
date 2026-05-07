import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// POST - Register
router.post("/register", async (req, res) => {
  const result = await register(req);
  res.json(result);
});

// POST - Login
router.post("/login", async (req, res) => {
  const result = await login(req);
  res.json(result);
});

export default router;
