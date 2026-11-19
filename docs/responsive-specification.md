# Responsive Specification: Moiséz

This document specifies the responsive layouts, fluid typography scales, container constraints, and viewport adaptation rules across all tested viewports.

---

## 1. Target Viewports & Testing Matrix
- **1920px**: Ultra-wide desktop (12-column grid, max-width constraints, fluid spacing).
- **1440px**: Primary reference desktop resolution.
- **1280px**: Standard laptop display.
- **1024px**: Tablet landscape / small desktop.
- **768px**: Tablet portrait (major breakpoint: transition to 6-column grid, collapse desktop badges).
- **430px**: Large mobile (iPhone 14/15/16 Pro Max).
- **390px**: Standard mobile reference (iPhone 12/13/14).
- **375px**: Classic mobile (iPhone SE / 8).
- **360px**: Compact Android.

---

## 2. Fluid Typography & Spacing System
```css
:root {
  --size-container-min: 320px;
  --size-container-max: 479px;
  --size-container-ideal: 390;
  --size-unit: 16;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
  --gap: 2em;
}

@media (min-width: 768px) {
  :root {
    --gap: 2em;
    --about-cols: 6;
  }
}
```

### Font Scaling Scales:
- **Hero Title (`.home-hero__title`)**:
  - Desktop (≥768px): `clamp(2.8rem, 6.5vw, 6.8rem)`, line-height 0.95, letter-spacing `-0.035em`.
  - Mobile (<768px): `clamp(2.2rem, 11vw, 3.8rem)`, line-height 1.02.
- **Display Statements (`.home-statement`, `.about-display`)**:
  - Desktop: `clamp(1.8rem, 3.4vw, 3.6rem)`, line-height 1.15.
  - Mobile: `clamp(1.4rem, 6.2vw, 2.2rem)`, line-height 1.2.
- **Body Large (`.home-body-l`)**:
  - `clamp(1.05rem, 1.4vw, 1.35rem)`, line-height 1.45.
- **Labels & Metas (`.home-label`, `.about-label`)**:
  - `max(10px, 0.75rem)`, uppercase, letter-spacing `0.06em`, `Office Code Pro` monospace.

---

## 3. Section-by-Section Responsive Adaptation
### Navigation Bar:
- **Desktop (≥768px)**:
  - Displays location & live Montevideo clock (`based in montevideo working globally (HH:MM GMT-3)`).
  - Displays status badge (`.led.is-available` + `Available`).
  - Menu toggle button on the right.
- **Mobile (<768px)**:
  - Hides desktop metadata from top bar (`.desktop { display: none }`).
  - Keeps logo and Menu button clearly accessible with minimum 44px touch targets.
  - Fullscreen menu overlay contains full location, clock, and contact information.

### Homepage Hero:
- **Desktop**:
  - "Hold." + slot, "Scroll." + slot, "Walk past." + slot arranged in 3 editorial lines.
- **Mobile**:
  - Slots stack neatly inline with text; touch-friendly aspect ratios (62vw).

### 01 Hello Section:
- **Desktop**: 12-column stage with wide SVG pencil line.
- **Mobile**: SVG pencil line scales down gracefully without horizontal overflow; tags wrap cleanly.

### 03 Kerning Section ("I sweat the kerning"):
- **Desktop**: Full 12-column width font scaling.
- **Mobile**: Font size automatically clamps to fit mobile width without overflowing; touch drag handles letter dragging with `touch-action: pan-y`.

### About Page:
- **Portrait**:
  - Desktop: 17vw floating portrait with caption.
  - Mobile: 62vw centered portrait with caption underneath.
- **Draggable Cards ("Off the clock")**:
  - Desktop: Distributed across 3 columns × 2 rows field.
  - Mobile: Distributed across 2 columns × 3 rows field, scaling image cards to 45vw.

### Conversational Contact Form:
- **Desktop**: Natural flowing sentence across wide container with inline inputs.
- **Mobile**: Line breaks (`.contact__break`) engage at mobile widths, inputs stretch cleanly, chip buttons wrap smoothly into rows.
