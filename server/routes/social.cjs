const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// GET /api/social-links
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status || 'all'; // 'all', 'active', 'inactive'

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(platform LIKE ? OR label LIKE ? OR url LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status === 'active') {
      conditions.push('is_active = 1');
    } else if (status === 'inactive') {
      conditions.push('is_active = 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM social_links ${whereClause}`;
    const totalItems = db.prepare(countQuery).get(...params).total;

    const dataQuery = `
      SELECT * FROM social_links
      ${whereClause}
      ORDER BY display_order ASC, id ASC
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(dataQuery).all(...params, limit, offset);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.json({
      data: rows.map(r => ({ ...r, is_active: Boolean(r.is_active) })),
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch social links' });
  }
});

// POST /api/social-links (Admin protected)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { platform, url, label, is_active } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ error: 'Platform and URL are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM social_links').get().maxOrder || 0;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO social_links (platform, url, label, is_active, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      platform.trim(),
      url.trim(),
      label ? label.trim() : platform.trim(),
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      maxOrder + 1,
      now
    );

    const created = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({
      message: 'Social link created',
      social: { ...created, is_active: Boolean(created.is_active) }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create social link', details: err.message });
  }
});

// PUT /api/social-links/:id (Admin protected)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, label, is_active, display_order } = req.body;

    const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    db.prepare(`
      UPDATE social_links SET
        platform = ?,
        url = ?,
        label = ?,
        is_active = ?,
        display_order = ?
      WHERE id = ?
    `).run(
      platform !== undefined ? platform.trim() : existing.platform,
      url !== undefined ? url.trim() : existing.url,
      label !== undefined ? label.trim() : existing.label,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      display_order !== undefined ? display_order : existing.display_order,
      id
    );

    const updated = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    return res.json({
      message: 'Social link updated',
      social: { ...updated, is_active: Boolean(updated.is_active) }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update social link' });
  }
});

// DELETE /api/social-links/:id (Admin protected)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    db.prepare('DELETE FROM social_links WHERE id = ?').run(id);
    return res.json({ message: 'Social link deleted', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete social link' });
  }
});

// PATCH /api/social-links/:id/toggle (Admin protected)
router.patch('/:id/toggle', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    const nextState = existing.is_active ? 0 : 1;
    db.prepare('UPDATE social_links SET is_active = ? WHERE id = ?').run(nextState, id);

    return res.json({ message: `Social link ${nextState ? 'enabled' : 'disabled'}`, is_active: Boolean(nextState) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle social link' });
  }
});

// PUT /api/social-links/reorder/batch (Admin protected)
router.put('/reorder/batch', authenticateAdmin, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const update = db.prepare('UPDATE social_links SET display_order = ? WHERE id = ?');
    const transaction = db.transaction((list) => {
      for (const item of list) {
        update.run(item.display_order, item.id);
      }
    });
    transaction(items);

    return res.json({ message: 'Social links reordered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder social links' });
  }
});

module.exports = router;
