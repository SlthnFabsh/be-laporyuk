import express from "express";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Test tanpa auth
router.post("/upload", uploadImage, (req, res) => {
  console.log("TEST ROUTE - body:", req.body);
  console.log("TEST ROUTE - file:", req.file);
  res.json({
    success: true,
    body: req.body,
    file: req.file ? { filename: req.file.filename } : null
  });
});

export default router;