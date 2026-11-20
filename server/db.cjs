const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency and speed
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sector TEXT,
    scope TEXT,
    year TEXT,
    tone TEXT,
    problem TEXT,
    decision TEXT,
    principles TEXT, -- JSON array of strings
    result TEXT,
    external_url TEXT,
    next_slug TEXT,
    next_title TEXT,
    next_tone TEXT,
    media TEXT, -- JSON array of CaseMedia
    status TEXT DEFAULT 'published', -- 'published' or 'draft'
    is_featured INTEGER DEFAULT 0, -- 0 or 1
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
  CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    media_type TEXT NOT NULL, -- 'image' or 'video'
    project_slug TEXT,
    alt_text TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
  CREATE INDEX IF NOT EXISTS idx_media_project ON media(project_slug);

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_settings (
    id INTEGER PRIMARY KEY,
    whatsapp_number TEXT,
    whatsapp_message TEXT,
    email TEXT,
    phone TEXT,
    enquiry_url TEXT,
    booking_url TEXT,
    address TEXT,
    timezone TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS website_content (
    key TEXT PRIMARY KEY,
    content TEXT NOT NULL, -- JSON payload
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    og_image TEXT,
    canonical_url TEXT,
    twitter_card TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS general_settings (
    id INTEGER PRIMARY KEY,
    site_title TEXT,
    company_name TEXT,
    tagline TEXT,
    contact_email TEXT,
    timezone TEXT,
    maintenance_mode INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    budget TEXT,
    message TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'completed', 'archived'
    created_at TEXT NOT NULL
  );
`);

// Seed Default Admin User if none exists
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
if (adminCount === 0) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('bloombiz2026', salt);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO admin_users (username, password_hash, name, email, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('admin', passwordHash, 'BloomBiz Admin', 'info@bloombiz.com', '/images/bloombiz-logo.png', now);
  console.log('Seeded default admin user: admin / bloombiz2026');
}

// Seed Projects from existing portfolio data
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
if (projectCount === 0) {
  const seedProjects = [
    {
      slug: 'educarrt',
      title: 'EduCarrt',
      description: 'Study Abroad Consultant for a Brighter Future.',
      sector: 'EdTech & Global Advisory',
      scope: 'Web platform, advisory portal, admissions system',
      year: '2026',
      tone: '#10223d',
      problem: 'EduCarrt needed a trustworthy, authoritative digital presence that simplifies the daunting complexity of international university admissions, visa applications, and student loan consulting into an intuitive, calm journey.',
      decision: 'Constructed an editorial, high-clarity web platform focused on search velocity, course discovery, and step-by-step guidance. Restrained typography and a clean data hierarchy keep students focused and confident.',
      principles: [
        'Clear navigation paths tailored for both students and parents',
        'High-speed search across global university catalogs',
        'Restrained corporate navy palette conveying international credibility'
      ],
      result: 'A unified platform serving prospective students across 15+ destination countries. Consultation bookings increased by 42% within the first month of launch.',
      external_url: 'https://educarrt.com/',
      next_slug: 'ftx',
      next_title: 'FTX Detailing',
      next_tone: '#141f17',
      is_featured: 1,
      display_order: 1,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/educarrt-1.png',
          alt: 'EduCarrt: Study Abroad Consultant for a Brighter Future on desktop display',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'ftx',
      title: 'FTX Detailing',
      description: 'Precision, protection, perfection.',
      sector: 'Automotive & Luxury Care',
      scope: 'Brand identity, digital showroom, booking flow',
      year: '2026',
      tone: '#141f17',
      problem: 'High-end automotive ceramic coating and PPF (paint protection film) studios often struggle to stand out from generic garage websites. FTX required a hyper-modern digital showroom reflecting showroom-level perfection.',
      decision: 'Engineered a dark, ultra-sleek visual experience with neon emerald accents highlighting vehicular contours, metallic finishes, and clear package comparisons.',
      principles: [
        'Dark, cinematic aesthetic mimicking an exclusive studio bay',
        'Tactile typography evoking precision motorsport engineering',
        'Frictionless consultation and paint inspection booking system'
      ],
      result: 'Organic appointment requests doubled, establishing FTX as the premier high-ticket detailing atelier in its region.',
      external_url: 'https://ftxdetailing.com/',
      next_slug: 'future-safety',
      next_title: 'Future Safety',
      next_tone: '#241c14',
      is_featured: 1,
      display_order: 2,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/ftx-1.png',
          alt: 'FTX Detailing: Precision Protection Perfection on laptop display',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'future-safety',
      title: 'Future Safety',
      description: 'Industrial equipment & safety solutions built for modern workplaces.',
      sector: 'Industrial & Enterprise Equipment',
      scope: 'B2B e-commerce, technical catalog, brand identity',
      year: '2025',
      tone: '#241c14',
      problem: 'B2B industrial procurement is notoriously cluttered and outdated. Safety officers and industrial managers needed an efficient, zero-friction catalog to order safety gear and certified equipment.',
      decision: 'Built a robust catalog with high-contrast safety typography, industrial photography, and streamlined bulk RFP and WhatsApp instant inquiry integrations.',
      principles: [
        'Rigid structural grid providing quick navigation across 500+ SKUs',
        'Bold industrial hazard palette rooted in high-visibility amber and charcoal',
        'Direct WhatsApp and enterprise quotation request pipelines'
      ],
      result: 'Over 120 corporate accounts onboarded in Q3. Average quote turnaround time cut from 48 hours to 15 minutes.',
      external_url: 'https://futuresafety.com/',
      next_slug: 'gadco',
      next_title: 'Gadco',
      next_tone: '#18181a',
      is_featured: 0,
      display_order: 3,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/future-1.png',
          alt: 'Future Safety: Industrial Equipment & Safety Solutions on laptop display',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'gadco',
      title: 'Gadco',
      description: 'Redefine your lifestyle with timeless modern essentials.',
      sector: 'E-commerce & Consumer Lifestyle',
      scope: 'Headless storefront, inventory sync, brand narrative',
      year: '2025',
      tone: '#18181a',
      problem: 'A curated home and personal lifestyle brand needed a minimalist online storefront that let product photography speak without clutter or slow page transitions.',
      decision: 'Crafted a monochromatic, high-performance storefront with snappy micro-interactions, subtle scroll physics, and instant cart updates.',
      principles: [
        'Subtle tactile animations enhancing perceived product value',
        'Sub-second page transitions via prefetching and optimized image delivery',
        'Clean checkout funnel with Apple Pay and Google Pay integration'
      ],
      result: 'Mobile conversion rate increased by 31%. Store speed score attained 98/100 on Google PageSpeed Insights.',
      external_url: 'https://gadco.com/',
      next_slug: 'jakkur',
      next_title: 'Jakkur',
      next_tone: '#14243b',
      is_featured: 1,
      display_order: 4,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/gadco-1.png',
          alt: 'Gadco: Redefine Your Lifestyle on laptop display',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'jakkur',
      title: 'Jakkur',
      description: 'Engineering excellence delivered without delay.',
      sector: 'Infrastructure & Heavy Engineering',
      scope: 'Corporate website, project showcase, RFP engine',
      year: '2025',
      tone: '#14243b',
      problem: 'Large civil and infrastructural contracts depend heavily on demonstrated track record and technical credibility, but Jakkur’s old website lacked the scale and gravitas of its actual construction projects.',
      decision: 'Designed an architectural layout emphasizing massive aerial photography, concrete textures, and detailed project case specifications.',
      principles: [
        'Stately layout with generous negative space and heavy typography',
        'Interactive project map displaying completed and ongoing infrastructure developments',
        'Direct inquiry gateway for government and corporate procurement teams'
      ],
      result: 'Secured three multi-crore infrastructure bids within six months of launch, with procurement committees praising the transparent technical documentation.',
      external_url: 'https://jakkur.com/',
      next_slug: 'mocs',
      next_title: 'MOCS',
      next_tone: '#361b14',
      is_featured: 0,
      display_order: 5,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/jakkur-1.png',
          alt: 'Jakkur: Engineering Excellence on desktop display',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'mocs',
      title: 'MOCS',
      description: 'Artisanal charm crafted for timeless ease and natural comfort.',
      sector: 'Footwear & Artisan Fashion',
      scope: 'Brand identity, e-commerce flagship, packaging design',
      year: '2025',
      tone: '#361b14',
      problem: 'Handcrafted leather moccasins require tactile storytelling that justifies artisanal pricing against mass-manufactured fast fashion.',
      decision: 'Developed an earthy, warm editorial aesthetic rich in workshop photography, leather grain textures, and an interactive fit-guide.',
      principles: [
        'Warm terracotta and tanned leather tones conveying artisanal heritage',
        'Interactive sizing calculator reducing product returns by 45%',
        'Visual documentary of the crafting process from raw hide to finished stitch'
      ],
      result: 'Sold out first two production runs within 72 hours of launch. Return rate dropped to under 3.5%.',
      external_url: 'https://mocsartisan.com/',
      next_slug: 'nazzi',
      next_title: 'Nazzi Foods',
      next_tone: '#201912',
      is_featured: 1,
      display_order: 6,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/mocs-1.png',
          alt: 'MOCS: Artisanal Charm Crafted for Timeless Ease on tablet display',
          frame: 'Tablet / 1024 / 12 cols',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'nazzi',
      title: 'Nazzi Foods',
      description: 'Authentic culinary tradition packaged for the modern kitchen.',
      sector: 'Gourmet FMCG & Food Processing',
      scope: 'Brand narrative, distributor portal, retail locator',
      year: '2025',
      tone: '#201912',
      problem: 'A legacy spice and gourmet food producer needed to modernize its brand for younger supermarket shoppers and international export markets without losing its generational recipe roots.',
      decision: 'Crafted a rich, appetizing visual identity with deep bronze tones, macro ingredient photography, and a seamless retail store locator.',
      principles: [
        'Sensory-driven layout highlighting raw spices and heritage cooking techniques',
        'Interactive store locator powered by geolocation for supermarket stockists',
        'Dedicated export inquiry portal for international grocery distributors'
      ],
      result: 'Distribution expanded into four new overseas markets. Retail inquiries grew by 65%.',
      external_url: 'https://nazzifoods.com/',
      next_slug: 'novara',
      next_title: 'Novara',
      next_tone: '#1a1a1c',
      is_featured: 0,
      display_order: 7,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/nazzi-1.png',
          alt: 'Nazzi Foods: Authentic Culinary Tradition on mobile display',
          frame: 'Device / Studio 9:16',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'novara',
      title: 'Novara',
      description: 'Model Novara — minimalism engineered for acoustic purity.',
      sector: 'Consumer Electronics & High-End Audio',
      scope: 'Product launch site, 3D sound visualizer, pre-order engine',
      year: '2024',
      tone: '#1a1a1c',
      problem: 'Audiophiles expect extreme technical precision and acoustic fidelity. A new flagship reference headphone needed a digital experience matching Swedish industrial design standards.',
      decision: 'Built an uncompromising monochromatic experience with custom interactive frequency response graphs, exploded component views, and studio-grade audio previews.',
      principles: [
        'Monochromatic Scandinavian aesthetic celebrating raw aluminum and acoustic foam',
        'Interactive exploded view exploring driver magnetics and diaphragm engineering',
        'Direct pre-order engine with real-time manufacturing batch status'
      ],
      result: 'Pre-order batch of 2,500 units fully subscribed in 18 minutes. Featured on multiple global industrial design publications.',
      external_url: 'https://novaraaudio.com/',
      next_slug: 'sabka',
      next_title: 'Sabka Skill',
      next_tone: '#241538',
      is_featured: 1,
      display_order: 8,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/novara-1.png',
          alt: 'Novara: Minimalism Engineered for Acoustic Purity on tablet display',
          frame: 'Device / Studio 16:9',
          layout: 'lead'
        }
      ]
    },
    {
      slug: 'sabka',
      title: 'Sabka Skill',
      description: '10 Simple Steps to Your Placement.',
      sector: 'EdTech & Career Acceleration',
      scope: 'Learning management system, student dashboard, recruiter portal',
      year: '2024',
      tone: '#241538',
      problem: 'Tier-2 and Tier-3 engineering college students struggle with structured roadmap planning for top-tier tech placements. Sabka Skill needed an engaging, gamified career sprint platform.',
      decision: 'Created an empowering, violet-toned interactive curriculum tracking student progress through 10 milestone sprints, mock interviews, and automated resume reviews.',
      principles: [
        'Clear milestone roadmap eliminating student career anxiety',
        'Integrated coding challenges with instant compiler feedback',
        'Recruiter dashboard filtering verified placement-ready candidates'
      ],
      result: 'Over 8,000 students enrolled in year one. Placement rate surpassed 89% with an average starting package of 7.2 LPA.',
      external_url: 'https://sabkaskill.com/',
      next_slug: 'educarrt',
      next_title: 'EduCarrt',
      next_tone: '#10223d',
      is_featured: 0,
      display_order: 9,
      media: [
        {
          type: 'image',
          src: '/images/work/projects/sabka-1.png',
          alt: 'Sabka Skill: 10 Simple Steps to Your Placement on tablet display',
          frame: 'Tablet / 1024 / 12 cols',
          layout: 'lead'
        }
      ]
    }
  ];

  const insertProject = db.prepare(`
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

  const now = new Date().toISOString();
  for (const proj of seedProjects) {
    insertProject.run({
      slug: proj.slug,
      title: proj.title,
      description: proj.description,
      sector: proj.sector,
      scope: proj.scope,
      year: proj.year,
      tone: proj.tone,
      problem: proj.problem,
      decision: proj.decision,
      principles: JSON.stringify(proj.principles),
      result: proj.result,
      external_url: proj.external_url,
      next_slug: proj.next_slug,
      next_title: proj.next_title,
      next_tone: proj.next_tone,
      media: JSON.stringify(proj.media),
      status: 'published',
      is_featured: proj.is_featured,
      display_order: proj.display_order,
      created_at: now,
      updated_at: now
    });
  }
  console.log(`Seeded ${seedProjects.length} initial portfolio projects.`);
}

// Seed Media Library from existing files
const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media').get().count;
if (mediaCount === 0) {
  const seedMedia = [
    { filename: 'educarrt-1.png', original_name: 'EduCarrt Platform Lead', url: '/images/work/projects/educarrt-1.png', mime_type: 'image/png', size: 5694147, media_type: 'image', project_slug: 'educarrt', alt_text: 'EduCarrt platform mockup' },
    { filename: 'ftx-1.png', original_name: 'FTX Detailing Showroom Lead', url: '/images/work/projects/ftx-1.png', mime_type: 'image/png', size: 5675997, media_type: 'image', project_slug: 'ftx', alt_text: 'FTX Detailing mockup' },
    { filename: 'future-1.png', original_name: 'Future Safety Catalog Lead', url: '/images/work/projects/future-1.png', mime_type: 'image/png', size: 6043548, media_type: 'image', project_slug: 'future-safety', alt_text: 'Future Safety catalog mockup' },
    { filename: 'gadco-1.png', original_name: 'Gadco Storefront Lead', url: '/images/work/projects/gadco-1.png', mime_type: 'image/png', size: 5471666, media_type: 'image', project_slug: 'gadco', alt_text: 'Gadco lifestyle storefront' },
    { filename: 'jakkur-1.png', original_name: 'Jakkur Infrastructure Lead', url: '/images/work/projects/jakkur-1.png', mime_type: 'image/png', size: 6205569, media_type: 'image', project_slug: 'jakkur', alt_text: 'Jakkur engineering showcase' },
    { filename: 'mocs-1.png', original_name: 'MOCS Artisanal Shoes Lead', url: '/images/work/projects/mocs-1.png', mime_type: 'image/png', size: 6162621, media_type: 'image', project_slug: 'mocs', alt_text: 'MOCS artisan leather' },
    { filename: 'nazzi-1.png', original_name: 'Nazzi Foods Mobile Showcase', url: '/images/work/projects/nazzi-1.png', mime_type: 'image/png', size: 7042246, media_type: 'image', project_slug: 'nazzi', alt_text: 'Nazzi Foods packaging' },
    { filename: 'novara-1.png', original_name: 'Novara Audio Launch Display', url: '/images/work/projects/novara-1.png', mime_type: 'image/png', size: 5068429, media_type: 'image', project_slug: 'novara', alt_text: 'Novara acoustic hardware' },
    { filename: 'sabka-1.png', original_name: 'Sabka Skill Learning Portal', url: '/images/work/projects/sabka-1.png', mime_type: 'image/png', size: 5575987, media_type: 'image', project_slug: 'sabka', alt_text: 'Sabka Skill platform' },
    { filename: 'bloombiz-logo.png', original_name: 'BloomBiz Brand Identity Logo', url: '/images/bloombiz-logo.png', mime_type: 'image/png', size: 45000, media_type: 'image', project_slug: null, alt_text: 'BloomBiz Techno Hub logo' }
  ];

  const insertMedia = db.prepare(`
    INSERT INTO media (filename, original_name, url, mime_type, size, media_type, project_slug, alt_text, created_at)
    VALUES (@filename, @original_name, @url, @mime_type, @size, @media_type, @project_slug, @alt_text, @created_at)
  `);

  const now = new Date().toISOString();
  for (const m of seedMedia) {
    insertMedia.run({ ...m, created_at: now });
  }
  console.log(`Seeded ${seedMedia.length} initial media files.`);
}

// Seed Social Links
const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get().count;
if (socialCount === 0) {
  const seedSocials = [
    { platform: 'Instagram', url: 'https://www.instagram.com/bloombiztechnohub/', label: '@bloombiztechnohub', is_active: 1, display_order: 1 },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/bloombiz-techno-hub/', label: 'BloomBiz Techno Hub', is_active: 1, display_order: 2 },
    { platform: 'Behance', url: 'https://www.behance.net/bloombiz', label: 'behance.net/bloombiz', is_active: 1, display_order: 3 },
    { platform: 'Dribbble', url: 'https://dribbble.com/bloombiz', label: 'dribbble.com/bloombiz', is_active: 1, display_order: 4 },
    { platform: 'GitHub', url: 'https://github.com/shibilbloombiz/portfolio', label: 'github.com/shibilbloombiz', is_active: 1, display_order: 5 }
  ];

  const insertSocial = db.prepare(`
    INSERT INTO social_links (platform, url, label, is_active, display_order, created_at)
    VALUES (@platform, @url, @label, @is_active, @display_order, @created_at)
  `);

  const now = new Date().toISOString();
  for (const s of seedSocials) {
    insertSocial.run({ ...s, created_at: now });
  }
  console.log(`Seeded ${seedSocials.length} initial social links.`);
}

// Seed Contact Settings
const contactSettings = db.prepare('SELECT * FROM contact_settings WHERE id = 1').get();
if (!contactSettings) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO contact_settings (id, whatsapp_number, whatsapp_message, email, phone, enquiry_url, booking_url, address, timezone, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    '+919876543210',
    'Hello BloomBiz Techno Hub! I would like to discuss engineering a high-performance web platform for our business.',
    'info@bloombiz.com',
    '+91 98765 43210',
    'https://bloombiz.com/enquire',
    'https://cal.com/bloombiz/consultation',
    'BloomBiz Techno Hub, Cyberpark, Kozhikode, Kerala, India',
    'Asia/Kolkata (IST)',
    now
  );
  console.log('Seeded contact settings.');
}

// Seed Website Content
const heroContent = db.prepare('SELECT * FROM website_content WHERE key = ?').get('hero');
if (!heroContent) {
  const now = new Date().toISOString();
  const contentItems = [
    {
      key: 'hero',
      content: JSON.stringify({
        headlineWord1: 'DESIGN.',
        headlineWord2: 'ENGINEER.',
        headlineWord3: 'EVOLVE.',
        subLead: 'We engineer high-performance websites, custom web systems, and intelligent AI automation that scale businesses. Every detail built to perform.',
        ctaText: 'Explore Selected Work',
        ctaUrl: '/work/'
      })
    },
    {
      key: 'hello',
      content: JSON.stringify({
        sectionNum: '01',
        sectionLabel: 'Hello',
        statement: 'Every solution we build starts with architectural precision and delivers scalable, intelligent systems.'
      })
    },
    {
      key: 'services',
      content: JSON.stringify({
        sectionNum: '02',
        sectionTitle: 'Our Services',
        lead: 'We build high-performance web applications, intelligent AI automation pipelines, and custom enterprise digital systems that drive measurable business outcomes.',
        items: [
          { title: 'Full-Stack Web Engineering', description: 'Ultra-fast Next.js, React, and Node.js web applications engineered for scalability and sub-second latency.' },
          { title: 'Intelligent AI & Automation', description: 'Automate business operations, workflows, customer support, and document processing with LLM agents.' },
          { title: 'Custom Enterprise Systems', description: 'High-availability internal tools, CMS architectures, portals, and cloud infrastructure.' }
        ]
      })
    },
    {
      key: 'about',
      content: JSON.stringify({
        companyName: 'BloomBiz Techno Hub',
        headline: 'Engineering scalable web systems with precision & purpose.',
        bio: 'BloomBiz Techno Hub is an engineering-first digital studio. We bridge high-craft aesthetic minimalism with rigorous full-stack software architecture, delivering enterprise web systems and intelligent AI solutions for forward-thinking brands.'
      })
    },
    {
      key: 'footer',
      content: JSON.stringify({
        copyrightText: '© 2026 BloomBiz Techno Hub. All rights reserved.',
        statusText: 'All systems operational. Accepting select enterprise commissions for Q1 2026.'
      })
    }
  ];

  const insertContent = db.prepare('INSERT INTO website_content (key, content, updated_at) VALUES (?, ?, ?)');
  for (const item of contentItems) {
    insertContent.run(item.key, item.content, now);
  }
  console.log('Seeded initial website content.');
}

// Seed SEO Settings
const seoSettings = db.prepare('SELECT * FROM seo_settings WHERE id = 1').get();
if (!seoSettings) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO seo_settings (id, meta_title, meta_description, keywords, og_image, canonical_url, twitter_card, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'BloomBiz Techno Hub — Design. Engineer. Evolve.',
    'We engineer high-performance websites, custom web systems, and intelligent AI automation that scale businesses.',
    'web development, AI automation, enterprise software, BloomBiz, React, Next.js, digital systems',
    '/images/bloombiz-logo.png',
    'https://bloombiz.com/',
    'summary_large_image',
    now
  );
  console.log('Seeded SEO settings.');
}

// Seed General Settings
const generalSettings = db.prepare('SELECT * FROM general_settings WHERE id = 1').get();
if (!generalSettings) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO general_settings (id, site_title, company_name, tagline, contact_email, timezone, maintenance_mode, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    'BloomBiz Techno Hub',
    'BloomBiz Techno Hub',
    'DESIGN. ENGINEER. EVOLVE.',
    'info@bloombiz.com',
    'Asia/Kolkata (IST)',
    now
  );
  console.log('Seeded general settings.');
}

module.exports = db;
