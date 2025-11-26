module.exports = (req, res, next) => {
  // req.user đã có sẵn nhờ authMiddleware chạy trước đó
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Cho qua
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối! Bạn không phải Admin." });
  }
};