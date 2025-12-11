const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const database = require('../utils/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/jwt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName } = req.body;

    await database.connect();

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await database.run(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName]
    );

    // Generate JWT token
    const token = generateToken(result.id);

    // Get the created user (without password)
    const newUser = await database.get(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    await database.connect();

    // Get user with password
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update last login
    await database.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: user.last_login
    };

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await database.connect();

    const user = await database.get(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await database.run(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // In production, send email here
    // For demo purposes, we'll return the token
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    await database.connect();

    // Find user with valid reset token
    const user = await database.get(
      `SELECT id FROM users 
       WHERE reset_token = ? AND reset_token_expires > datetime('now')`,
      [token]
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await database.run(
      `UPDATE users 
       SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = ?`,
      [passwordHash, user.id]
    );

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    await database.connect();

    const user = await database.get(
      'SELECT id, email, first_name, last_name, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    // Get user profile data
    const profile = await database.get(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    res.json({
      user,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, profileData } = req.body;

    await database.connect();

    // Update basic user info
    if (firstName || lastName) {
      await database.run(
        'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [firstName || req.user.first_name, lastName || req.user.last_name, userId]
      );
    }

    // Update or create profile data
    if (profileData) {
      const existingProfile = await database.get(
        'SELECT id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (existingProfile) {
        await database.run(
          `UPDATE user_profiles 
           SET age = ?, gender = ?, occupation = ?, timezone = ?, primary_goals = ?, 
               personality_traits = ?, lifestyle_preferences = ?, experience_level = ?, 
               notification_preferences = ?, onboarding_completed = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [
            profileData.age || null,
            profileData.gender || null,
            profileData.occupation || null,
            profileData.timezone || 'UTC',
            JSON.stringify(profileData.primaryGoals || []),
            JSON.stringify(profileData.personalityTraits || []),
            JSON.stringify(profileData.lifestylePreferences || {}),
            profileData.experienceLevel || null,
            JSON.stringify(profileData.notificationPreferences || {}),
            profileData.onboardingCompleted ? 1 : 0,
            userId
          ]
        );
      } else {
        await database.run(
          `INSERT INTO user_profiles 
           (user_id, age, gender, occupation, timezone, primary_goals, personality_traits, 
            lifestyle_preferences, experience_level, notification_preferences, onboarding_completed) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            profileData.age || null,
            profileData.gender || null,
            profileData.occupation || null,
            profileData.timezone || 'UTC',
            JSON.stringify(profileData.primaryGoals || []),
            JSON.stringify(profileData.personalityTraits || []),
            JSON.stringify(profileData.lifestylePreferences || {}),
            profileData.experienceLevel || null,
            JSON.stringify(profileData.notificationPreferences || {}),
            profileData.onboardingCompleted ? 1 : 0
          ]
        );
      }
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

module.exports = {
  validateRegistration,
  validateLogin,
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
};
