const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
// Tất cả các route dưới đây đều cần đăng nhập (đi qua authMiddleware)
router.use(authMiddleware);

router.get('/', expenseController.getExpenses);       // Lấy danh sách
router.post('/', upload.single('image'), expenseController.createExpense);    // Thêm mới
router.delete('/:id', expenseController.deleteExpense); // Xóa

module.exports = router;