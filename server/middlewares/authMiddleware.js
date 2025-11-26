const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || "bi_mat_khong_bat_mi";

const authMiddleware = (req, res, next) => {
  // 1. Lấy token từ header (dạng "Bearer abcxyz...")
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
  }

  const token = authHeader.split(' ')[1]; // Lấy phần token phía sau chữ "Bearer"

  try {
    // 2. Giải mã token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // 3. Gắn thông tin user vào request để dùng ở bước sau
    req.user = decoded; 
    
    next(); // Cho phép đi tiếp
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = authMiddleware;