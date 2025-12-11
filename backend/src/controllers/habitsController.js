const { body, validationResult } = require('express-validator');
const database = require('../utils/database');

const validateHabit = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('category')
    .isIn(['daily', 'weekly', 'custom'])
    .withMessage('Category must be daily, weekly, or custom'),
  body('frequencyType')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency type must be daily, weekly, or monthly'),
  body('frequencyValue')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Frequency value must be between 1 and 30'),
  body('targetDays')
    .optional()
    .isArray()
    .withMessage('Target days must be an array'),
  body('reminderTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder time must be in HH:MM format'),
  body('goalId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Goal ID must be a positive integer')
];

async function getHabits(req, res) {
  try {
    const userId = req.user.id;

    await database.connect();

    const habits = await database.all(
      `SELECT h.*, 
              g.title as goal_title,
              COUNT(hp.id) as total_entries,
              COUNT(CASE WHEN hp.status = 'completed' THEN 1 END) as completed_entries,
              COUNT(CASE WHEN hp.date = date('now') THEN 1 END) as today_entry
       FROM habits h
       LEFT JOIN user_goals g ON h.goal_id = g.id
       LEFT JOIN habit_progress hp ON h.id = hp.habit_id
       WHERE h.user_id = ?
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json({ habits });

  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function getActiveHabits(req, res) {
  try {
    const userId = req.user.id;

    await database.connect();

    const habits = await database.all(
      `SELECT h.*, 
              g.title as goal_title,
              CASE WHEN hp.date = date('now') THEN hp.status ELSE NULL END as today_status
       FROM habits h
       LEFT JOIN user_goals g ON h.goal_id = g.id
       LEFT JOIN habit_progress hp ON h.id = hp.habit_id AND hp.date = date('now')
       WHERE h.user_id = ? AND h.is_active = 1
       ORDER BY h.reminder_time ASC, h.created_at DESC`,
      [userId]
    );

    res.json({ habits });

  } catch (error) {
    console.error('Get active habits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function createHabit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { 
      name, 
      description, 
      category, 
      frequencyType, 
      frequencyValue = 1, 
      targetDays, 
      reminderTime, 
      goalId 
    } = req.body;

    await database.connect();

    // If goalId is provided, verify it belongs to user
    if (goalId) {
      const goal = await database.get(
        'SELECT id FROM user_goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      if (!goal) {
        return res.status(400).json({ error: 'Invalid goal ID' });
      }
    }

    const result = await database.run(
      `INSERT INTO habits 
       (user_id, goal_id, name, description, category, frequency_type, frequency_value, target_days, reminder_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        goalId || null, 
        name, 
        description || null, 
        category, 
        frequencyType, 
        frequencyValue,
        targetDays ? JSON.stringify(targetDays) : null,
        reminderTime || null
      ]
    );

    const habit = await database.get(
      'SELECT h.*, g.title as goal_title FROM habits h LEFT JOIN user_goals g ON h.goal_id = g.id WHERE h.id = ? AND h.user_id = ?',
      [result.id, userId]
    );

    res.status(201).json({
      message: 'Habit created successfully',
      habit
    });

  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function updateHabit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const habitId = req.params.id;
    const { 
      name, 
      description, 
      category, 
      frequencyType, 
      frequencyValue, 
      targetDays, 
      reminderTime, 
      goalId,
      isActive 
    } = req.body;

    await database.connect();

    // Check if habit exists and belongs to user
    const existingHabit = await database.get(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // If goalId is provided, verify it belongs to user
    if (goalId) {
      const goal = await database.get(
        'SELECT id FROM user_goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      if (!goal) {
        return res.status(400).json({ error: 'Invalid goal ID' });
      }
    }

    await database.run(
      `UPDATE habits 
       SET name = ?, description = ?, category = ?, frequency_type = ?, 
           frequency_value = ?, target_days = ?, reminder_time = ?, goal_id = ?,
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        name,
        description || null,
        category,
        frequencyType,
        frequencyValue || 1,
        targetDays ? JSON.stringify(targetDays) : null,
        reminderTime || null,
        goalId || null,
        isActive !== undefined ? isActive : 1,
        habitId,
        userId
      ]
    );

    const habit = await database.get(
      'SELECT h.*, g.title as goal_title FROM habits h LEFT JOIN user_goals g ON h.goal_id = g.id WHERE h.id = ? AND h.user_id = ?',
      [habitId, userId]
    );

    res.json({
      message: 'Habit updated successfully',
      habit
    });

  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function deleteHabit(req, res) {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;

    await database.connect();

    // Check if habit exists and belongs to user
    const existingHabit = await database.get(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Delete the habit (progress will be deleted automatically due to CASCADE)
    await database.run(
      'DELETE FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    res.json({ message: 'Habit deleted successfully' });

  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function toggleHabitStatus(req, res) {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;

    await database.connect();

    // Get current habit status
    const habit = await database.get(
      'SELECT is_active FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Toggle status
    const newStatus = habit.is_active ? 0 : 1;

    await database.run(
      'UPDATE habits SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newStatus, habitId, userId]
    );

    const updatedHabit = await database.get(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    res.json({
      message: `Habit ${newStatus ? 'activated' : 'deactivated'} successfully`,
      habit: updatedHabit
    });

  } catch (error) {
    console.error('Toggle habit status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

module.exports = {
  validateHabit,
  getHabits,
  getActiveHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitStatus
};
