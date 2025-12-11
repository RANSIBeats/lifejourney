const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habitsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticateToken, habitsController.getHabits);
router.get('/active', authenticateToken, habitsController.getActiveHabits);
router.post('/', authenticateToken, habitsController.validateHabit, habitsController.createHabit);
router.put('/:id', authenticateToken, habitsController.validateHabit, habitsController.updateHabit);
router.delete('/:id', authenticateToken, habitsController.deleteHabit);
router.patch('/:id/toggle', authenticateToken, habitsController.toggleHabitStatus);

module.exports = router;
