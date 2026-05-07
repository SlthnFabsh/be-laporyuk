import db from "../config/database.js";

export const createComment = async (req, user, laporan_id) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return { error: "Komentar tidak boleh kosong ❌" };
    }
    
    const [laporan] = await db.query(
      "SELECT id FROM laporan WHERE id = ?",
      [laporan_id]
    );
    
    if (laporan.length === 0) {
      return { error: "Laporan tidak ditemukan ❌" };
    }
    
    const [result] = await db.query(
      `INSERT INTO comments (laporan_id, user_id, comment) 
       VALUES (?, ?, ?)`,
      [laporan_id, user.id, comment]
    );
    
    return {
      message: "Komentar berhasil ditambahkan ✅",
      id: result.insertId
    };
  } catch (error) {
    return { error: error.message };
  }
};

export const getCommentsByLaporanId = async (laporan_id) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.laporan_id = ?
       ORDER BY c.created_at DESC`,
      [laporan_id]
    );
    return rows;
  } catch (error) {
    return { error: error.message };
  }
};

export const updateComment = async (id, user, newComment) => {
  try {
    const commentId = Number(id);
    const userId = Number(user.id);
    const role = user.role;
    
    const [check] = await db.query(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );
    
    if (check.length === 0) {
      return { error: "Komentar tidak ditemukan ❌" };
    }
    
    if (role !== 'admin' && role !== 'super_admin') {
      if (check[0].user_id !== userId) {
        return { error: "Anda tidak bisa mengedit komentar orang lain ❌" };
      }
    }
    
    await db.query(
      "UPDATE comments SET comment = ? WHERE id = ?",
      [newComment, commentId]
    );
    
    return { message: "Komentar berhasil diupdate ✅" };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteComment = async (id, user) => {
  try {
    const commentId = Number(id);
    const userId = Number(user.id);
    const role = user.role;
    
    const [check] = await db.query(
      "SELECT * FROM comments WHERE id = ?",
      [commentId]
    );
    
    if (check.length === 0) {
      return { error: "Komentar tidak ditemukan ❌" };
    }
    
    let query, params;
    
    if (role === 'admin' || role === 'super_admin') {
      query = "DELETE FROM comments WHERE id = ?";
      params = [commentId];
    } else {
      query = "DELETE FROM comments WHERE id = ? AND user_id = ?";
      params = [commentId, userId];
    }
    
    const [result] = await db.query(query, params);
    
    if (result.affectedRows === 0) {
      return { error: "Tidak bisa menghapus komentar orang lain ❌" };
    }
    
    return { message: "Komentar berhasil dihapus ✅" };
  } catch (error) {
    return { error: error.message };
  }
};