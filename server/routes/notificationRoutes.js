const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
router.use(authMiddleware); // Chỉ cần đăng nhập là xem được

// Lấy 10 thông báo mới nhất
router.get('/', async (req, res) => {
  try {
    const notis = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    res.json(notis);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải thông báo" });
  }
});
router.get('/system-status', adminController.getSystemStatus);
router.get('/popups', adminController.getUnreadPopups); // Lấy popup chưa xem
router.post('/read', adminController.markAsRead);
module.exports = router;