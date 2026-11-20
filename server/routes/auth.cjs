const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.cjs');
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth.cjs');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Update last login
  const now = new Date().toISOString();
  db.prepare('UPDATE admin_users SET last_login = ? WHERE id = ?').run(now, user.id);

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({
    message: 'Login successful',
    token,
    user: payload
  });
});

// GET /api/auth/me
router.get('/me', authenticateAdmin, (req, res) => {
  const user = db.prepare('SELECT id, username, name, email, avatar, created_at, last_login FROM admin_users WHERE id = ?').get(req.admin.id);
  if (!user) {
    return res.status(404).json({ error: 'Admin user not found' });
  }
  return res.json({ user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  return res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.admin.id);

  return res.json({ message: 'Password updated successfully' });
});

module.exports = router;
