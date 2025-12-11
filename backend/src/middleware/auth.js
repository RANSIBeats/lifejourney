const { verifyToken } = require('../utils/jwt');
const database = require('../utils/database');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    await database.connect();
    const user = await database.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await database.close();
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    req.user = null;
    return next();
  }

  try {
    await database.connect();
    const user = await database.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    req.user = user && user.is_active ? user : null;
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  } finally {
    await database.close();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
};
