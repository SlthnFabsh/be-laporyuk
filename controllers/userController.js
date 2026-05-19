import db from "../config/database.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id, nik, nama_lengkap, email, role, created_at FROM users ORDER BY id DESC"
    );
    return rows;
  } catch (error) {
    return { error: error.message };
  }
};

export const getUserById = async (id) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nik, nama_lengkap, email, alamat, role, created_at FROM users WHERE id = ?",
      [id]
    );
    
    if (rows.length === 0) {
      return { error: "User tidak ditemukan" };
    }
    
    return rows[0];
  } catch (error) {
    return { error: error.message };
  }
};

export const createUser = async (reqBody) => {
  try {
    const { nik, nama_lengkap, email, password, alamat, role } = reqBody;
    
    if (!nik || !nama_lengkap || !email || !password || !alamat) {
      return { error: "NIK, nama lengkap, email, password, dan alamat wajib diisi" };
    }

    // Validasi NIK (16 digit)
    if (!/^\d{16}$/.test(nik)) {
      return { error: "NIK harus 16 digit angka" };
    }

    // Cek duplikat NIK
    const [existingNIK] = await db.query(
      "SELECT id FROM users WHERE nik = ?",
      [nik]
    );
    
    if (existingNIK.length > 0) {
      return { error: "NIK sudah digunakan" };
    }

    // Cek duplikat email
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    
    if (existingEmail.length > 0) {
      return { error: "Email sudah digunakan" };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    
    const [result] = await db.query(
      "INSERT INTO users (nik, nama_lengkap, email, password, alamat, role) VALUES (?, ?, ?, ?, ?, ?)",
      [nik, nama_lengkap, email, hashedPassword, alamat, userRole]
    );
    
    return {
      message: "User berhasil dibuat ✅",
      user: {
        id: result.insertId,
        nik,
        nama_lengkap,
        email,
        role: userRole
      }
    };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateUser = async (id, reqBody, currentUser) => {
  try {
    const { nik, nama_lengkap, email, password, alamat, role } = reqBody;
    const userId = Number(id);
    
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (user.length === 0) {
      return { error: "User tidak ditemukan" };
    }
    
    if (currentUser.id === userId && role && role !== user[0].role) {
      return { error: "Super admin tidak bisa mengubah role sendiri" };
    }
    
    let updateFields = [];
    let updateValues = [];
    
    if (nik) {
      // Validasi NIK
      if (!/^\d{16}$/.test(nik)) {
        return { error: "NIK harus 16 digit angka" };
      }
      // Cek duplikat NIK
      const [existing] = await db.query(
        "SELECT id FROM users WHERE nik = ? AND id != ?",
        [nik, userId]
      );
      if (existing.length > 0) {
        return { error: "NIK sudah digunakan" };
      }
      updateFields.push("nik = ?");
      updateValues.push(nik);
    }

    if (nama_lengkap) {
      updateFields.push("nama_lengkap = ?");
      updateValues.push(nama_lengkap);
    }

    if (email) {
      // Cek duplikat email
      const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (existing.length > 0) {
        return { error: "Email sudah digunakan" };
      }
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (alamat) {
      updateFields.push("alamat = ?");
      updateValues.push(alamat);
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = ?");
      updateValues.push(hashedPassword);
    }
    
    if (role && currentUser.role === 'super_admin') {
      updateFields.push("role = ?");
      updateValues.push(role);
    }
    
    if (updateFields.length === 0) {
      return { message: "Tidak ada data yang diupdate" };
    }
    
    updateValues.push(userId);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    
    return { message: "User berhasil diupdate ✅" };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteUser = async (id, currentUser) => {
  try {
    const userId = Number(id);
    
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (user.length === 0) {
      return { error: "User tidak ditemukan" };
    }
    
    if (currentUser.id === userId) {
      return { error: "Tidak bisa menghapus akun sendiri" };
    }
    
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    
    return { message: "User berhasil dihapus ✅" };
  } catch (error) {
    return { error: error.message };
  }
};