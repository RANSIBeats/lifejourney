const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticateToken, goalsController.getGoals);
router.post('/', authenticateToken, goalsController.validateGoal, goalsController.createGoal);
router.get('/:id', authenticateToken, goalsController.getGoal);
router.put('/:id', authenticateToken, goalsController.validateGoal, goalsController.updateGoal);
router.delete('/:id', authenticateToken, goalsController.deleteGoal);

module.exports = router;
