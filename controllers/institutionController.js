import db from "../config/database.js";

export const getInstitutions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM institutions ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Error getInstitutions:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createInstitution = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "Nama instansi wajib diisi" });
    }

    const [existing] = await db.query("SELECT id FROM institutions WHERE name = ?", [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Instansi tujuan sudah ada" });
    }

    const [result] = await db.query("INSERT INTO institutions (name) VALUES (?)", [name]);
    res.json({ message: "Instansi tujuan berhasil ditambahkan", id: result.insertId });
  } catch (error) {
    console.error("Error createInstitution:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInstitution = async (id, reqBody) => {
  try {
    const name = (reqBody.name || "").trim();
    if (!name) {
      return { error: "Nama instansi wajib diisi" };
    }

    const [existing] = await db.query(
      "SELECT id FROM institutions WHERE name = ? AND id <> ?",
      [name, id]
    );
    if (existing.length > 0) {
      return { error: "Nama instansi tujuan sudah digunakan" };
    }

    const [result] = await db.query(
      "UPDATE institutions SET name = ? WHERE id = ?",
      [name, id]
    );

    if (result.affectedRows === 0) {
      return { error: "Instansi tidak ditemukan" };
    }

    return { message: "Instansi tujuan berhasil diperbarui" };
  } catch (error) {
    console.error("Error updateInstitution:", error);
    return { error: error.message };
  }
};

export const deleteInstitution = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM institutions WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return { error: "Instansi tidak ditemukan" };
    }
    return { message: "Instansi tujuan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleteInstitution:", error);
    return { error: error.message };
  }
};
