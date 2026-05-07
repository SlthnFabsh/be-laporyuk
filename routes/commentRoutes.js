import express from "express";
import {
  createComment,
  getCommentsByLaporanId,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const authenticate = (req, res, next) => {
  const verify = verifyToken(req);
  if (verify.error) {
    return res.status(401).json(verify);
  }
  req.user = verify.user;
  next();
};

// POST - Create comment
router.post("/:laporan_id", authenticate, async (req, res) => {
  const result = await createComment(req, req.user, req.params.laporan_id);
  res.json(result);
});

// GET - Get comments by laporan_id
router.get("/laporan/:laporan_id", authenticate, async (req, res) => {
  const result = await getCommentsByLaporanId(req.params.laporan_id);
  res.json(result);
});

// PUT - Update comment
router.put("/:id", authenticate, async (req, res) => {
  const { comment } = req.body;
  const result = await updateComment(req.params.id, req.user, comment);
  res.json(result);
});

// DELETE - Delete comment
router.delete("/:id", authenticate, async (req, res) => {
  const result = await deleteComment(req.params.id, req.user);
  res.json(result);
});

export default router;