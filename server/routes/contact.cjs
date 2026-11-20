const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// GET /api/contact-settings (Public)
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM contact_settings WHERE id = 1').get();
    return res.json(settings || {});
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch contact settings' });
  }
});

// PUT /api/contact-settings (Admin protected)
router.put('/', authenticateAdmin, (req, res) => {
  try {
    const {
      whatsapp_number,
      whatsapp_message,
      email,
      phone,
      enquiry_url,
      booking_url,
      address,
      timezone
    } = req.body;

    const now = new Date().toISOString();
    const existing = db.prepare('SELECT id FROM contact_settings WHERE id = 1').get();

    if (!existing) {
      db.prepare(`
        INSERT INTO contact_settings (id, whatsapp_number, whatsapp_message, email, phone, enquiry_url, booking_url, address, timezone, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(whatsapp_number, whatsapp_message, email, phone, enquiry_url, booking_url, address, timezone, now);
    } else {
      db.prepare(`
        UPDATE contact_settings SET
          whatsapp_number = ?,
          whatsapp_message = ?,
          email = ?,
          phone = ?,
          enquiry_url = ?,
          booking_url = ?,
          address = ?,
          timezone = ?,
          updated_at = ?
        WHERE id = 1
      `).run(whatsapp_number, whatsapp_message, email, phone, enquiry_url, booking_url, address, timezone, now);
    }

    const updated = db.prepare('SELECT * FROM contact_settings WHERE id = 1').get();
    return res.json({ message: 'Contact settings updated successfully', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update contact settings', details: err.message });
  }
});

module.exports = router;
