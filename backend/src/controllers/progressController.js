const { body, validationResult } = require('express-validator');
const database = require('../utils/database');

const validateProgress = [
  body('status')
    .isIn(['completed', 'missed', 'skipped'])
    .withMessage('Status must be completed, missed, or skipped'),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('Completed at must be a valid ISO date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  body('moodRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Mood rating must be between 1 and 5')
];

async function getTodayProgress(req, res) {
  try {
    const userId = req.user.id;

    await database.connect();

    const todayProgress = await database.all(
      `SELECT hp.*, h.name as habit_name, h.category, h.frequency_type,
              g.title as goal_title
       FROM habit_progress hp
       JOIN habits h ON hp.habit_id = h.id
       LEFT JOIN user_goals g ON h.goal_id = g.id
       WHERE hp.user_id = ? AND date(hp.date) = date('now')
       ORDER BY h.created_at ASC`,
      [userId]
    );

    res.json({ progress: todayProgress });

  } catch (error) {
    console.error('Get today progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function updateHabitProgress(req, res) {
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
    const { status, completedAt, notes, moodRating } = req.body;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    await database.connect();

    // Verify habit belongs to user
    const habit = await database.get(
      'SELECT id, name FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Check if progress entry exists for today
    const existingProgress = await database.get(
      'SELECT id FROM habit_progress WHERE habit_id = ? AND date = ?',
      [habitId, today]
    );

    let result;
    if (existingProgress) {
      // Update existing progress
      await database.run(
        `UPDATE habit_progress 
         SET status = ?, completed_at = ?, notes = ?, mood_rating = ?, updated_at = CURRENT_TIMESTAMP
         WHERE habit_id = ? AND date = ?`,
        [
          status,
          completedAt || null,
          notes || null,
          moodRating || null,
          habitId,
          today
        ]
      );
      result = { id: existingProgress.id, action: 'updated' };
    } else {
      // Create new progress entry
      const progressResult = await database.run(
        `INSERT INTO habit_progress (habit_id, user_id, date, status, completed_at, notes, mood_rating) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          habitId,
          userId,
          today,
          status,
          completedAt || null,
          notes || null,
          moodRating || null
        ]
      );
      result = { id: progressResult.id, action: 'created' };
    }

    // Update habit streaks if completed
    if (status === 'completed') {
      await updateHabitStreaks(habitId, userId);
    } else if (status === 'missed') {
      // Reset streak if missed
      await database.run(
        'UPDATE habits SET streak_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [habitId, userId]
      );
    }

    const progress = await database.get(
      `SELECT hp.*, h.name as habit_name, h.category
       FROM habit_progress hp
       JOIN habits h ON hp.habit_id = h.id
       WHERE hp.habit_id = ? AND hp.date = ?`,
      [habitId, today]
    );

    res.json({
      message: `Progress ${result.action} successfully`,
      progress
    });

  } catch (error) {
    console.error('Update habit progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function getHabitProgressHistory(req, res) {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { startDate, endDate, limit = 30 } = req.query;

    await database.connect();

    // Verify habit belongs to user
    const habit = await database.get(
      'SELECT id, name FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    let query = `
      SELECT hp.*
      FROM habit_progress hp
      WHERE hp.habit_id = ? AND hp.user_id = ?
    `;
    let params = [habitId, userId];

    if (startDate) {
      query += ' AND date(hp.date) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date(hp.date) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY hp.date DESC LIMIT ?';
    params.push(parseInt(limit));

    const progressHistory = await database.all(query, params);

    res.json({
      habit,
      progress: progressHistory
    });

  } catch (error) {
    console.error('Get habit progress history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function getProgressStats(req, res) {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { period = '30' } = req.query;

    await database.connect();

    let dateFilter = '';
    if (period === '7') {
      dateFilter = "AND date(hp.date) >= date('now', '-7 days')";
    } else if (period === '30') {
      dateFilter = "AND date(hp.date) >= date('now', '-30 days')";
    } else if (period === '90') {
      dateFilter = "AND date(hp.date) >= date('now', '-90 days')";
    }

    // If habitId is provided, get stats for specific habit
    let whereClause = 'hp.user_id = ?';
    let params = [userId];

    if (habitId) {
      whereClause += ' AND hp.habit_id = ?';
      params.push(habitId);
    }

    const stats = await database.get(
      `SELECT 
         COUNT(*) as total_entries,
         COUNT(CASE WHEN hp.status = 'completed' THEN 1 END) as completed_entries,
         COUNT(CASE WHEN hp.status = 'missed' THEN 1 END) as missed_entries,
         COUNT(CASE WHEN hp.status = 'skipped' THEN 1 END) as skipped_entries,
         ROUND(
           (COUNT(CASE WHEN hp.status = 'completed' THEN 1 END) * 100.0) / 
           NULLIF(COUNT(*), 0), 2
         ) as completion_rate,
         AVG(hp.mood_rating) as avg_mood_rating
       FROM habit_progress hp
       WHERE ${whereClause} ${dateFilter}`,
      params
    );

    // Get streak information
    const streakInfo = await database.get(
      `SELECT 
         h.streak_count,
         h.best_streak,
         CASE WHEN hp.status = 'completed' THEN 1 ELSE 0 END as is_completed
       FROM habits h
       LEFT JOIN habit_progress hp ON h.id = hp.habit_id AND hp.date = date('now')
       WHERE h.user_id = ? ${habitId ? 'AND h.id = ?' : ''}`,
      habitId ? [userId, habitId] : [userId]
    );

    res.json({
      stats,
      streak: streakInfo
    });

  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function bulkUpdateProgress(req, res) {
  try {
    const userId = req.user.id;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    await database.connect();

    const results = [];
    const today = new Date().toISOString().split('T')[0];

    for (const update of updates) {
      const { habitId, status, completedAt, notes, moodRating } = update;

      // Verify habit belongs to user
      const habit = await database.get(
        'SELECT id FROM habits WHERE id = ? AND user_id = ?',
        [habitId, userId]
      );

      if (!habit) {
        results.push({
          habitId,
          error: 'Habit not found'
        });
        continue;
      }

      try {
        // Check if progress entry exists for today
        const existingProgress = await database.get(
          'SELECT id FROM habit_progress WHERE habit_id = ? AND date = ?',
          [habitId, today]
        );

        if (existingProgress) {
          await database.run(
            `UPDATE habit_progress 
             SET status = ?, completed_at = ?, notes = ?, mood_rating = ?, updated_at = CURRENT_TIMESTAMP
             WHERE habit_id = ? AND date = ?`,
            [status, completedAt || null, notes || null, moodRating || null, habitId, today]
          );
        } else {
          await database.run(
            `INSERT INTO habit_progress (habit_id, user_id, date, status, completed_at, notes, mood_rating) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [habitId, userId, today, status, completedAt || null, notes || null, moodRating || null]
          );
        }

        // Update streaks if completed
        if (status === 'completed') {
          await updateHabitStreaks(habitId, userId);
        } else if (status === 'missed') {
          await database.run(
            'UPDATE habits SET streak_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [habitId, userId]
          );
        }

        results.push({
          habitId,
          success: true,
          status
        });

      } catch (error) {
        console.error(`Error updating habit ${habitId}:`, error);
        results.push({
          habitId,
          error: 'Update failed'
        });
      }
    }

    res.json({
      message: 'Bulk update completed',
      results
    });

  } catch (error) {
    console.error('Bulk update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function updateHabitStreaks(habitId, userId) {
  try {
    await database.connect();

    // Get current streak count
    const habit = await database.get(
      'SELECT streak_count FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    );

    if (!habit) return;

    const newStreak = habit.streak_count + 1;

    // Update streak count and best streak if needed
    await database.run(
      `UPDATE habits 
       SET streak_count = ?, 
           best_streak = CASE WHEN ? > best_streak THEN ? ELSE best_streak END,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [newStreak, newStreak, newStreak, habitId, userId]
    );

  } catch (error) {
    console.error('Update habit streaks error:', error);
  } finally {
    await database.close();
  }
}

module.exports = {
  validateProgress,
  getTodayProgress,
  updateHabitProgress,
  getHabitProgressHistory,
  getProgressStats,
  bulkUpdateProgress
};
