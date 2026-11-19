export interface CaseMedia {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
  frame: string;
  layout: 'lead' | 'pair' | 'wide';
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  sector: string;
  scope: string;
  year: string;
  tone: string;
  problem: string;
  decision: string;
  principles: string[];
  result: string;
  externalUrl?: string;
  nextSlug: string;
  nextTitle: string;
  nextTone: string;
  media: CaseMedia[];
}

export const projects: Project[] = [
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
    externalUrl: 'https://educarrt.com/',
    nextSlug: 'ftx',
    nextTitle: 'FTX Detailing',
    nextTone: '#141f17',
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
    externalUrl: 'https://ftxdetailing.com/',
    nextSlug: 'future-safety',
    nextTitle: 'Future Safety',
    nextTone: '#241c14',
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
      'Direct, high-readability technical specifications',
      'Instant RFQ quotation requests directly from product cards',
      'Hardwearing industrial design language rooted in workplace reliability'
    ],
    result: 'Decreased quotation turn-around time from 48 hours to under 30 minutes, handling thousands of SKU line items seamlessly.',
    externalUrl: 'https://futuresafety.com/',
    nextSlug: 'gadco',
    nextTitle: 'Gadco',
    nextTone: '#18181a',
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
    sector: 'Fashion & Lifestyle Retail',
    scope: 'E-commerce flagship, art direction, digital storefront',
    year: '2025',
    tone: '#18181a',
    problem: 'Modern lifestyle retail brands require striking digital minimalism where product photography does the selling without noisy banners or distracting pop-ups.',
    decision: 'Designed an editorial, high-fashion storefront prioritizing oversized imagery, clean typography, and instant micro-interactions for quick checkout.',
    principles: [
      'Editorial grid that treats merchandise like art exhibits',
      'Micro-interactions that celebrate tactile product discovery',
      'Ultra-fast checkout flow optimized for mobile fashion shoppers'
    ],
    result: 'Average cart value increased by 28%, with mobile conversion rates leaping past industry benchmarks.',
    externalUrl: 'https://gadco.com/',
    nextSlug: 'jakkur',
    nextTitle: 'Jakkur',
    nextTone: '#14243b',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/gadco-1.png',
        alt: 'Gadco: Redefine your Lifestyle on laptop display',
        frame: 'Web / 1440 / 12 cols',
        layout: 'lead'
      }
    ]
  },
  {
    slug: 'jakkur',
    title: 'Jakkur',
    description: 'Delivery without delay across intelligent global networks.',
    sector: 'Logistics & Supply Chain',
    scope: 'Enterprise portal, tracking interface, visual identity',
    year: '2025',
    tone: '#14243b',
    problem: 'Logistics and warehousing companies face fierce competition where reliability and real-time visibility dictate multimillion-dollar freight contracts.',
    decision: 'Created a forward-looking logistics portal featuring dynamic fleet tracking visuals, real-time rate calculators, and robust warehouse capacity dashboards.',
    principles: [
      'Real-time shipment tracking front and center',
      'Authoritative blue tones inspiring trust for enterprise supply managers',
      'Data density without visual overwhelm'
    ],
    result: 'Onboarded 40+ national retail supply chains in the first quarter post-launch.',
    externalUrl: 'https://jakkurlogistics.com/',
    nextSlug: 'mocs',
    nextTitle: 'MOCS',
    nextTone: '#361b14',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/jakkur-1.png',
        alt: 'Jakkur: Delivery Without Delay on desktop display',
        frame: 'Web / 1440 / 12 cols',
        layout: 'lead'
      }
    ]
  },
  {
    slug: 'mocs',
    title: 'MOCS',
    description: 'Artisanal charm crafted for timeless ease and natural comfort.',
    sector: 'Apparel & Artisanal Living',
    scope: 'Lookbook experience, online boutique, brand narrative',
    year: '2025',
    tone: '#361b14',
    problem: 'Handcrafted artisanal home goods and apparel lose their soul on generic ecommerce platforms. MOCS needed a digital sanctuary communicating natural warmth, texture, and care.',
    decision: 'Crafted a warm, tactile digital boutique with earthy terracotta tones, generous breathing room, and soft narrative transitions that showcase the craftsman\'s hand.',
    principles: [
      'Warm earthy color palette echoing organic fibers and terracotta clays',
      'Unrushed visual rhythm designed to encourage slow, thoughtful browsing',
      'Story-driven collection pages highlighting artisan provenance'
    ],
    result: 'Bounce rates plummeted by 35% as visitors spent over 4 minutes on average exploring story lookbooks.',
    externalUrl: 'https://mocsartisan.com/',
    nextSlug: 'nazzi',
    nextTitle: 'Nazzi Foods',
    nextTone: '#201912',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/mocs-1.png',
        alt: 'MOCS: Artisanal Charm for Timeless Ease on tablet display',
        frame: 'Tablet / 1024 / 12 cols',
        layout: 'lead'
      }
    ]
  },
  {
    slug: 'nazzi',
    title: 'Nazzi Foods',
    description: 'Authentic ready mixes tailored for modern kitchens.',
    sector: 'Food & FMCG Innovation',
    scope: 'Mobile-first store, packaging design, ordering experience',
    year: '2026',
    tone: '#201912',
    problem: 'Busy urban households crave authentic traditional flavours without hours of preparation. Nazzi needed a mouthwatering, mobile-first experience to drive direct-to-consumer orders.',
    decision: 'Constructed an app-like mobile web storefront with instant recipe pairings, rich culinary visuals, and one-tap checkout.',
    principles: [
      'Mobile-first architecture tuned for one-handed thumb interaction',
      'Warm, appetite-stimulating photography and rich spice tones',
      'Direct WhatsApp order integration alongside instant payment gateway'
    ],
    result: 'Over 70% of transactions completed on mobile devices, with repeat orders reaching 48%.',
    externalUrl: 'https://nazzifoods.com/',
    nextSlug: 'novara',
    nextTitle: 'Novara',
    nextTone: '#1a1a1c',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/nazzi-1.png',
        alt: 'Nazzi Foods: Authentic Ready Mixes for Modern Kitchens on smartphone display',
        frame: 'iOS / 390 × 844 pt',
        layout: 'lead'
      }
    ]
  },
  {
    slug: 'novara',
    title: 'Novara',
    description: 'Model Novara — minimalism engineered for acoustic purity.',
    sector: 'Smart Home & Audio Tech',
    scope: 'Product launch site, interactive 3D showcase, identity',
    year: '2026',
    tone: '#1a1a1c',
    problem: 'Ultra-premium industrial hardware requires digital experiences as meticulously crafted as the product chassis itself. Novara needed an uncompromising design statement.',
    decision: 'Developed an architectural, high-concept interactive product launch site with stark typographic contrast, 360-degree rotation cues, and sculptural audio fidelity stories.',
    principles: [
      'Monochromatic purity allowing hardware materials to take center stage',
      'Architectural grid system with ultra-precise typography',
      'Silky smooth interactive rotations and detail view reveals'
    ],
    result: 'Pre-orders for the flagship Model Novara sold out within 72 hours of international press launch.',
    externalUrl: 'https://novaraaudio.com/',
    nextSlug: 'sabka',
    nextTitle: 'Sabka Skill Academy',
    nextTone: '#241538',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/novara-1.png',
        alt: 'Novara: Model Novara on tablet display',
        frame: 'Tablet / 1024 / 12 cols',
        layout: 'lead'
      }
    ]
  },
  {
    slug: 'sabka',
    title: 'Sabka Skill Academy',
    description: '10 simple steps to your dream career placement.',
    sector: 'EdTech & Career Advancement',
    scope: 'Learning LMS, student portal, conversion funnels',
    year: '2025',
    tone: '#241538',
    problem: 'Career accelerators need to build immense confidence for students making career pivots, demonstrating real mentor support and verified placement track records.',
    decision: 'Designed an energetic, confidence-boosting portal highlighting student cohort success stories, milestone roadmaps, and instant mentor booking sessions.',
    principles: [
      'Clear 10-step visual roadmap guiding student milestones',
      'Social proof and alumni placement metrics woven into every section',
      'Vibrant violet and energetic neon gradients inspiring forward momentum'
    ],
    result: 'Enrolment conversion rates climbed by 54%, with course completion satisfaction holding at 98%.',
    externalUrl: 'https://sabkaskill.com/',
    nextSlug: 'educarrt',
    nextTitle: 'EduCarrt',
    nextTone: '#10223d',
    media: [
      {
        type: 'image',
        src: '/images/work/projects/sabka-1.png',
        alt: 'Sabka Skill Academy: 10 Simple Steps to Your Placement on tablet display',
        frame: 'Tablet / 1024 / 12 cols',
        layout: 'lead'
      }
    ]
  }
];
