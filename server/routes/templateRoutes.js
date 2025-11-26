const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.use(authMiddleware, adminMiddleware); // Chỉ Admin mới vào đc

router.get('/', templateController.getTemplates);
router.post('/', templateController.createTemplate);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;