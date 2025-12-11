const database = require('./database');

async function migrate() {
  try {
    await database.connect();
    
    // Create users table
    await database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        email_verified BOOLEAN DEFAULT 0,
        reset_token TEXT,
        reset_token_expires DATETIME
      )
    `);

    // Create user goals table
    await database.run(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal_type TEXT NOT NULL, -- 'fitness', 'productivity', 'health', etc.
        title TEXT NOT NULL,
        description TEXT,
        target_value INTEGER,
        current_value INTEGER DEFAULT 0,
        deadline DATE,
        priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
        status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create habits table
    await database.run(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL, -- 'daily', 'weekly', 'custom'
        frequency_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
        frequency_value INTEGER DEFAULT 1, -- times per frequency_type
        target_days TEXT, -- JSON array of days ['monday', 'tuesday', etc.]
        reminder_time TIME,
        is_active BOOLEAN DEFAULT 1,
        streak_count INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (goal_id) REFERENCES user_goals (id) ON DELETE SET NULL
      )
    `);

    // Create habit progress table
    await database.run(`
      CREATE TABLE IF NOT EXISTS habit_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL, -- 'completed', 'missed', 'skipped'
        completed_at DATETIME,
        notes TEXT,
        mood_rating INTEGER, -- 1-5 scale
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(habit_id, date)
      )
    `);

    // Create user profiles table for onboarding data
    await database.run(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        age INTEGER,
        gender TEXT,
        occupation TEXT,
        timezone TEXT DEFAULT 'UTC',
        primary_goals JSON, -- Array of goal types
        personality_traits JSON, -- Array of traits from onboarding
        lifestyle_preferences JSON,
        experience_level TEXT, -- 'beginner', 'intermediate', 'advanced'
        notification_preferences JSON,
        onboarding_completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

migrate();
