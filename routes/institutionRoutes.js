import express from "express";
import { getInstitutions, createInstitution, updateInstitution, deleteInstitution } from "../controllers/institutionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
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

router.get("/", getInstitutions);
router.post("/", authenticate, isAdmin, createInstitution);
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const result = await updateInstitution(req.params.id, req.body);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  const result = await deleteInstitution(req.params.id);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

export default router;
