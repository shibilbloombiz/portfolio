import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor
 * Recreates the exact reference cursor experience:
 * 1. Precision cursor dot & fluid ring with difference blend mode and interactive expanding states.
 * 2. The exact floating "[ Open the case ]" spring-physics tag that follows over case study items ([data-hover-case]).
 */
export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hoverTagRef = useRef<HTMLDivElement>(null);
  const [tagText, setTagText] = useState('[ Live View ]');

  useEffect(() => {
    // Only activate custom cursor on fine pointer devices (desktop/mouse)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const hoverTag = hoverTagRef.current;
    if (!dot || !ring || !hoverTag) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let tagX = -100;
    let tagY = -100;

    let tagScale = 0;
    let targetTagScale = 0;

    let isHoveringInteractive = false;
    let isVisible = false;
    let animFrame: number;

    const offset = 16;
    const padding = 8;

    const onMove = (clientX: number, clientY: number, target: HTMLElement | null) => {
      mouseX = clientX;
      mouseY = clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        tagX = mouseX + offset;
        tagY = mouseY + offset;
      }

      // Check if hovering over a case study item
      const caseItem = target?.closest('[data-hover-case], .home-card, .work-row, .home-slot, .case-next') as HTMLElement | null;
      if (caseItem) {
        targetTagScale = 1;
        const customLabel = caseItem.getAttribute('data-tag-label');
        setTagText(customLabel || '[ Live View ]');
      } else {
        targetTagScale = 0;
      }

      // Check if hovering over interactive clickable elements
      const interactive = target?.closest('a, button, input, [role="button"], .about-card, .home-kern__letter, .contact-chip, .line-btn');
      isHoveringInteractive = !!interactive && !caseItem;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      onMove(e.clientX, e.clientY, e.target as HTMLElement | null);
    };

    const onMouseMove = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY, e.target as HTMLElement | null);
    };

    const onPointerLeave = () => {
      isVisible = false;
      targetTagScale = 0;
    };

    const onPointerDown = () => {
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(0.85)`;
      }
    };

    const onPointerUp = () => {
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${isHoveringInteractive ? 1.6 : 1})`;
      }
    };

    const loop = () => {
      if (isVisible) {
        // Direct follow for cursor dot
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        dot.style.opacity = '1';

        // Fluid spring interpolation for ring
        ringX += (mouseX - ringX) * 0.22;
        ringY += (mouseY - ringY) * 0.22;
        const scale = isHoveringInteractive ? 1.6 : 1;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
        ring.style.opacity = '1';

        // Spring calculation for hover tag
        const tagWidth = hoverTag.offsetWidth || 135;
        const tagHeight = hoverTag.offsetHeight || 32;

        let targetX = mouseX + offset;
        let targetY = mouseY + offset;

        // Viewport boundaries clamp
        if (targetX + tagWidth > window.innerWidth - padding) {
          targetX = mouseX - offset - tagWidth;
        }
        if (targetY + tagHeight > window.innerHeight - padding) {
          targetY = mouseY - offset - tagHeight;
        }

        tagX += (targetX - tagX) * 0.24;
        tagY += (targetY - tagY) * 0.24;
        tagScale += (targetTagScale - tagScale) * 0.22;

        hoverTag.style.transform = `translate3d(${tagX.toFixed(1)}px, ${tagY.toFixed(1)}px, 0) scale(${Math.max(0, tagScale).toFixed(3)})`;
        hoverTag.style.opacity = tagScale > 0.02 ? '1' : '0';
        hoverTag.style.display = tagScale > 0.01 ? 'inline-flex' : 'none';
      } else {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
        hoverTag.style.opacity = '0';
        hoverTag.style.display = 'none';
      }

      animFrame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    animFrame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Precision cursor dot */}
      <div
        ref={dotRef}
        className="custom-cursor__dot"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0)',
          margin: '-2.5px 0 0 -2.5px',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Fluid difference-blend follower ring */}
      <div
        ref={ringRef}
        className="custom-cursor__ring"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0)',
          margin: '-16px 0 0 -16px',
          transition: 'opacity 0.2s ease, width 0.25s cubic-bezier(0.25, 1, 0.5, 1), height 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />

      {/* Reference floating case tag with spring motion */}
      <div
        ref={hoverTagRef}
        className="hover-tag"
        data-hover-tag=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 65,
          display: 'none',
          alignItems: 'center',
          padding: '0.45em 0.75em',
          border: '1px solid var(--shell-rule, #d4cebe)',
          backgroundColor: 'var(--sand, #ede8db)',
          color: 'var(--dark-brown, #160d08)',
          boxShadow: '0 0.4em 1em rgba(22, 13, 8, 0.15)',
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
          transformOrigin: '0 0',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <span className="about-label">{tagText}</span>
      </div>
    </>
  );
};
