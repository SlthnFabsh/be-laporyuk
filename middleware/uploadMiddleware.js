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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ Wrapper untuk handle multipart/form-data dengan proper error handling
export const uploadImage = (req, res, next) => {
  const logFile = path.join(uploadDir, "../debug_upload.log");
  fs.appendFileSync(logFile, `\n\n--- [${new Date().toISOString()}] Incoming Request ---\n`);
  fs.appendFileSync(logFile, `Headers: ${JSON.stringify(req.headers, null, 2)}\n`);

  upload.array("files", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log("Multer error:", err);
      fs.appendFileSync(logFile, `Multer Error: ${err.message}\n`);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.log("Upload error:", err);
      fs.appendFileSync(logFile, `Upload Error: ${err.message}\n`);
      return res.status(400).json({ error: err.message });
    }
    
    fs.appendFileSync(logFile, `Files received: ${JSON.stringify(req.files || [], null, 2)}\n`);
    fs.appendFileSync(logFile, `Body received: ${JSON.stringify(req.body || {}, null, 2)}\n`);
    next();
  });
};