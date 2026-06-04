import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isSuperAdmin } from "../middleware/roleMiddleware.js"; // ✅ Hanya import yang ada

const router = express.Router();

const authenticate = (req, res, next) => {
  const verify = verifyToken(req);
  if (verify.error) {
    return res.status(401).json(verify);
  }
  req.user = verify.user;
  next();
};


// GET - All users (Super Admin only)
router.get("/", authenticate, isSuperAdmin, async (req, res) => {
  const result = await getAllUsers();
  res.json(result);
});

// GET - User by ID (Super Admin only)
router.get("/:id", authenticate, isSuperAdmin, async (req, res) => {
  const result = await getUserById(req.params.id);
  res.json(result);
});

// POST - Create user (Super Admin only)
router.post("/", authenticate, isSuperAdmin, async (req, res) => {
  const result = await createUser(req.body);
  res.json(result);
});

// PUT - Update user (Super Admin only)
router.put("/:id", authenticate, isSuperAdmin, async (req, res) => {
  const result = await updateUser(req.params.id, req.body, req.user);
  res.json(result);
});

// DELETE - Delete user (Super Admin only)
router.delete("/:id", authenticate, isSuperAdmin, async (req, res) => {
  const result = await deleteUser(req.params.id, req.user);
  res.json(result);
});

export default router;