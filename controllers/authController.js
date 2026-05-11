import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/database.js";

export const register = async (req) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return { message: "Username & password wajib diisi" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    return { message: "Register berhasil ✅" };
  } catch (error) {
    return { error: error.message };
  }
};

// LOGIN
export const login = async (req) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      // ✅ HARUS return status 401 dengan message
      return { error: "Username tidak ditemukan", status: 401 };
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // ✅ HARUS return status 401 dengan message
      return { error: "Password salah", status: 401 };
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    return {
      message: "Login berhasil ✅",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};