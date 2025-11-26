const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id/status', taskController.updateTaskStatus); // API đổi trạng thái
router.delete('/:id', taskController.deleteTask);

module.exports = router;