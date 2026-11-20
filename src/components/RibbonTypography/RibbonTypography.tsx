import React, { useEffect, useRef } from 'react';

interface RibbonTypographyProps {
  className?: string;
}

export const RibbonTypography: React.FC<RibbonTypographyProps> = ({ className = '' }) => {
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

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ------------------------------------------------------------------------
    // 1. Offscreen High-DPI Typography Ribbon Texture Builder
    // ------------------------------------------------------------------------
    const ribbonHeight = 120; // Height of the ribbon strip in logical pixels
    const textureCanvas = document.createElement('canvas');
    const textureCtx = textureCanvas.getContext('2d');
    if (!textureCtx) return;

    // Statements to display on the continuous ribbon
    const items = [
      { num: '5+', title: 'YEARS OF EXPERIENCE', tag: 'PROVEN EXPERTISE', highlight: true },
      { num: '100+', title: 'BRANDS BUILT', tag: 'GLOBAL IMPACT', highlight: false },
      { num: '200+', title: 'HAPPY CLIENTS', tag: 'TRUSTED PARTNERSHIPS', highlight: true },
      { num: 'CREATIVE', title: 'THINKING', tag: 'SYSTEMS ARCHITECTURE', highlight: false },
      { num: 'DIGITAL', title: 'INNOVATION', tag: 'AI & CLOUD AUTOMATION', highlight: true },
      { num: 'GLOBAL', title: 'INDIA · UAE · KSA', tag: 'WORLDWIDE DELIVERY', highlight: false }
    ];

    // Build repeating ribbon layout on the texture canvas
    const buildTexture = () => {
      // Calculate item dimensions
      const itemWidth = 520;
      const totalWidth = itemWidth * items.length;

      textureCanvas.width = totalWidth;
      textureCanvas.height = ribbonHeight;

      // Ribbon background: warm white/paper ivory with subtle surface texture
      const bgGrad = textureCtx.createLinearGradient(0, 0, 0, ribbonHeight);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.5, '#FAF9F6');
      bgGrad.addColorStop(1, '#F3F1EC');

      textureCtx.fillStyle = bgGrad;
      textureCtx.fillRect(0, 0, totalWidth, ribbonHeight);

      // Top and bottom decorative borders (paper edge + accent pinstripe)
      textureCtx.strokeStyle = 'rgba(22, 13, 8, 0.12)';
      textureCtx.lineWidth = 1;
      textureCtx.beginPath();
      textureCtx.moveTo(0, 1);
      textureCtx.lineTo(totalWidth, 1);
      textureCtx.moveTo(0, ribbonHeight - 1);
      textureCtx.lineTo(totalWidth, ribbonHeight - 1);
      textureCtx.stroke();

      // Top subtle orange accent pinstripe
      textureCtx.strokeStyle = '#F15A24';
      textureCtx.lineWidth = 2.5;
      textureCtx.beginPath();
      textureCtx.moveTo(0, 3);
      textureCtx.lineTo(totalWidth, 3);
      textureCtx.stroke();

      // Bottom subtle graphite pinstripe
      textureCtx.strokeStyle = 'rgba(22, 13, 8, 0.08)';
      textureCtx.lineWidth = 1.5;
      textureCtx.beginPath();
      textureCtx.moveTo(0, ribbonHeight - 3);
      textureCtx.lineTo(totalWidth, ribbonHeight - 3);
      textureCtx.stroke();

      // Draw each typographic block
      items.forEach((item, idx) => {
        const startX = idx * itemWidth;

        // Subtle vertical segment separator
        textureCtx.strokeStyle = 'rgba(22, 13, 8, 0.07)';
        textureCtx.lineWidth = 1;
        textureCtx.beginPath();
        textureCtx.moveTo(startX, 10);
        textureCtx.lineTo(startX, ribbonHeight - 10);
        textureCtx.stroke();

        // 1. Tag / Badge
        textureCtx.font = '500 11px "Office Code Pro", monospace, sans-serif';
        textureCtx.fillStyle = item.highlight ? '#F15A24' : 'rgba(22, 13, 8, 0.55)';
        textureCtx.letterSpacing = '0.12em';
        textureCtx.fillText(`[ ${item.tag} ]`, startX + 36, 32);

        // 2. Large Number or Lead Heading
        textureCtx.font = '800 44px "SaansVF", -apple-system, BlinkMacSystemFont, sans-serif';
        textureCtx.fillStyle = item.highlight ? '#F15A24' : '#160D08';
        textureCtx.letterSpacing = '-0.02em';
        textureCtx.fillText(item.num, startX + 36, 76);

        // 3. Supporting Title / Statement
        const numMetrics = textureCtx.measureText(item.num);
        const titleX = startX + 36 + numMetrics.width + 16;
        textureCtx.font = '700 21px "SaansVF", -apple-system, BlinkMacSystemFont, sans-serif';
        textureCtx.fillStyle = '#160D08';
        textureCtx.letterSpacing = '0.04em';
        textureCtx.fillText(item.title, titleX, 72);

        // 4. Diamond / Star divider
        textureCtx.fillStyle = '#F15A24';
        const divX = startX + itemWidth - 28;
        const divY = ribbonHeight / 2;
        textureCtx.beginPath();
        textureCtx.arc(divX, divY, 3.5, 0, Math.PI * 2);
        textureCtx.fill();
      });

      return totalWidth;
    };

    const textureWidth = buildTexture();

    // ------------------------------------------------------------------------
    // 2. Continuous Flowing 3D Ribbon Deformation Engine
    // ------------------------------------------------------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height || 460);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Motion variables
    let scrollOffset = 0;
    let baseSpeed = 58; // pixels per second
    let currentSpeed = baseSpeed;
    let lastTime = performance.now();

    // Scroll velocity integration
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVelocity = deltaY * 1.8;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Drag interaction
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartScroll = scrollOffset;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      scrollOffset = dragStartScroll - dx * 1.5;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ------------------------------------------------------------------------
    // 3. Render Loop: Ribbon Wave & Slice Texture Mapping
    // ------------------------------------------------------------------------
    const render = (time: number) => {
      if (isDestroyed) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update flow speed with spring damping back to base speed
      if (!isDragging && !prefersReducedMotion) {
        currentSpeed += (baseSpeed - currentSpeed) * 0.08;
        currentSpeed += scrollVelocity * 0.35;
        scrollVelocity *= 0.88; // Damping
        scrollOffset += currentSpeed * dt;
      }

      if (scrollOffset >= textureWidth) {
        scrollOffset %= textureWidth;
      } else if (scrollOffset < 0) {
        scrollOffset = (scrollOffset % textureWidth) + textureWidth;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle warm ivory ambient paper background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, 'rgba(243, 242, 238, 0)');
      bg.addColorStop(0.5, 'rgba(243, 242, 238, 0.85)');
      bg.addColorStop(1, 'rgba(243, 242, 238, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const tSec = time * 0.001;
      const centerY = height * 0.52;

      // Organic Wave Parametric Function:
      // Computes ribbon center (x, y), slope angle, and 3D depth scale z
      const getWave = (x: number) => {
        // Multi-frequency sine & cosine wave for organic S-curves
        const wave1 = Math.sin(x * 0.0028 - tSec * 1.25) * 58;
        const wave2 = Math.cos(x * 0.0055 + tSec * 0.85) * 26;
        const wave3 = Math.sin(x * 0.0012 + tSec * 0.5) * 16;
        const y = centerY + wave1 + wave2 + wave3;

        // Derivative dy/dx for local surface normal & tangent
        const dy =
          Math.cos(x * 0.0028 - tSec * 1.25) * 58 * 0.0028 -
          Math.sin(x * 0.0055 + tSec * 0.85) * 26 * 0.0055 +
          Math.cos(x * 0.0012 + tSec * 0.5) * 16 * 0.0012;

        const angle = Math.atan(dy);

        // Subtle 3D perspective depth variation:
        // When ribbon undulates, parts come closer (larger, brighter) or recede
        const depth = Math.sin(x * 0.0032 - tSec * 0.95);
        const scaleZ = 1 + depth * 0.12; // +/- 12% width scale

        return { y, angle, scaleZ, depth };
      };

      // ----------------------------------------------------------------------
      // Step A: Draw Ribbon Ambient Soft Drop Shadow
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      const sliceStep = 4; // 4px sampling for smooth shadow
      const shadowOffsetY = 38;

      // Top edge of shadow
      for (let x = -40; x <= width + 40; x += sliceStep) {
        const { y, angle, scaleZ } = getWave(x);
        const halfH = (ribbonHeight * scaleZ) / 2;
        const sy = y + Math.cos(angle) * halfH + shadowOffsetY;
        if (x === -40) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }

      // Bottom edge of shadow
      for (let x = width + 40; x >= -40; x -= sliceStep) {
        const { y, angle, scaleZ } = getWave(x);
        const halfH = (ribbonHeight * scaleZ) / 2;
        const sy = y + Math.cos(angle) * halfH + shadowOffsetY + 22;
        ctx.lineTo(x, sy);
      }
      ctx.closePath();

      ctx.fillStyle = 'rgba(22, 13, 8, 0.055)';
      ctx.filter = 'blur(14px)';
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------------------------
      // Step B: Render Ribbon Surface & Typography Slices
      // We slice the pre-rendered texture in 2.5px strips and map each strip
      // along the normal and tangent of the waving ribbon curve!
      // ----------------------------------------------------------------------
      const sliceW = 3; // 3px vertical slice width
      const totalSlices = Math.ceil((width + 80) / sliceW);

      for (let i = 0; i < totalSlices; i++) {
        const screenX = -40 + i * sliceW;
        const { y, angle, scaleZ, depth } = getWave(screenX);

        // Map screenX + scrollOffset to texture coordinate
        const texU = ((screenX + scrollOffset) % textureWidth + textureWidth) % textureWidth;

        // Current ribbon height with perspective depth
        const currentH = ribbonHeight * scaleZ;

        ctx.save();
        ctx.translate(screenX, y);
        ctx.rotate(angle);

        // Draw the vertical strip from the typography texture
        ctx.drawImage(
          textureCanvas,
          texU, 0, sliceW, ribbonHeight, // source slice
          -sliceW / 2, -currentH / 2, sliceW, currentH // destination slice on ribbon
        );

        // Realistic Paper Lighting & Dimensional Shading:
        // Angle of ribbon surface relative to light source creates highlights and shadows
        const lightFactor = Math.sin(angle) * 0.16 + depth * 0.08;
        if (lightFactor > 0) {
          // Highlight on wave crest
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.24, lightFactor * 1.2).toFixed(3)})`;
          ctx.fillRect(-sliceW / 2, -currentH / 2, sliceW, currentH);
        } else {
          // Soft shade on wave trough
          ctx.fillStyle = `rgba(22, 13, 8, ${Math.min(0.18, -lightFactor * 1.1).toFixed(3)})`;
          ctx.fillRect(-sliceW / 2, -currentH / 2, sliceW, currentH);
        }

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

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

      <div className="ribbon-canvas-wrap" ref={containerRef}>
        <canvas className="ribbon-canvas" ref={canvasRef} aria-hidden="true" />
        {/* Screen-reader accessible alternative text */}
        <div className="u-sr">
          BloomBiz Creatives: 5+ Years of Experience, 100+ Brands Built, 200+ Happy Clients, Creative Thinking, Digital Innovation, India · UAE · KSA.
        </div>
      </div>
    </section>
  );
};
