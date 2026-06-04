import express from "express";
import {
  createLaporan,
  getAllLaporan,
  getLaporanById,
  getLaporanByUser,
  updateLaporan,
  deleteLaporan,
  updateStatusLaporan,
  rejectLaporanWithReason,
  getPublicLaporan,
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

// ✅ ROUTE PUBLIK - Letakkan di PALING ATAS (tanpa auth)
router.get("/public", getPublicLaporan);

// POST - Create Laporan
router.post("/", authenticate, uploadImage, async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const result = await createLaporan(req, req.user, req.files);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// GET - All Laporan (Admin only)
router.get("/", authenticate, isAdmin, async (req, res) => {
  const result = await getAllLaporan();
  res.json(result);
});

// GET - Laporan by User
router.get("/user/my", authenticate, async (req, res) => {
  const result = await getLaporanByUser(req.user);
  res.json(result);
});

// GET - Laporan by ID (dengan validasi pemilik)
router.get("/:id", authenticate, async (req, res) => {
  const result = await getLaporanById(req.params.id, req.user);
  res.json(result);
});

// PUT - Update Laporan
router.put("/:id", authenticate, uploadImage, async (req, res) => {
  const result = await updateLaporan(req.params.id, req.user, req.body, req.files);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// DELETE - Delete Laporan
router.delete("/:id", authenticate, async (req, res) => {
  const result = await deleteLaporan(req.params.id, req.user);
  res.json(result);
});

// PATCH - Update Status (Admin only)
router.patch("/:id/status", authenticate, isAdmin, express.json(), async (req, res) => {
  const { status } = req.body;
  const result = await updateStatusLaporan(req.params.id, req.user, status);
  res.json(result);
});

//  ROUTE BARU: Reject Laporan dengan Alasan (Admin only)
router.patch("/:id/reject", authenticate, isAdmin, express.json(), async (req, res) => {
  const { rejection_reason } = req.body;
  const result = await rejectLaporanWithReason(req.params.id, req.user, rejection_reason);
  res.json(result);
});

export default router;