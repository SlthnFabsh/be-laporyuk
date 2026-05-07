import express from "express";
import {
  createLaporan,
  getAllLaporan,
  getLaporanById,
  getLaporanByUser,
  updateLaporan,
  deleteLaporan,
  updateStatusLaporan,
} from "../controllers/laporanController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

const authenticate = (req, res, next) => {
  const verify = verifyToken(req);
  if (verify.error) {
    return res.status(401).json(verify);
  }
  req.user = verify.user;
  next();
};

// ============ ROUTES ============

// POST - Create Laporan
router.post("/", authenticate, uploadImage, async (req, res) => {
  const result = await createLaporan(req, req.user, req.file);
  res.json(result);
});

// GET - All Laporan (Admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  const result = await getAllLaporan();
  res.json(result);
});

// ✅ PENTING! Route /user/my HARUS sebelum /:id
// GET - Laporan by User (Lihat laporan sendiri)
router.get("/user/my", authenticate, async (req, res) => {
  const result = await getLaporanByUser(req.user);
  res.json(result);
});

// GET - Laporan by ID (Harus setelah route spesifik)
router.get("/:id", authenticate, async (req, res) => {
  const result = await getLaporanById(req.params.id, req.user);
  res.json(result);
});

// PUT - Update Laporan
router.put("/:id", authenticate, uploadImage, async (req, res) => {
  const result = await updateLaporan(req.params.id, req.user, req.body, req.file);
  res.json(result);
});

// DELETE - Delete Laporan
router.delete("/:id", authenticate, async (req, res) => {
  const result = await deleteLaporan(req.params.id, req.user);
  res.json(result);
});

// PATCH - Update Status (Admin only)
router.patch("/:id/status", authenticate, isAdmin, async (req, res) => {
  const { status } = req.body;
  const result = await updateStatusLaporan(req.params.id, req.user, status);
  res.json(result);
});

export default router;