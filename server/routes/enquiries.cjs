const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// POST /api/enquiries - Public submission from /contact page
router.post('/', (req, res) => {
  try {
    const { name, email, phone, service, budget, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO enquiries (name, email, phone, service, budget, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `);

    const result = insert.run(
      name.trim(),
      email.trim(),
      phone ? phone.trim() : '',
      service ? service.trim() : '',
      budget ? budget.trim() : '',
      message ? message.trim() : '',
      now
    );

    return res.status(201).json({
      message: 'Thank you for reaching out. We have received your inquiry.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Error saving enquiry:', err);
    return res.status(500).json({ error: 'Failed to submit enquiry', details: err.message });
  }
});

// GET /api/enquiries - Paginated enquiries list (Admin protected)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status || 'all'; // 'all', 'new', 'in_progress', 'completed', 'archived'

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR message LIKE ? OR service LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM enquiries ${whereClause}`;
    const totalItems = db.prepare(countQuery).get(...params).total;

    const dataQuery = `
      SELECT * FROM enquiries
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(dataQuery).all(...params, limit, offset);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.json({
      data: rows,
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// PATCH /api/enquiries/:id/status (Admin protected)
router.patch('/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in_progress', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid enquiry status' });
    }

    db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, id);
    return res.json({ message: 'Status updated', id, status });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update enquiry status' });
  }
});

// DELETE /api/enquiries/:id (Admin protected)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
    return res.json({ message: 'Enquiry deleted', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

module.exports = router;
