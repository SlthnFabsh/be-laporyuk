import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const result = await register(req);
  
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }
  
  res.status(201).json(result);
});

router.post("/login", async (req, res) => {
  const result = await login(req);
  
  //  Handle error dengan status code yang benar
  if (result.error) {
    const statusCode = result.status || 401;
    return res.status(statusCode).json({ message: result.error });
  }
  
  res.json(result);
});

export default router;  