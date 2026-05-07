// middleware/roleMiddleware.js

// Cek apakah user adalah admin atau super_admin
export const isAdmin = (req, res, next) => {
  const role = req.user?.role;
  
  if (!role) {
    return res.status(401).json({ error: "Unauthorized - Login dulu" });
  }
  
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({ error: "Akses ditolak - Hanya admin" });
  }
  
  next();
};

// Cek apakah user adalah super_admin
export const isSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  
  if (!role) {
    return res.status(401).json({ error: "Unauthorized - Login dulu" });
  }
  
  if (role !== 'super_admin') {
    return res.status(403).json({ error: "Akses ditolak - Hanya super admin" });
  }
  
  next();
};

// ✅ TAMBAHKAN INI - untuk cek apakah user pemilik resource atau admin
export const isOwnerOrAdmin = (req, res, next) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const resourceUserId = parseInt(req.params.userId) || req.body.user_id;
  
  // Admin atau super admin bisa akses semua
  if (role === 'admin' || role === 'super_admin') {
    return next();
  }
  
  // User biasa hanya bisa akses resource milik sendiri
  if (userId && resourceUserId && userId === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({ error: "Akses ditolak - Bukan pemilik resource" });
};