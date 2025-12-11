const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.get('/today', authenticateToken, progressController.getTodayProgress);
router.patch('/habits/:id', authenticateToken, progressController.validateProgress, progressController.updateHabitProgress);
router.get('/habits/:id/history', authenticateToken, progressController.getHabitProgressHistory);
router.get('/habits/:id/stats', authenticateToken, progressController.getProgressStats);
router.post('/bulk', authenticateToken, progressController.bulkUpdateProgress);

module.exports = router;
