const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// Configure Multer storage
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only images and videos are allowed.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter
});

// GET /api/media - Server-side paginated media library
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const type = req.query.type || 'all'; // 'all', 'image', 'video'
    const project = req.query.project || 'all'; // project_slug or 'all'
    const sortBy = req.query.sortBy || 'id';
    const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(filename LIKE ? OR original_name LIKE ? OR alt_text LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (type !== 'all') {
      conditions.push('media_type = ?');
      params.push(type);
    }

    if (project !== 'all') {
      conditions.push('project_slug = ?');
      params.push(project);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = ['id', 'size', 'filename', 'created_at'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'id';

    // Count
    const countQuery = `SELECT COUNT(*) as total FROM media ${whereClause}`;
    const totalItems = db.prepare(countQuery).get(...params).total;

    // Fetch
    const dataQuery = `
      SELECT * FROM media
      ${whereClause}
      ORDER BY ${safeSortBy} ${sortOrder}
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
    console.error('Error fetching media:', err);
    return res.status(500).json({ error: 'Failed to fetch media assets', details: err.message });
  }
});

// POST /api/media/upload - Multi-file upload (Admin protected)
router.post('/upload', authenticateAdmin, (req, res) => {
  upload.array('files', 12)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload.' });
    }

    try {
      const now = new Date().toISOString();
      const insert = db.prepare(`
        INSERT INTO media (filename, original_name, url, mime_type, size, media_type, project_slug, alt_text, created_at)
        VALUES (@filename, @original_name, @url, @mime_type, @size, @media_type, @project_slug, @alt_text, @created_at)
      `);

      const uploadedMedia = [];
      const projectSlug = req.body.project_slug || null;

      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';
        const publicUrl = `/uploads/${file.filename}`;

        const item = {
          filename: file.filename,
          original_name: file.originalname,
          url: publicUrl,
          mime_type: file.mimetype,
          size: file.size,
          media_type: mediaType,
          project_slug: projectSlug,
          alt_text: path.basename(file.originalname, path.extname(file.originalname)),
          created_at: now
        };

        const result = insert.run(item);
        uploadedMedia.push({ ...item, id: result.lastInsertRowid });
      }

      return res.status(201).json({
        message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
        files: uploadedMedia
      });
    } catch (dbErr) {
      console.error('Database error saving media:', dbErr);
      return res.status(500).json({ error: 'Failed to save media metadata', details: dbErr.message });
    }
  });
});

// PUT /api/media/:id - Update media metadata (alt_text, project_slug)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, project_slug } = req.body;

    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!media) {
      return res.status(404).json({ error: 'Media file not found' });
    }

    db.prepare('UPDATE media SET alt_text = ?, project_slug = ? WHERE id = ?').run(
      alt_text !== undefined ? alt_text : media.alt_text,
      project_slug !== undefined ? project_slug : media.project_slug,
      id
    );

    const updated = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    return res.json({ message: 'Media metadata updated', media: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update media metadata' });
  }
});

// DELETE /api/media/:id - Delete media from DB and disk
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!media) {
      return res.status(404).json({ error: 'Media file not found' });
    }

    // Delete file from disk if it was uploaded to uploadsDir
    if (media.url.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, media.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.warn(`Could not delete file ${filePath} from disk:`, fileErr.message);
        }
      }
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    return res.json({ message: 'Media file deleted successfully', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete media', details: err.message });
  }
});

module.exports = router;
