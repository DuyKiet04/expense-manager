const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../config/cloudinary');
// Bảo vệ 2 lớp: Phải đăng nhập -> Phải là Admin
router.use(authMiddleware);
router.use(adminMiddleware);
router.post('/notifications', upload.single('media'), adminController.sendNotification);
router.get('/users', adminController.getAllUsers);
router.delete('/notifications/:id', adminController.deleteNotification);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.changeUserRole);
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.sendNotification);
module.exports = router;