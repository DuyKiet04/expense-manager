const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// 👇 THÊM DÒNG NÀY: Import bộ upload vừa tạo
const upload = require('../config/cloudinary'); 

router.post('/register', authController.register);
router.post('/login', authController.login);

// 👇 SỬA DÒNG NÀY: Thêm 'upload.single('avatar')' vào giữa
// 'avatar' là tên cái field mà frontend sẽ gửi file lên
router.put('/profile', authMiddleware, upload.single('avatar'), authController.updateProfile);

module.exports = router;