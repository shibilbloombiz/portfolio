const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// GET /api/seo-settings (Public)
router.get('/', (req, res) => {
  try {
    const seo = db.prepare('SELECT * FROM seo_settings WHERE id = 1').get();
    return res.json(seo || {});
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// PUT /api/seo-settings (Admin protected)
router.put('/', authenticateAdmin, (req, res) => {
  try {
    const {
      meta_title,
      meta_description,
      keywords,
      og_image,
      canonical_url,
      twitter_card
    } = req.body;

    const now = new Date().toISOString();
    const existing = db.prepare('SELECT id FROM seo_settings WHERE id = 1').get();

    if (!existing) {
      db.prepare(`
        INSERT INTO seo_settings (id, meta_title, meta_description, keywords, og_image, canonical_url, twitter_card, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `).run(meta_title, meta_description, keywords, og_image, canonical_url, twitter_card, now);
    } else {
      db.prepare(`
        UPDATE seo_settings SET
          meta_title = ?,
          meta_description = ?,
          keywords = ?,
          og_image = ?,
          canonical_url = ?,
          twitter_card = ?,
          updated_at = ?
        WHERE id = 1
      `).run(meta_title, meta_description, keywords, og_image, canonical_url, twitter_card, now);
    }

    const updated = db.prepare('SELECT * FROM seo_settings WHERE id = 1').get();
    return res.json({ message: 'SEO settings updated successfully', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

module.exports = router;
