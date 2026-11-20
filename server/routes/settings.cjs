const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// GET /api/general-settings (Public)
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM general_settings WHERE id = 1').get();
    return res.json(settings || {});
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch general settings' });
  }
});

// PUT /api/general-settings (Admin protected)
router.put('/', authenticateAdmin, (req, res) => {
  try {
    const {
      site_title,
      company_name,
      tagline,
      contact_email,
      timezone,
      maintenance_mode
    } = req.body;

    const now = new Date().toISOString();
    const existing = db.prepare('SELECT id FROM general_settings WHERE id = 1').get();

    if (!existing) {
      db.prepare(`
        INSERT INTO general_settings (id, site_title, company_name, tagline, contact_email, timezone, maintenance_mode, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `).run(site_title, company_name, tagline, contact_email, timezone, maintenance_mode ? 1 : 0, now);
    } else {
      db.prepare(`
        UPDATE general_settings SET
          site_title = ?,
          company_name = ?,
          tagline = ?,
          contact_email = ?,
          timezone = ?,
          maintenance_mode = ?,
          updated_at = ?
        WHERE id = 1
      `).run(site_title, company_name, tagline, contact_email, timezone, maintenance_mode ? 1 : 0, now);
    }

    const updated = db.prepare('SELECT * FROM general_settings WHERE id = 1').get();
    return res.json({ message: 'General settings updated successfully', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update general settings' });
  }
});

// GET /api/general-settings/stats - Quick stats for Admin Overview
router.get('/stats/summary', authenticateAdmin, (req, res) => {
  try {
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const publishedProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'published'").get().count;
    const draftProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'draft'").get().count;
    const totalMedia = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(size), 0) as totalBytes FROM media').get();
    const totalSocials = db.prepare('SELECT COUNT(*) as count FROM social_links').get().count;
    const activeSocials = db.prepare('SELECT COUNT(*) as count FROM social_links WHERE is_active = 1').get().count;
    const newEnquiries = db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'").get().count;
    const totalEnquiries = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;

    return res.json({
      projects: {
        total: totalProjects,
        published: publishedProjects,
        drafts: draftProjects
      },
      media: {
        total: totalMedia.count,
        totalBytes: totalMedia.totalBytes,
        totalFormatted: `${(totalMedia.totalBytes / (1024 * 1024)).toFixed(1)} MB`
      },
      socials: {
        total: totalSocials,
        active: activeSocials
      },
      enquiries: {
        new: newEnquiries,
        total: totalEnquiries
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
});

module.exports = router;
