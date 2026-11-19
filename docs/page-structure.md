# Page Structure Specification: Moiséz

This document outlines the detailed DOM tree, section sequence, and exact content hierarchy across all 9 pages of the site.

---

## 1. Global Shell Structure
Present across all pages:
1. **Intro Animation Layer** (`.intro[data-intro-layer]`):
   - `.intro__cols`: 14 columns (`<i data-intro-col=""></i>` × 14)
   - `.intro__shadow`
   - `.intro__ball`: Black circular glyph (`/images/shapes/black_big_shape.svg`, 256×256)
2. **Navigation Header** (`.navbar.w-nav`):
   - `.logo`: SVG logo (`/images/moisez_logo.svg`)
   - `.nav_text.desktop`: "based in montevideo working globally (<span data-clock>09:41</span> GMT-3)"
   - `.status-badge.desktop`: `.led.is-available` + "Available"
   - `.underlay-nav__toggle`: "Menu" / "Close" toggle button with animated hamburger lines
   - Fullscreen Menu Overlay (`nav.menu[data-menu]`):
     - Links: Home (`/`), Work (`/work/`), About (`/about/`), Contact (`/contact/`)
     - Write to: `info@moisez.com`
     - Socials: Instagram, LinkedIn, Behance, Dribbble
     - Copyright: `© 2026 Moiséz. All rights reserved.`
   - `.progressive-blur`: 5 gradient blur layers
3. **Film Grain Layer** (`.grain[data-grain-animate="true"]`)
4. **Main Barba Container** (`main#main[data-main][data-barba="container"]`)
5. **View Switch Floating Widget** (`.view-switch`):
   - "Design" button (`data-view-btn="design"`)
   - "System" button (`data-view-btn="system"`, shortcut `S`)
   - "Hide" button (`data-view-btn="close"`)
   - Restore pill (`button.view-restore`)
6. **Transition Overlay** (`.transition[data-transition-wrap]`):
   - 8 vertical panels (`.transition__panel`)
   - 12 grid lines (`.transition__line`)
7. **Animated Grid Layer** (`.animated-grid[data-animated-grid]`):
   - 12 column guides (`.animated-grid__col` × 12)

---

## 2. Page 01: Home (`/`)
### Section 1: Hero (`#hero.home-hero`)
- `.home-hero__title`: Headline "Hold. Scroll. Walk past."
  - "Hold." + `.home-slot[data-slot="print"]` cycling thumbnails (TSG bag, 21 Movement business card, Tribu t-shirt).
  - `.home-slot[data-slot="screen"]` cycling thumbnails (Tribu web, Footy app, Inzone web, TSG mobile) + "Scroll."
  - "Walk past." with custom SVG underline `data-underline="03"` + `.home-slot[data-slot="space"]` (TSG truck, 21 Movement banner, Tribu stage/sign).
- Sub-grid:
  - `.home-hero__cue`: "Scroll." indicator with dot.
  - `.home-hero__lead`: "I design brands and build the websites that sell them. Everything else is details, and I like details."

### Section 2: 01 Hello (`#hello.home-hello`)
- Top:
  - Label: `01 Hello`
  - Statement: "Most of my work starts with a pencil and ends somewhere you can touch."
- Stage:
  - Interactive SVG pencil path (`home-hello__svg`) drawing a continuous line through 3 milestone tags:
    1. "A sign over a door"
    2. "A label on a can"
    3. "A screen in someone's hand"
- Bottom:
  - Paragraph 1: "I'm Moiséz. I design brand identities and the interfaces that carry them, then I make the files myself: print-ready, sign-ready, code-ready."
  - Paragraph 2 (muted): "If it has to look right at three metres and at three centimetres, that's my favourite kind of problem."

### Section 3: 02 A few things I've made (`#work.home-work`)
- Label: `02 A few things I've made`
- Card Stack (3 Projects):
  1. **Tribu**: "A tech brand that didn't want to look like tech." (`/images/work/tribu/tribu-2-960.webp`)
  2. **TSG Ferretería**: "A hardware store that wanted to look as solid as the tools it sells." (`/images/work/tsg-ferreteria/tsg-billboard-960.webp`)
  3. **21 Movement Reset**: "A workplace wellness brand that gets people out of their chairs without shouting at them." (`/images/work/21-movement-reset/21-movement-banner-960.webp`)
- Bottom CTA:
  - "See some of the stuff I've made →" linking to `/work/`

### Section 4: 03 The boring part (`#details.home-details`)
- Label: `03 The boring part`
- Statement: "I sweat the"
- Large interactive word: **"kerning"**
  - Letter spans for 'k', 'e', 'r', 'n', 'i', 'n', 'g'
  - Guide lines (`.home-kern__guides`)
  - Distance metric tags between adjacent letters
- Controls:
  - Message: "Your turn. Drag a letter."
  - "Mess it up" button (`data-kern-mess`)
  - "Put it back" button (`data-kern-back`)
- Secondary CTA:
  - "Show me the workings" button (toggles system specs)
  - "so you don't have to."

### Section 5: Footer (`.footer`)
- Top:
  - "Let's talk →" (`/contact/`)
  - `info@moisez.com`, Instagram, LinkedIn, Behance, Dribbble
- Big typography banner:
  - "SAY HI."
  - "BRING THE IDEA."
  - "I'LL BRING THE PENCIL."
- Matter.js 2D physics canvas (`#canvas-target`)
- Base:
  - `© 2026 Moiséz. All rights reserved.`
  - "Back to the top ↑"

---

## 3. Page 02: Work (`/work/`)
- Hero header:
  - Display title: "Some things I've made."
  - Subhead: "Brands, websites and the bits in between. Made to work on paper, on screen and out in the world."
- All 5 Case Studies List:
  1. **Tribu** — Digital agency — 2025
     - Cover: `/images/work/tribu/tribu-2-960.webp`
     - Link: `/work/tribu/`
  2. **TSG Ferretería** — Hardware & paint retail — 2026
     - Cover: `/images/work/tsg-ferreteria/tsg-billboard-960.webp`
     - Link: `/work/tsg-ferreteria/`
  3. **21 Movement Reset** — Corporate wellness — 2025
     - Cover: `/images/work/21-movement-reset/21-movement-banner-960.webp`
     - Link: `/work/21-movement-reset/`
  4. **Inzone** — Event technology — 2021
     - Cover: `/images/work/inzone/inzone-05-960.webp`
     - Link: `/work/inzone/`
  5. **Footy** — Sports app — 2021
     - Cover: `/images/work/footy/footy-04-960.webp`
     - Link: `/work/footy/`
- Footer with Matter.js canvas and contact links.

---

## 4. Page 03: About (`/about/`)
- **Section 01: Profile & Intro**:
  - B&W Portrait (`/images/about/portrait-960.webp`) with slice wipe reveal.
  - Caption: "Moisés Solórzano", "Sol is Spanish for sun" (with circular orange sun SVG badge), "Brand & Web Designer"
  - Display statement: "Hi, I'm Moiséz. I like figuring out how things work, getting lost in the details and seeing things through."
- **Section 02: Approach**:
  - Label: `02 Approach`
  - Statement: "Same hands from the first pencil line to the last export. I stay involved from the rough idea to the finished thing, making sure the details hold up beyond the screen."
  - 3 Principles:
    1. Sketch first. Details all the way through
    2. One system for paper, street and screen
    3. Always asking why
- **Section 03: Brands I've worked with**:
  - Label: `03 Brands I've worked with`
  - 11 Brand cells with SVG marks:
    1. Tribu (Software agency)
    2. TSG Ferretería (Hardware retail)
    3. 21 Movement Reset (Wellness)
    4. Footy (Sports app)
    5. Inzone (Event tech)
    6. Dualboot Partners (Software agency)
    7. Practia (IT consulting)
    8. Mercadosincro (E-commerce)
    9. stream.uy (Streaming)
    10. Progrecity (Micro-investing app)
    11. Ley de Murphy (Design Studio)
- **Section 04: Index**:
  - Label: `04 Index`
  - **Tools**: Figma, Illustrator / InDesign, Photoshop, After Effects, React / Tailwind, LLMs, GSAP, Vercel / Cloudflare
  - **Experience**:
    - Moiséz / Independent (2016–Now)
    - Estudio Ley de Murphy / Co-Founder & Art Director (2026–Now)
    - Tribu / Lead Designer (2024–Now)
    - Practia / UX/UI Designer (2022–2024)
    - Dualboot Partners / Web Developer (2021–2022)
    - Inzone / UX/UI Designer (2020–2021)
- **Section 05: Off the clock**:
  - Label: `05 Off the clock`, Hint: "Move them around."
  - 6 Interactive Draggable Cards:
    1. **Kala, the boss**: Golden retriever in purple coat (`clock-dog-540.webp`). "This portfolio is dedicated to her. Always in our hearts ❤️"
    2. **Measure twice**: Pencil wireframes on cutting mat (`clock-sketch-540.webp`). "Pencil first, cutting mat underneath. Just in case."
    3. **A good kind of noise**: Electric guitars on sofa (`clock-guitars-540.webp`). "Some things are better heard than explained."
    4. **Manual focus**: Nikon film camera on wood (`clock-camera-540.webp`). "A little patience and a shot I won't get twice."
    5. **One more set**: Tennis racket on clay court (`clock-tennis-540.webp`). "It's never just one more set."
    6. **I think I have GAS**: Guitar shop wall (`clock-guitar-wall-540.webp`). "I'd take every one of them home." Interactive button `GAS` triggers tooltip "Gear Acquisition Syndrome".

---

## 5. Page 04: Contact (`/contact/`)
- Aside:
  - Title: Contact
  - "Or just write": `info@moisez.com` with copy button + "Copied" toast
  - "Montevideo": "It's [live time] here"
  - Socials: Instagram, LinkedIn, Behance, Dribbble
- Conversational Form (`.contact__form`):
  - "Hi Moiséz, I'm [name input] from [company input]."
  - "I need [a brand / a website / both] for something people will [hold / scroll / walk past]."
  - "Write back to [email input]."
  - Optional message textarea: "Anything else (optional)"
  - Submit button: "Send it →"
  - Real API submission to Web3Forms
  - Success state: "Got it." + "Send another" reset

---

## 6. Case Studies (01 to 05)
Each case study follows an authentic, highly detailed layout:
1. **Case Hero**: Large project title, subtitle, metadata grid (Sector, Scope, Year, External link).
2. **Featured Media 01**: Hero mockup / primary view.
3. **Problem & Decision Grid**:
   - `01 Problem` narrative.
   - `02 Decision` narrative with 3 key design principles.
4. **Media Showcase**: Staggered high-res mockups, responsive WebP images.
5. **Result Section**: `03 Result` narrative with impact metrics and deliverables.
6. **Closing Merch / Physical Deliverables**: T-shirts, signage, bottles, cards.
7. **Next Project Banner**: Link to next case study in rotation + Back to Work.
