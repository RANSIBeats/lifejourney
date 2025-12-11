const { body, validationResult } = require('express-validator');
const database = require('../utils/database');

const validateGoal = [
  body('goalType')
    .isIn(['fitness', 'productivity', 'health', 'learning', 'social', 'personal'])
    .withMessage('Invalid goal type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('targetValue')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target value must be a positive integer'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('priority')
    .optional()
    .isIn([1, 2, 3])
    .withMessage('Priority must be 1 (high), 2 (medium), or 3 (low)')
];

async function getGoals(req, res) {
  try {
    const userId = req.user.id;

    await database.connect();

    const goals = await database.all(
      `SELECT g.*, 
              COUNT(h.id) as habits_count,
              COUNT(CASE WHEN hp.status = 'completed' THEN 1 END) as completed_habits
       FROM user_goals g
       LEFT JOIN habits h ON g.id = h.goal_id AND h.is_active = 1
       LEFT JOIN habit_progress hp ON h.id = hp.habit_id AND date(hp.date) = date('now')
       WHERE g.user_id = ?
       GROUP BY g.id
       ORDER BY g.priority ASC, g.created_at DESC`,
      [userId]
    );

    res.json({ goals });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function createGoal(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { goalType, title, description, targetValue, deadline, priority = 2 } = req.body;

    await database.connect();

    const result = await database.run(
      `INSERT INTO user_goals (user_id, goal_type, title, description, target_value, deadline, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, goalType, title, description || null, targetValue || null, deadline || null, priority]
    );

    const goal = await database.get(
      'SELECT * FROM user_goals WHERE id = ? AND user_id = ?',
      [result.id, userId]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function updateGoal(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const goalId = req.params.id;
    const { goalType, title, description, targetValue, currentValue, deadline, priority, status } = req.body;

    await database.connect();

    // Check if goal exists and belongs to user
    const existingGoal = await database.get(
      'SELECT id FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await database.run(
      `UPDATE user_goals 
       SET goal_type = ?, title = ?, description = ?, target_value = ?, 
           current_value = ?, deadline = ?, priority = ?, status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        goalType || 'fitness',
        title,
        description || null,
        targetValue || null,
        currentValue || 0,
        deadline || null,
        priority || 2,
        status || 'active',
        goalId,
        userId
      ]
    );

    const goal = await database.get(
      'SELECT * FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    res.json({
      message: 'Goal updated successfully',
      goal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function deleteGoal(req, res) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    await database.connect();

    // Check if goal exists and belongs to user
    const existingGoal = await database.get(
      'SELECT id FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Delete the goal (habits will be deleted automatically due to CASCADE)
    await database.run(
      'DELETE FROM user_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function getGoal(req, res) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    await database.connect();

    const goal = await database.get(
      `SELECT g.*, 
              COUNT(h.id) as habits_count,
              COUNT(CASE WHEN hp.status = 'completed' THEN 1 END) as completed_habits_today
       FROM user_goals g
       LEFT JOIN habits h ON g.id = h.goal_id AND h.is_active = 1
       LEFT JOIN habit_progress hp ON h.id = hp.habit_id AND date(hp.date) = date('now')
       WHERE g.id = ? AND g.user_id = ?
       GROUP BY g.id`,
      [goalId, userId]
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Get associated habits
    const habits = await database.all(
      'SELECT * FROM habits WHERE goal_id = ? AND user_id = ? ORDER BY created_at DESC',
      [goalId, userId]
    );

    res.json({ goal, habits });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

module.exports = {
  validateGoal,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoal
};
