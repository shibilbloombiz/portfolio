import React, { useEffect, useRef } from 'react';

interface RibbonTypographyProps {
  className?: string;
  embedded?: boolean;
}

interface TextSegment {
  text: string;
  color: string;
}

interface RibbonItem {
  segments: TextSegment[];
  plainText: string;
}

export const RibbonTypography: React.FC<RibbonTypographyProps> = ({ className = '', embedded = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isDestroyed = false;
    let isVisible = true;

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ------------------------------------------------------------------------
    // 1. Exact 6 Verified Company Information Items & Typography Hierarchy
    // ------------------------------------------------------------------------
    const items: RibbonItem[] = [
      {
        segments: [
          { text: '5+', color: '#F15A24' },
          { text: ' YEARS OF EXPERIENCE', color: '#160D08' },
        ],
        plainText: '5+ YEARS OF EXPERIENCE',
      },
      {
        segments: [
          { text: '100+', color: '#F15A24' },
          { text: ' BRANDS BUILT', color: '#160D08' },
        ],
        plainText: '100+ BRANDS BUILT',
      },
      {
        segments: [
          { text: '200+', color: '#F15A24' },
          { text: ' HAPPY CLIENTS', color: '#160D08' },
        ],
        plainText: '200+ HAPPY CLIENTS',
      },
      {
        segments: [
          { text: 'CREATIVE', color: '#F15A24' },
          { text: ' THINKING', color: '#160D08' },
        ],
        plainText: 'CREATIVE THINKING',
      },
      {
        segments: [
          { text: 'DIGITAL ', color: '#160D08' },
          { text: 'INNOVATION', color: '#F15A24' },
        ],
        plainText: 'DIGITAL INNOVATION',
      },
      {
        segments: [
          { text: 'INDIA', color: '#160D08' },
          { text: ' · ', color: '#F15A24' },
          { text: 'UAE', color: '#160D08' },
          { text: ' · ', color: '#F15A24' },
          { text: 'KSA', color: '#160D08' },
        ],
        plainText: 'INDIA · UAE · KSA',
      },
    ];

    // ------------------------------------------------------------------------
    // 2. Responsive Sizing & Canvas Dimensions
    // ------------------------------------------------------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;

    let ribbonThickness = 72; // Consistent perpendicular thickness
    let fontSize = 17;
    let itemGap = 110;
    let waveAmp1 = 40;
    let waveAmp2 = 16;
    let waveAmp3 = 8;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height || (embedded ? 380 : 440));

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Responsive parameter adjustments
      if (width < 768) {
        // Mobile
        ribbonThickness = 48;
        fontSize = 13.5;
        itemGap = 65;
        waveAmp1 = 20;
        waveAmp2 = 8;
        waveAmp3 = 4;
      } else if (width < 992) {
        // Tablet
        ribbonThickness = 60;
        fontSize = 15;
        itemGap = 85;
        waveAmp1 = 30;
        waveAmp2 = 12;
        waveAmp3 = 6;
      } else {
        // Desktop
        ribbonThickness = 72;
        fontSize = 17;
        itemGap = 110;
        waveAmp1 = 40;
        waveAmp2 = 16;
        waveAmp3 = 8;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Visibility observer to pause animation loop when scrolled out of view
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          isVisible = entries[0].isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    // ------------------------------------------------------------------------
    // 3. Motion & Physics Controller (Idle + Drag + Momentum + Scroll)
    // ------------------------------------------------------------------------
    const baseIdleSpeed = prefersReducedMotion ? 0 : 46; // px per second
    let currentVelocity = baseIdleSpeed;
    let progress = 0;
    let lastTime = performance.now();

    // Drag interaction state
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerTime = performance.now();
    let dragVelocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerTime = performance.now();
      dragVelocity = 0;
      canvas.setPointerCapture(e.pointerId);
      container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const now = performance.now();
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;

      // Direct responsive dragging along trajectory
      progress -= dx;

      const dtPointer = Math.max((now - lastPointerTime) / 1000, 0.008);
      lastPointerTime = now;
      const instantVel = -dx / dtPointer;
      dragVelocity = dragVelocity * 0.55 + instantVel * 0.45;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture already lost
      }
      container.style.cursor = 'grab';

      // Hand off drag velocity with momentum
      if (!prefersReducedMotion && Math.abs(dragVelocity) > 20) {
        currentVelocity = Math.max(Math.min(dragVelocity, 1200), -1200);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Scroll interaction: Page scroll accelerates ribbon flow subtly
    let lastScrollY = window.scrollY;
    let scrollImpulse = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (!prefersReducedMotion) {
        scrollImpulse += deltaY * 1.4;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ------------------------------------------------------------------------
    // 4. Smooth Parametric Wave Curve Engine
    // ------------------------------------------------------------------------
    // Generates a graceful, organic, continuously traveling wave with
    // continuous derivatives and strictly constant normal thickness.
    const getCurve = (x: number, timeSec: number) => {
      const centerY = height * 0.5;

      // Natural harmonic wavelengths
      const k1 = 0.0032; // Primary S-curve (~1960px cycle)
      const k2 = 0.0068; // Secondary smooth harmonic (~920px cycle)
      const k3 = 0.0015; // Slow undulating breathing cycle (~4180px cycle)

      const w1 = prefersReducedMotion ? 0 : timeSec * 1.15;
      const w2 = prefersReducedMotion ? 0 : timeSec * 0.85;
      const w3 = prefersReducedMotion ? 0 : timeSec * 0.45;

      const y =
        centerY +
        Math.sin(x * k1 - w1) * waveAmp1 +
        Math.cos(x * k2 + w2) * waveAmp2 +
        Math.sin(x * k3 - w3) * waveAmp3;

      // Analytical derivative dy/dx
      const dy =
        Math.cos(x * k1 - w1) * (waveAmp1 * k1) -
        Math.sin(x * k2 + w2) * (waveAmp2 * k2) +
        Math.cos(x * k3 - w3) * (waveAmp3 * k3);

      const angle = Math.atan(dy);
      const len = Math.sqrt(1 + dy * dy);
      // Unit normal: perpendicular to curve
      const nx = -dy / len;
      const ny = 1 / len;

      return { y, dy, angle, nx, ny };
    };

    // ------------------------------------------------------------------------
    // 5. Main 60fps Render Loop
    // ------------------------------------------------------------------------
    const render = (time: number) => {
      if (isDestroyed) return;

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (isVisible) {
        // Physics update
        if (!isDragging && !prefersReducedMotion) {
          // Scroll impulse integration and smooth exponential damping
          currentVelocity += scrollImpulse * 0.28;
          scrollImpulse *= 0.84;

          // Natural momentum friction decay settling back to idle base speed
          currentVelocity += (baseIdleSpeed - currentVelocity) * Math.min(1, dt * 2.2);

          // Advance flow progress
          progress += currentVelocity * dt;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const timeSec = time * 0.001;
        const halfThick = ribbonThickness * 0.5;

        // Set font for layout measurements
        const fontStr = `700 ${fontSize}px "SaansVF", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.font = fontStr;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Pre-calculate loop metrics
        const letterSpacing = fontSize * 0.07;
        const itemWidths = items.map((item) => {
          let itemW = 0;
          for (const seg of item.segments) {
            for (let i = 0; i < seg.text.length; i++) {
              itemW += ctx.measureText(seg.text[i]).width + letterSpacing;
            }
          }
          return itemW;
        });

        const totalItemsWidth = itemWidths.reduce((a, b) => a + b, 0);
        const totalLoopWidth = totalItemsWidth + items.length * itemGap;

        // Wrap progress cleanly within one loop period
        const loopOffset = ((progress % totalLoopWidth) + totalLoopWidth) % totalLoopWidth;

        // --------------------------------------------------------------------
        // A. Soft Realistic Drop Shadow Beneath Ribbon
        // --------------------------------------------------------------------
        const shadowOffsetY = width < 768 ? 16 : 26;
        ctx.save();
        ctx.beginPath();

        // Top edge of shadow
        const xStart = -80;
        const xEnd = width + 80;
        const sampleStep = 4;

        for (let x = xStart; x <= xEnd; x += sampleStep) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x + nx * halfThick;
          const py = y + ny * halfThick + shadowOffsetY;
          if (x === xStart) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Bottom edge of shadow
        for (let x = xEnd; x >= xStart; x -= sampleStep) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x - nx * halfThick;
          const py = y - ny * halfThick + shadowOffsetY + (width < 768 ? 14 : 22);
          ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.fillStyle = 'rgba(22, 13, 8, 0.04)';
        ctx.filter = 'blur(16px)';
        ctx.fill();
        ctx.restore();

        // --------------------------------------------------------------------
        // B. Continuous Unbroken Ribbon Surface (One Unified Vector Path)
        // --------------------------------------------------------------------
        ctx.save();
        ctx.beginPath();

        // Top boundary curve (from left to right)
        for (let x = xStart; x <= xEnd; x += 2) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x - nx * halfThick;
          const py = y - ny * halfThick;
          if (x === xStart) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Bottom boundary curve (from right to left)
        for (let x = xEnd; x >= xStart; x -= 2) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x + nx * halfThick;
          const py = y + ny * halfThick;
          ctx.lineTo(px, py);
        }

        ctx.closePath();

        // Premium warm ivory paper surface
        const ribbonBg = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.75);
        ribbonBg.addColorStop(0, '#FFFFFF');
        ribbonBg.addColorStop(0.35, '#FAF9F6');
        ribbonBg.addColorStop(0.7, '#F6F4EE');
        ribbonBg.addColorStop(1, '#ECE9E0');
        ctx.fillStyle = ribbonBg;
        ctx.fill();

        // Delicate paper edge boundary (stroke)
        ctx.strokeStyle = 'rgba(22, 13, 8, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // --------------------------------------------------------------------
        // C. Subtle Ambient Lighting & Wave Highlight
        // --------------------------------------------------------------------
        // Clips to the ribbon surface to add gentle paper depth on crests/valleys
        ctx.save();
        ctx.beginPath();
        for (let x = xStart; x <= xEnd; x += 2) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x - nx * halfThick;
          const py = y - ny * halfThick;
          if (x === xStart) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        for (let x = xEnd; x >= xStart; x -= 2) {
          const { y, nx, ny } = getCurve(x, timeSec);
          const px = x + nx * halfThick;
          const py = y + ny * halfThick;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.clip();

        // Wave crest highlight and wave trough shading
        const lightPassStep = 6;
        for (let x = xStart; x <= xEnd; x += lightPassStep) {
          const { y, angle } = getCurve(x, timeSec);
          const lightFactor = Math.sin(angle * 2.2);

          if (lightFactor > 0.15) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(lightFactor * 0.18).toFixed(3)})`;
            ctx.fillRect(x - lightPassStep * 0.5, y - halfThick - 4, lightPassStep + 1, ribbonThickness + 8);
          } else if (lightFactor < -0.15) {
            ctx.fillStyle = `rgba(22, 13, 8, ${(-lightFactor * 0.045).toFixed(3)})`;
            ctx.fillRect(x - lightPassStep * 0.5, y - halfThick - 4, lightPassStep + 1, ribbonThickness + 8);
          }
        }
        ctx.restore();

        // --------------------------------------------------------------------
        // D. Accurate Text-On-Path Typography Alignment
        // --------------------------------------------------------------------
        // Render enough loop repetitions to cover the full width plus margins
        const minX = -100;
        const maxX = width + 100;

        // Find starting loop index
        let cursorX = -loopOffset;
        while (cursorX > minX) {
          cursorX -= totalLoopWidth;
        }

        // Loop until beyond right boundary
        while (cursorX < maxX) {
          for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
            const item = items[itemIdx];

            for (const seg of item.segments) {
              for (let cIdx = 0; cIdx < seg.text.length; cIdx++) {
                const char = seg.text[cIdx];
                const charWidth = ctx.measureText(char).width;
                const charCenterX = cursorX + charWidth * 0.5;

                // Only render glyphs within visible horizontal bounds
                if (charCenterX >= minX - 20 && charCenterX <= maxX + 20) {
                  const { y, angle } = getCurve(charCenterX, timeSec);

                  ctx.save();
                  // Center directly on the ribbon spine curve
                  ctx.translate(charCenterX, y);
                  // Tangent rotation perfectly conforms to curvature
                  ctx.rotate(angle);
                  ctx.fillStyle = seg.color;
                  ctx.fillText(char, 0, 0);
                  ctx.restore();
                }

                cursorX += charWidth + letterSpacing;
              }
            }

            // Spacing between information groups
            cursorX += itemGap;
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [embedded]);

  if (embedded) {
    return (
      <div
        className={`ribbon-canvas-wrap ribbon-canvas-wrap--embedded ${className}`}
        ref={containerRef}
        role="region"
        aria-label="Interactive flowing company achievements ribbon"
      >
        <canvas className="ribbon-canvas" ref={canvasRef} aria-hidden="true" />
        {/* Screen-reader accessible alternative text */}
        <div className="u-sr">
          BloomBiz Creatives: 5+ Years of Experience, 100+ Brands Built, 200+ Happy Clients, Creative Thinking, Digital Innovation, India · UAE · KSA.
        </div>
      </div>
    );
  }

  return (
    <section className={`ribbon-typography-section ${className}`} aria-label="Company Achievements Ribbon">
      <div className="ribbon-typography-header">
        <div className="home-grid">
          <p className="home-label ribbon-label">
            <span className="home-label__num" aria-hidden="true">01</span>Continuous Kinetic Identity
          </p>
          <p className="home-statement ribbon-lead" data-spec="">
            Continuous value creation &amp; scalable digital innovation.
          </p>
        </div>
      </div>

      <div
        className="ribbon-canvas-wrap"
        ref={containerRef}
        role="region"
        aria-label="Interactive flowing company achievements ribbon"
      >
        <canvas className="ribbon-canvas" ref={canvasRef} aria-hidden="true" />
        {/* Screen-reader accessible alternative text */}
        <div className="u-sr">
          BloomBiz Creatives: 5+ Years of Experience, 100+ Brands Built, 200+ Happy Clients, Creative Thinking, Digital Innovation, India · UAE · KSA.
        </div>
      </div>
    </section>
  );
};
