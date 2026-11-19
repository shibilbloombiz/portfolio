# Animation Specification: Moiséz

This document specifies the complete motion system, timing functions, easings, scroll triggers, and transition choreography.

---

## 1. Global Motion Language & Easings
- **Default Easing**: `cubic-bezier(0.65, 0.05, 0, 1)` (snappy start, long smooth deceleration).
- **Smooth Deceleration**:
  ```css
  --e-smooth: linear(
    0, .0191, .0667, .1313, .2048, .2816, .3577, .4308, .4991, .562,
    .6189, .67, .7154, .7554, .7905, .821, .8475, .8704, .89, .9069,
    .9213, .9336, .9441, .9529, .9605, .9668, .9722, .9767, .9805,
    .9837, .9864, .9887, .9905, .9921, .9934, .9945, .9955, .9962,
    .9969, .9974, .9978, .9982, .9985, .9988, .999, .9992, .9993, .9994, 1
  );
  --duration-default: 0.735s;
  ```
- **Reduced Motion**: All animations immediately jump to final resting states when `prefers-reduced-motion: reduce` is detected.

---

## 2. Intro Animation (First Session Visit)
- Layer: `.intro[data-intro-layer]`
- **Step 1**: Screen starts covered by safety orange background (`#f54900`).
- **Step 2**: 14 vertical black strips (`.intro__cols i`) slide downward or scale in stagger.
- **Step 3**: Central black ball (`.intro__ball` with `black_big_shape.svg`) drops and bounces.
- **Step 4**: Columns part or wipe upward, revealing the site underneath.
- **Step 5**: Stored in `sessionStorage.getItem("moisez-intro")` so subsequent page views skip the full intro.

---

## 3. Hero Slot Image Cycler
- In the homepage hero ("Hold. Scroll. Walk past."):
  - Each word has a slot container (`.home-slot`):
    - `data-slot="print"`: TSG Bag, 21 Movement card, Tribu t-shirt
    - `data-slot="screen"`: Tribu web, Footy app, Inzone web, TSG mobile
    - `data-slot="space"`: TSG truck, 21 Movement banner, Tribu stage screen
  - Automatically or on hover/scroll:
    - Images stack inside the slot.
    - Active image lifts up with smooth cross-fade scale.
    - Clicking any slot opens that specific project case study route.

---

## 4. 01 Hello Section: SVG Pencil Line Drawing
- Container: `.home-hello__stage`
- SVG Path: `.home-hello__path` with linear gradient `linearGradient#hello-line-ink` (graphite `#3a3532` to mid `#23201e` to ink `#1c1917`).
- **Trigger**: ScrollTrigger pinned or scrubbing as user scrolls down Section 01.
- **Motion**:
  - `stroke-dasharray` and `stroke-dashoffset` draw the continuous line across the width of the screen.
  - A pencil lead circle (`.home-hello__tip`, radius 3.5) leads the stroke.
  - As the stroke touches milestone positions:
    1. Milestone 1: reveals "A sign over a door"
    2. Milestone 2: reveals "A label on a can"
    3. Milestone 3: reveals "A screen in someone's hand"

---

## 5. Underline Drawing Animations (`data-underline`)
- Custom organic drawn SVG underlines on hover and in hero:
  - `data-underline="03"` (under "past." in Hero)
  - `data-underline="04"` (under "beyond" in About Approach)
- Hover link animation (`[data-underline-link]`):
  - On hover: underline draws from left to right (`transform: scaleX(1)`, origin: left).
  - On mouse leave: collapses from left to right (`transform: scaleX(0)`, origin: right).

---

## 6. Footer Parallax Effect
- Container: `[data-footer-parallax]`
- Inner: `[data-footer-parallax-inner]`
- Overlay: `[data-footer-parallax-dark]`
- **Mechanism**:
  - As user scrolls past the last section, the content page rolls up like a curtain.
  - The footer is pinned or transforms upward at a reduced velocity (parallax factor 0.35).
  - A darkening veil (`footer-wrap__dark`) dims the preceding content as the footer enters.
  - Matter.js simulation starts when footer becomes visible.

---

## 7. Full Page Transitions (Barba-style)
- Overlay: `.transition[data-transition-wrap]`
- **Exit Old Route**:
  - 8 vertical panels (`.transition__panel`) slide down sequentially from top to bottom with a 0.04s stagger:
    `gsap.to(panels, { yPercent: 0, duration: 0.5, stagger: 0.04, ease: "power3.inOut" })`
  - 12 grid lines fade in.
- **Enter New Route**:
  - Window scrolls to top.
  - New page content is mounted.
  - Panels slide down and out:
    `gsap.to(panels, { yPercent: 100, duration: 0.5, stagger: 0.04, ease: "power3.inOut" })`
  - Clean up tweens and re-initialize page-specific features.
