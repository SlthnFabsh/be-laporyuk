import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// ✅ PERBAIKAN UTAMA
export const uploadImage = (req, res, next) => {
  // Simpan body asli sebelum multer
  const originalBody = { ...req.body };
  
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.log("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    
    // ✅ Gabungkan body dari multer dengan body asli
    if (req.body && typeof req.body === 'object') {
      Object.assign(req.body, originalBody);
    }
    
    // ✅ Pastikan field text terbaca dengan benar
    if (req.body.title === undefined && originalBody.title) {
      req.body.title = originalBody.title;
    }
    if (req.body.description === undefined && originalBody.description) {
      req.body.description = originalBody.description;
    }
    if (req.body.category_id === undefined && originalBody.category_id) {
      req.body.category_id = originalBody.category_id;
    }
    
    console.log("After multer - req.body:", req.body);
    
    next();
  });
};