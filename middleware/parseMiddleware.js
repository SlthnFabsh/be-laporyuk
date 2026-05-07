// middleware/parseMiddleware.js
export const forceParseFormData = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Multer sudah handle, tapi kadang butuh ini
    if (!req.body || Object.keys(req.body).length === 0) {
      req.body = req.body || {};
    }
  }
  next();
};