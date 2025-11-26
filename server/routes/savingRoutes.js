const express = require('express');
const router = express.Router();
const savingController = require('../controllers/savingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', savingController.getGoals);
router.post('/', savingController.createGoal);
router.put('/:id/deposit', savingController.deposit); // API nạp tiền

module.exports = router;