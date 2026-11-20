const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Also serve public images if requested directly
const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
app.use('/images', express.static(publicImagesDir));

// Mount Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/projects', require('./routes/projects.cjs'));
app.use('/api/media', require('./routes/media.cjs'));
app.use('/api/social-links', require('./routes/social.cjs'));
app.use('/api/contact-settings', require('./routes/contact.cjs'));
app.use('/api/website-content', require('./routes/content.cjs'));
app.use('/api/seo-settings', require('./routes/seo.cjs'));
app.use('/api/general-settings', require('./routes/settings.cjs'));
app.use('/api/enquiries', require('./routes/enquiries.cjs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback to index.html for client routes in production
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BloomBiz Portfolio CMS Backend running on http://localhost:${PORT}`);
});
