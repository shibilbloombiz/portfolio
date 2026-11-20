const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// GET /api/website-content (Public - all sections)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM website_content').all();
    const result = {};
    for (const r of rows) {
      try {
        result[r.key] = JSON.parse(r.content);
      } catch (e) {
        result[r.key] = r.content;
      }
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch website content' });
  }
});

// GET /api/website-content/:key
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const row = db.prepare('SELECT * FROM website_content WHERE key = ?').get(key);
    if (!row) {
      return res.status(404).json({ error: 'Section content not found' });
    }
    return res.json({ key: row.key, content: JSON.parse(row.content), updated_at: row.updated_at });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch content section' });
  }
});

// PUT /api/website-content/:key (Admin protected)
router.put('/:key', authenticateAdmin, (req, res) => {
  try {
    const { key } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content payload is required' });
    }

    const payloadStr = typeof content === 'string' ? content : JSON.stringify(content);
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT key FROM website_content WHERE key = ?').get(key);
    if (!existing) {
      db.prepare('INSERT INTO website_content (key, content, updated_at) VALUES (?, ?, ?)').run(key, payloadStr, now);
    } else {
      db.prepare('UPDATE website_content SET content = ?, updated_at = ? WHERE key = ?').run(payloadStr, now, key);
    }

    return res.json({ message: `Content for "${key}" saved successfully`, key, content });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update website content', details: err.message });
  }
});

module.exports = router;
