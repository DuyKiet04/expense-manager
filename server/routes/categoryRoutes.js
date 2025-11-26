const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Ai cũng xem được danh mục
router.get('/', authMiddleware, categoryController.getAllCategories);

// Chỉ Admin mới được Thêm/Xóa
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;