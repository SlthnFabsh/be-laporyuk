import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import laporanRoutes from "./routes/laporanRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ✅ URUTAN PENTING - JANGAN UBAH!
// 1. Parse URL encoded (untuk form-data biasa)
app.use(express.urlencoded({ extended: true }));

// 2. Parse JSON (untuk raw JSON)
app.use(express.json());

// 3. Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. Routes
app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/institutions", institutionRoutes);

// 5. Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Terjadi kesalahan server" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});