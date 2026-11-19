# Reference Audit: Moiséz (https://moisez.com/)

## 1. Executive Summary
- **Target Site**: https://moisez.com/
- **Subject**: Moiséz (Moisés Solórzano), Brand & Web Designer based in Montevideo, Uruguay.
- **Tone & Art Direction**: Editorial, restrained, tactile, minimalist craft. Starts with "a pencil and ends somewhere you can touch."
- **Key Characteristics**:
  - Sand background (`#f5f5f4`) with dark brown charcoal text (`#1c1917`) and international safety orange accent (`#f54900`).
  - High-precision editorial typography pairing `Saans` (Variable Grotesque Display & Body, weights 300–900) with `Office Code Pro` (Monospace for labels, metadata, specs, captions).
  - Tactile physical-digital interactions: SVG pencil line drawing, draggable kerning letters, interactive spring-physics polaroid cards, Matter.js falling 2D physical tokens in the footer.
  - "Design View" vs "System View" mode (hotkey `S`) displaying a 12-column grid and technical design specs.
  - Sentence-based conversational contact enquiry form with dynamic auto-mirroring input fields.

---

## 2. Route Discovery & Audit
Confirmed routes and their functions:

| Route | Title | Template/Namespace | Key Features |
|---|---|---|---|
| `/` | Moiséz \| Brand & Web Designer | `home` | Hero slot cycler, Intro pencil line SVG, Selected Work (Tribu, TSG, 21 Movement), Interactive Kerning ("Mess it up" / "Put it back"), Footer Matter.js |
| `/work/` | Work \| Moiséz | `work` | 5 complete case studies index with rich image banners, metadata tags, hover transitions |
| `/about/` | About \| Moiséz | `about` | B&W Portrait with slice reveal, "Sol is Spanish for sun" badge, Approach principles, 11 Client brand logos, Tools & Experience tables, "Off the clock" 6 spring-drag polaroid cards, GAS tooltip |
| `/contact/` | Contact \| Moiséz | `contact` | Montevideo live clock, Copy-to-clipboard email, conversational interactive sentence form, Web3Forms API |
| `/work/tribu/` | Tribu — Digital agency \| Moiséz | `case` | Case study: Tech agency, Problem, Decision, 3 Principles, Result, 6 responsive asset sets, external link, next case |
| `/work/tsg-ferreteria/` | TSG Ferretería — Hardware & paint retail \| Moiséz | `case` | Case study: Hardware & paint retail, Problem, Decision, 3 Principles, Result, 6 responsive asset sets, external link, next case |
| `/work/21-movement-reset/` | 21 Movement Reset — Corporate wellness \| Moiséz | `case` | Case study: Corporate wellness, Problem, Decision, 3 Principles, Result, 6 responsive asset sets, next case |
| `/work/inzone/` | Inzone — Event technology \| Moiséz | `case` | Case study: Event tech platform, Problem, Decision, 3 Principles, Result, 8 responsive asset sets, external link, next case |
| `/work/footy/` | Footy — Sports app \| Moiséz | `case` | Case study: Football score app, Problem, Decision, 3 Principles, Result, 6 responsive asset sets, next case |

---

## 3. Technology Stack & Architecture (Reverse-Engineered)
- **Markup**: Clean semantic HTML5 with custom `data-*` attributes (`data-barba="container"`, `data-motion`, `data-spec`, `data-kern`, `data-drag-cards`).
- **Styling Architecture**: Custom CSS with design tokens (`:root` variables), clamp-based fluid typography system, 12-column CSS grid.
- **Fonts**:
  - `SaansVF.woff2` (Saans Variable Font: Regular, Medium, SemiBold, Bold, Black)
  - `SaansVFItalics.woff2`
  - `officecodepro-regular.woff2` (Office Code Pro)
- **Animation & Physics**:
  - GSAP 3.x + ScrollTrigger for scroll-driven animations, parallax, and text reveals.
  - Custom Euler/RK4 spring physics engine (`MZ.motion.Spring`) for natural draggable objects with tilt, glide, velocity tracking, and inertia.
  - Matter.js 2D physics engine for falling bouncing token objects in the footer colliding with text elements and mouse repulsion.
- **Page Transitions**: Barba.js style column wipe with 8 vertical panels and 12 grid lines.
- **Film Grain**: Subtle animated SVG noise overlay texture (`class="grain"`).

---

## 4. Design Tokens & Color Palette
```css
:root {
  --sand: #f5f5f4;            /* Base background */
  --dark-brown: #1c1917;      /* Primary text (Warm charcoal black) */
  --main: #f54900;            /* Accent orange */
  --light-stone: #a6a09b;     /* Muted labels & captions */
  --color-error: #ea384c;     /* Form validation bad state */
  --color-success: #0ba954;   /* Form success */
  --gap: 2em;
  --size-container-min: 320px;
  --size-container-max: 479px;
  --size-container-ideal: 390;
  --size-unit: 16;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
  --header-height: calc(1.5em + (var(--gap) * 2));
  --footer-height: calc(2.785em + (var(--gap) * 2));
  --cubic-default: cubic-bezier(.65, .05, 0, 1);
}
```
