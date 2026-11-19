# Interaction Specification: Moiséz

This document specifies the exact interaction logic, state machines, events, and physics equations used across the site.

---

## 1. Global Navigation & Overlay
- **Toggle Button** (`.underlay-nav__toggle`):
  - State: `aria-expanded="true|false"`
  - Label swap: "Menu" vs "Close"
  - Hamburger bars rotate and form an 'X' (`transform: translateY(...) rotate(45deg)`).
- **Menu Overlay** (`nav.menu`):
  - When opening: removes `hidden`, staggers menu items (`Home`, `Work`, `About`, `Contact`) upward with ease `--cubic-default`.
  - Background has column wipe effect.
  - Links have animated line hover effects (`data-underline-src`).
- **Live Montevideo Clock**:
  - Automatically calculates Montevideo timezone:
    ```js
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Montevideo"
    }).format(new Date());
    ```
  - Formatted as `HH:MM GMT-3`. Updates every 10 seconds.

---

## 2. Interactive Kerning Section ("I sweat the kerning")
- **Target Element**: `#details [data-kern-word]` ("kerning")
- **Splitting**:
  - The text `"kerning"` is dynamically split into individual interactive `<span class="home-kern__letter" role="slider">` elements.
  - Between adjacent letters, dynamic measurement tags (`.home-kern__tag`) display the current distance in pixels.
- **Dragging Mechanics**:
  - Mouse / Touch / Pointer events (`pointerdown`, `pointermove`, `pointerup`).
  - Constrained to horizontal displacement (`dx`).
  - While dragging:
    - `cursor: grabbing`
    - Letter shifts with smooth damping.
    - Accidental vertical scrolling is prevented (`touch-action: pan-y` on container, cancelled when horizontal drag exceeds threshold).
    - Distance tags update in real-time.
- **Action Buttons**:
  - **"Mess it up"** (`data-kern-mess`):
    - Generates randomized horizontal offsets for each letter:
      `offsets = [ -40, 65, -80, 50, -35, 75, -20 ]` (multiplied by container scale).
    - Animates letters to chaotic positions via GSAP spring.
    - Hides "Mess it up" button, displays "Put it back" button.
    - Updates message to: "Now try to put it back."
  - **"Put it back"** (`data-kern-back`):
    - Smoothly animates all letters back to `x: 0` using GSAP:
      `gsap.to(letters, { x: 0, duration: 0.7, ease: "power3.out", stagger: 0.03 })`
    - Restores message to: "Your turn. Drag a letter."
    - Hides "Put it back", displays "Mess it up".

---

## 3. About Page "Off the clock" Draggable Cards
- **Elements**: 6 photographic polaroid cards (`[data-drag-card]`) in `.about-field`.
- **Spring Physics Simulation**:
  - Uses custom Spring class with:
    - Position `x`, `y` (glide damping).
    - Angular rotation `a` (tilt based on drag velocity).
    - Lift `l` (scale up to 1.035 and drop shadow elevation when held).
- **Initial Entrance**:
  - When the section enters viewport via IntersectionObserver:
    - Cards drop from above with randomized natural scatter across a 3×2 grid (desktop) or 2×3 grid (mobile).
- **Pointer Interaction**:
  - On `pointerdown`:
    - Captures pointer ID (`setPointerCapture`).
    - Sets `held = true`, sets lift spring target to 1.
    - Increments global `z-index` so the touched card comes to the foreground.
    - Records start position and velocity buffer.
  - On `pointermove`:
    - Moves card with pointer.
    - Computes instantaneous drag velocity `vx, vy`.
    - Tilts card proportional to velocity: `a.to(Math.atan2(vy, vx) * 0.1)`.
  - On `pointerup`:
    - Releases pointer capture.
    - Injects release velocity into position springs `x` and `y` for natural inertia glide.
    - Lowers card lift back to 0.
- **GAS Tooltip**:
  - Clicking/hovering `<button class="about-term">GAS</button>`:
  - Spawns `.term-tip` tooltip with text: "Gear Acquisition Syndrome".
  - Positions relative to the button with an arrow notch.
  - Dismisses on click outside, scroll, resize, or `Escape` key.

---

## 4. Conversational Contact Form
- **Dynamic Field Auto-Mirroring**:
  - Inputs for `name`, `company`, and `email` sit inline inside paragraph text.
  - A hidden `.contact-fld__mirror` mirror span calculates the exact width of the input text and expands/contracts the `<input>` element dynamically:
    ```js
    mirror.textContent = input.value || input.placeholder;
    input.style.width = `${mirror.offsetWidth}px`;
    ```
- **Radio Chips ("I need")**:
  - Group: `a brand` / `a website` / `both`
  - Single-selection mode with keyboard navigation (`ArrowRight`, `ArrowLeft`).
  - Active state: `aria-checked="true"`, background charcoal, text sand.
- **Surface Chips ("For something people will")**:
  - Group: `hold` / `scroll` / `walk past`
  - Multi-selection toggle mode (`aria-pressed="true|false"`).
- **Validation**:
  - Checks required fields: `name` and `email` (valid email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`).
  - Dynamic hint feedback:
    - Missing both: "I need your name and an email to write back."
    - Missing name: "I need your name."
    - Missing/invalid email: "That email doesn't look right." or "I need an email to write back."
  - Adds `.is-bad` class with red underline shake.
- **Submission Flow**:
  - POSTs to Web3Forms API endpoint (`https://api.web3forms.com/submit`).
  - Button state: "Sending...", disabled.
  - On success: hides form, shows `.contact__done`:
    - Heading: "Got it."
    - Message: "Thanks [Name], I'll read through this and get back to you soon."
    - "Send another" button resets form state.

---

## 5. View Switcher ("Design" vs "System" Mode)
- **Floating Controls**:
  - Fixed bottom-right widget with buttons:
    1. **Design Mode** (default): Normal editorial appearance.
    2. **System Mode** (`S` key shortcut):
       - Sets `data-sys="true"` on `<html>`.
       - Renders 12-column red-orange technical layout grid overlay.
       - Displays typographic specifications, dimension callouts, and frame labels (`Billboard / 6 × 3 m`, `Web / 1440 / 12 cols`, `4:5 / Portrait`) above all media.
    3. **Hide Button**: Collapses widget into a small eye restore button (`.view-restore`).

---

## 6. Matter.js Footer Physics Simulation
- **Target**: `#canvas-target` inside `.section-resource`.
- **Bodies**:
  - Falling 2D capsule/circular tokens textured with SVG shapes:
    - `/images/shapes/orange_big_shape.svg`
    - `/images/shapes/black_big_shape.svg`
    - `/images/shapes/paper_big_shape.svg`
  - Static barrier rectangles matching the exact bounding boxes of the three lines:
    - "SAY HI."
    - "BRING THE IDEA."
    - "I'LL BRING THE PENCIL."
  - Canvas boundary walls (left, right, bottom, top).
- **Mouse Repulsion**:
  - Invisible kinematic circle body follows mouse cursor at high restitution.
  - When user moves mouse near tokens, they are pushed and scattered realistically.
- **Mobile Gyroscope**:
  - On mobile devices with `deviceorientation`, updates `gravity.x` and `gravity.y` based on device tilt angle.
