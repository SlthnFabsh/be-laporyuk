import jwt from "jsonwebtoken";

export const verifyToken = (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return { error: "Token tidak ada" };
    }

    // Support "Bearer token" atau langsung "token"
    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");

    return { user: decoded };
  } catch (error) {
    console.log("Token error:", error.message); // untuk debug
    return { error: "Token tidak valid" };
  }
};