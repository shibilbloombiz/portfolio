const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { authenticateAdmin } = require('../middleware/auth.cjs');

// Helper to format project row from DB (parse JSON strings)
function formatProject(row) {
  if (!row) return null;
  return {
    ...row,
    principles: row.principles ? JSON.parse(row.principles) : [],
    media: row.media ? JSON.parse(row.media) : [],
    is_featured: Boolean(row.is_featured)
  };
}

// GET /api/projects - Paginated search/filter/sort for Admin & Public
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status || 'all'; // 'all', 'published', 'draft'
    const category = req.query.category || 'all';
    const featured = req.query.featured; // '1', '0', 'true', 'false', undefined
    const sortBy = req.query.sortBy || 'display_order';
    const sortOrder = (req.query.sortOrder || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(title LIKE ? OR slug LIKE ? OR description LIKE ? OR sector LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (category !== 'all') {
      conditions.push('sector = ?');
      params.push(category);
    }

    if (featured !== undefined && featured !== 'all') {
      const isFeat = featured === '1' || featured === 'true' ? 1 : 0;
      conditions.push('is_featured = ?');
      params.push(isFeat);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy column to avoid SQL injection
    const allowedSortColumns = ['display_order', 'title', 'year', 'created_at', 'updated_at', 'status', 'id'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'display_order';

    // Count total matching items
    const countQuery = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
    const totalItems = db.prepare(countQuery).get(...params).total;

    // Fetch page data
    const dataQuery = `
      SELECT * FROM projects
      ${whereClause}
      ORDER BY ${safeSortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(dataQuery).all(...params, limit, offset);
    const projects = rows.map(formatProject);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.json({
      data: projects,
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// GET /api/projects/all - Fetch all published projects (useful for frontend navigation / preloading)
router.get('/all', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM projects WHERE status = ? ORDER BY display_order ASC').all('published');
    return res.json(rows.map(formatProject));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch all projects', details: err.message });
  }
});

// GET /api/projects/categories - Get unique sectors/categories for filter dropdowns
router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT sector FROM projects WHERE sector IS NOT NULL AND sector != "" ORDER BY sector ASC').all();
    return res.json(rows.map(r => r.sector));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/projects/:idOrSlug
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let row;
    if (/^\d+$/.test(idOrSlug)) {
      row = db.prepare('SELECT * FROM projects WHERE id = ?').get(idOrSlug);
    } else {
      row = db.prepare('SELECT * FROM projects WHERE slug = ?').get(idOrSlug);
    }

    if (!row) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(formatProject(row));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project', details: err.message });
  }
});

// POST /api/projects - Create project (Admin protected)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const {
      slug, title, description, sector, scope, year, tone, problem, decision,
      principles, result, external_url, next_slug, next_title, next_tone,
      media, status, is_featured, display_order
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    // Auto-generate slug if not provided
    const safeSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(safeSlug);
    if (existing) {
      return res.status(400).json({ error: `A project with slug "${safeSlug}" already exists.` });
    }

    // Determine default display order if not specified
    let order = display_order;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM projects').get().maxOrder || 0;
      order = maxOrder + 1;
    }

    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO projects (
        slug, title, description, sector, scope, year, tone, problem, decision,
        principles, result, external_url, next_slug, next_title, next_tone,
        media, status, is_featured, display_order, created_at, updated_at
      ) VALUES (
        @slug, @title, @description, @sector, @scope, @year, @tone, @problem, @decision,
        @principles, @result, @external_url, @next_slug, @next_title, @next_tone,
        @media, @status, @is_featured, @display_order, @created_at, @updated_at
      )
    `);

    const resultObj = insert.run({
      slug: safeSlug,
      title: title.trim(),
      description: description || '',
      sector: sector || '',
      scope: scope || '',
      year: year || new Date().getFullYear().toString(),
      tone: tone || '#121110',
      problem: problem || '',
      decision: decision || '',
      principles: JSON.stringify(Array.isArray(principles) ? principles : []),
      result: result || '',
      external_url: external_url || '',
      next_slug: next_slug || '',
      next_title: next_title || '',
      next_tone: next_tone || '#121110',
      media: JSON.stringify(Array.isArray(media) ? media : []),
      status: status === 'draft' ? 'draft' : 'published',
      is_featured: is_featured ? 1 : 0,
      display_order: order,
      created_at: now,
      updated_at: now
    });

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(resultObj.lastInsertRowid);
    return res.status(201).json({
      message: 'Project created successfully',
      project: formatProject(newProject)
    });
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
});

// PUT /api/projects/:id - Edit project (Admin protected)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      slug, title, description, sector, scope, year, tone, problem, decision,
      principles, result, external_url, next_slug, next_title, next_tone,
      media, status, is_featured, display_order
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const safeSlug = (slug || existing.slug)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug collision with other projects
    const slugOwner = db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(safeSlug, id);
    if (slugOwner) {
      return res.status(400).json({ error: `Another project is already using the slug "${safeSlug}".` });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE projects SET
        slug = @slug,
        title = @title,
        description = @description,
        sector = @sector,
        scope = @scope,
        year = @year,
        tone = @tone,
        problem = @problem,
        decision = @decision,
        principles = @principles,
        result = @result,
        external_url = @external_url,
        next_slug = @next_slug,
        next_title = @next_title,
        next_tone = @next_tone,
        media = @media,
        status = @status,
        is_featured = @is_featured,
        display_order = @display_order,
        updated_at = @updated_at
      WHERE id = @id
    `).run({
      id,
      slug: safeSlug,
      title: title.trim(),
      description: description !== undefined ? description : existing.description,
      sector: sector !== undefined ? sector : existing.sector,
      scope: scope !== undefined ? scope : existing.scope,
      year: year !== undefined ? year : existing.year,
      tone: tone !== undefined ? tone : existing.tone,
      problem: problem !== undefined ? problem : existing.problem,
      decision: decision !== undefined ? decision : existing.decision,
      principles: principles !== undefined ? JSON.stringify(Array.isArray(principles) ? principles : []) : existing.principles,
      result: result !== undefined ? result : existing.result,
      external_url: external_url !== undefined ? external_url : existing.external_url,
      next_slug: next_slug !== undefined ? next_slug : existing.next_slug,
      next_title: next_title !== undefined ? next_title : existing.next_title,
      next_tone: next_tone !== undefined ? next_tone : existing.next_tone,
      media: media !== undefined ? JSON.stringify(Array.isArray(media) ? media : []) : existing.media,
      status: status !== undefined ? status : existing.status,
      is_featured: is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      display_order: display_order !== undefined ? display_order : existing.display_order,
      updated_at: now
    });

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return res.json({
      message: 'Project updated successfully',
      project: formatProject(updated)
    });
  } catch (err) {
    console.error('Error updating project:', err);
    return res.status(500).json({ error: 'Failed to update project', details: err.message });
  }
});

// DELETE /api/projects/:id - Delete project (Admin protected)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return res.json({ message: `Project "${project.title}" deleted successfully`, id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});

// POST /api/projects/:id/duplicate - Duplicate project (Admin protected)
router.post('/:id/duplicate', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const newTitle = `${project.title} (Copy)`;
    let newSlug = `${project.slug}-copy`;
    let counter = 1;
    while (db.prepare('SELECT id FROM projects WHERE slug = ?').get(newSlug)) {
      counter++;
      newSlug = `${project.slug}-copy-${counter}`;
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM projects').get().maxOrder || 0;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO projects (
        slug, title, description, sector, scope, year, tone, problem, decision,
        principles, result, external_url, next_slug, next_title, next_tone,
        media, status, is_featured, display_order, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, 'draft', ?, ?, ?, ?
      )
    `);

    const resultObj = insert.run(
      newSlug,
      newTitle,
      project.description,
      project.sector,
      project.scope,
      project.year,
      project.tone,
      project.problem,
      project.decision,
      project.principles,
      project.result,
      project.external_url,
      project.next_slug,
      project.next_title,
      project.next_tone,
      project.media,
      0, // not featured by default
      maxOrder + 1,
      now,
      now
    );

    const duplicated = db.prepare('SELECT * FROM projects WHERE id = ?').get(resultObj.lastInsertRowid);
    return res.status(201).json({
      message: `Project duplicated as "${newTitle}"`,
      project: formatProject(duplicated)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to duplicate project', details: err.message });
  }
});

// PATCH /api/projects/:id/status - Toggle published / draft (Admin protected)
router.patch('/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const nextStatus = req.body.status || (project.status === 'published' ? 'draft' : 'published');
    const now = new Date().toISOString();

    db.prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ?').run(nextStatus, now, id);

    return res.json({
      message: `Project status set to ${nextStatus}`,
      id: project.id,
      status: nextStatus
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle project status' });
  }
});

// PUT /api/projects/reorder - Bulk reorder projects (Admin protected)
router.put('/reorder/batch', authenticateAdmin, (req, res) => {
  try {
    const { items } = req.body; // array of { id, display_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const updateStmt = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?');
    const transaction = db.transaction((updates) => {
      for (const item of updates) {
        updateStmt.run(item.display_order, item.id);
      }
    });

    transaction(items);
    return res.json({ message: 'Projects reordered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder projects', details: err.message });
  }
});

module.exports = router;
