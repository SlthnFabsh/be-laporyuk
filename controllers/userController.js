import db from "../config/database.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, role, created_at FROM users ORDER BY id DESC"
    );
    return rows;
  } catch (error) {
    return { error: error.message };
  }
};

export const getUserById = async (id) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
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
    const { username, password, role } = reqBody;
    
    if (!username || !password) {
      return { error: "Username dan password wajib diisi" };
    }
    
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    
    if (existing.length > 0) {
      return { error: "Username sudah digunakan" };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    
    const [result] = await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, userRole]
    );
    
    return {
      message: "User berhasil dibuat ✅",
      user: {
        id: result.insertId,
        username,
        role: userRole
      }
    };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateUser = async (id, reqBody, currentUser) => {
  try {
    const { username, password, role } = reqBody;
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
    
    if (username) {
      updateFields.push("username = ?");
      updateValues.push(username);
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