import db from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

// ============ CREATE Laporan dengan gambar ============
export const createLaporan = async (req, user, file) => {
  try {
    // ✅ PERBAIKAN: Ambil dari berbagai kemungkinan sumber
    let title = req.body.title;
    let description = req.body.description;
    let category_id = req.body.category_id;
    
    // Kalau masih undefined, coba dari req.body langsung
    if (!title && req.body.title === undefined) {
      title = req.body.title;
    }
    
    console.log("Final title:", title);
    console.log("Final description:", description);
    console.log("Final category_id:", category_id);
    
    if (!title || !description) {
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      return { error: "Title dan description wajib diisi ❌" };
    }

    let imagePath = null;
    if (file && file.filename) {
      imagePath = `/uploads/${file.filename}`;
    }

    const [result] = await db.query(
      `INSERT INTO laporan (user_id, title, description, category_id, status, image) 
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [user.id, title, description, category_id || null, imagePath]
    );

    return { 
      message: "Laporan berhasil dibuat ✅",
      id: result.insertId,
      image: imagePath
    };
  } catch (error) {
    console.log("Error createLaporan:", error);
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }
    return { error: error.message };
  }
};

// UPDATE Laporan
// UPDATE Laporan (tambahkan support remove_image)
export const updateLaporan = async (id, user, reqBody, file) => {
  try {
    const { title, description, category_id, remove_image } = reqBody;
    const userId = Number(user.id);
    const laporanId = Number(id);
    
    const [check] = await db.query(
      "SELECT * FROM laporan WHERE id = ? AND user_id = ?",
      [laporanId, userId]
    );
    
    if (check.length === 0) {
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      return { message: "Laporan tidak ditemukan / bukan milik user ❌" };
    }
    
    const oldImage = check[0].image;
    
    let updateFields = [];
    let updateValues = [];
    
    if (title) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (description) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }
    if (category_id) {
      updateFields.push("category_id = ?");
      updateValues.push(category_id);
    }
    
    // Handle image update
    if (file && file.filename) {
      updateFields.push("image = ?");
      updateValues.push(`/uploads/${file.filename}`);
      
      if (oldImage) {
        const oldImagePath = path.join(uploadsDir, path.basename(oldImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // ✅ Handle remove image
    if (remove_image === "true" && !file) {
      updateFields.push("image = ?");
      updateValues.push(null);
      
      if (oldImage) {
        const oldImagePath = path.join(uploadsDir, path.basename(oldImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    if (updateFields.length === 0) {
      if (file && file.path) fs.unlinkSync(file.path);
      return { message: "Tidak ada data yang diupdate ⚠️" };
    }
    
    updateValues.push(laporanId, userId);
    
    await db.query(
      `UPDATE laporan SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
      updateValues
    );
    
    return { message: "Laporan berhasil diupdate ✅" };
  } catch (error) {
    if (file && file.path) fs.unlinkSync(file.path);
    return { error: error.message };
  }
};

// ... fungsi lainnya (getAllLaporan, getLaporanById, dll) tetap sama seperti sebelumnya
// ============ DELETE Laporan (hapus juga file gambarnya) ============
export const deleteLaporan = async (id, user) => {
  try {
    const userId = Number(user.id);
    const laporanId = Number(id);
    const role = user.role;

    let query, params;
    
    if (role === 'admin' || role === 'super_admin') {
      
      const [laporan] = await db.query("SELECT image FROM laporan WHERE id = ?", [laporanId]);
      if (laporan.length > 0 && laporan[0].image) {
        const imagePath = path.join(uploadsDir, path.basename(laporan[0].image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      query = "DELETE FROM laporan WHERE id = ?";
      params = [laporanId];
    } else {
      query = "DELETE FROM laporan WHERE id = ? AND user_id = ?";
      params = [laporanId, userId];
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return { message: "Data tidak ditemukan / bukan milik user ❌" };
    }

    return { message: "Laporan berhasil dihapus ✅" };
  } catch (error) {
    return { error: error.message };
  }
};

// GET ALL Laporan - PUBLIC (tanpa auth, untuk halaman utama)
export const getPublicLaporan = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const [rows] = await db.query(
      `SELECT l.*, u.username, c.name as category_name 
       FROM laporan l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN categories c ON l.category_id = c.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ Fungsi lain tetap sama ============
// getAllLaporan, getLaporanById, getLaporanByUser, updateStatusLaporan
// (copy dari kode sebelumnya, tidak perlu diubah)
export const getAllLaporan = async () => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, u.username, c.name as category_name 
       FROM laporan l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN categories c ON l.category_id = c.id
       ORDER BY l.created_at DESC`
    );
    return rows;
  } catch (error) {
    return { error: error.message };
  }
};

// GET Laporan by ID (dengan validasi: user biasa hanya bisa lihat milik sendiri)
export const getLaporanById = async (id, user) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, u.username, c.name as category_name 
       FROM laporan l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return { error: "Laporan tidak ditemukan ❌" };
    }
    
    const laporan = rows[0];
    
    // Validasi role
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      if (laporan.user_id !== user.id) {
        return { error: "Akses ditolak - Bukan laporan anda ❌" };
      }
    }
    
    // ✅ AMBIL KOMENTAR untuk laporan ini
    const [comments] = await db.query(
      `SELECT c.*, u.username 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.laporan_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );
    
    laporan.comments = comments;
    
    return laporan;
  } catch (error) {
    return { error: error.message };
  }
};

export const getLaporanByUser = async (user) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, c.name as category_name 
       FROM laporan l
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [user.id]
    );
    return rows;
  } catch (error) {
    return { error: error.message };
  }
};

export const updateStatusLaporan = async (id, user, status) => {
  try {
    const role = user.role;
    const laporanId = Number(id);
    
    if (role !== 'admin' && role !== 'super_admin') {
      return { error: "Hanya admin yang bisa update status ❌" };
    }
    
    const validStatus = ['pending', 'approved', 'rejected'];
    if (!validStatus.includes(status)) {
      return { error: "Status tidak valid. Gunakan: pending, approved, rejected ❌" };
    }
    
    const [result] = await db.query(
      "UPDATE laporan SET status = ? WHERE id = ?",
      [status, laporanId]
    );
    
    if (result.affectedRows === 0) {
      return { message: "Laporan tidak ditemukan ❌" };
    }
    
    return { message: `Status laporan berhasil diubah menjadi ${status} ✅` };
  } catch (error) {
    return { error: error.message };
  }
};