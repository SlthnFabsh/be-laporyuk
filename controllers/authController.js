import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/database.js";

export const register = async (req) => {
  try {
    const { nik, nama_lengkap, email, password, alamat } = req.body;

    // Validasi field wajib
    if (!nik || !nama_lengkap || !email || !password || !alamat) {
      return { 
        error: "NIK, nama lengkap, email, password, dan alamat wajib diisi" 
      };
    }

    // Validasi NIK (16 digit)
    if (!/^\d{16}$/.test(nik)) {
      return { error: "NIK harus 16 digit angka" };
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Format email tidak valid" };
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return { error: "Password minimal 6 karakter" };
    }

    // Cek apakah NIK sudah terdaftar
    const [existingNIK] = await db.query(
      "SELECT id FROM users WHERE nik = ?",
      [nik]
    );
    
    if (existingNIK.length > 0) {
      return { error: "NIK sudah terdaftar" };
    }

    // Cek apakah email sudah terdaftar
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    
    if (existingEmail.length > 0) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (nik, nama_lengkap, email, password, alamat) VALUES (?, ?, ?, ?, ?)",
      [nik, nama_lengkap, email, hashedPassword, alamat]
    );

    return { message: "Register berhasil ✅" };
  } catch (error) {
    return { error: error.message };
  }
};

// LOGIN
export const login = async (req) => {
  try {
    const { email, password } = req.body;

    // Validasi field wajib
    if (!email || !password) {
      return { error: "Email & password wajib diisi", status: 400 };
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return { error: "Email tidak ditemukan", status: 401 };
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { error: "Password salah", status: 401 };
    }

    const token = jwt.sign(
      {
        id: user.id,
        nik: user.nik,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
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
        nik: user.nik,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        alamat: user.alamat,
        role: user.role
      }
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};