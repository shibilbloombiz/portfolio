import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useScroll,
  useVelocity,
  useSpring,
  useMotionValue,
  useAnimationFrame
} from 'motion/react';
import { projects } from '../../data/projects';

// High-performance crisp thumbnails for all 9 real portfolio projects
const PROJECT_IMAGES: Record<string, string> = {
  'educarrt': '/images/work/projects/educarrt-1-thumb.webp',
  'ftx': '/images/work/projects/ftx-1-thumb.webp',
  'future-safety': '/images/work/projects/future-1-thumb.webp',
  'gadco': '/images/work/projects/gadco-1-thumb.webp',
  'jakkur': '/images/work/projects/jakkur-1-thumb.webp',
  'mocs': '/images/work/projects/mocs-1-thumb.webp',
  'nazzi': '/images/work/projects/nazzi-1-thumb.webp',
  'novara': '/images/work/projects/novara-1-thumb.webp',
  'sabka': '/images/work/projects/sabka-1-thumb.webp'
};

interface GalleryCardItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  sector: string;
  tone: string;
  img: string;
  num: string;
}

export const VelocityGallery3D: React.FC = () => {
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate 3 sets of the 9 projects (27 cards total) for continuous infinite 3D loop
  const cards: GalleryCardItem[] = React.useMemo(() => {
    const list: GalleryCardItem[] = [];
    const setsCount = 3;
    for (let s = 0; s < setsCount; s++) {
      projects.forEach((p, idx) => {
        list.push({
          id: `${p.slug}-${s}`,
          slug: p.slug,
          title: p.title,
          description: p.description,
          sector: p.sector,
          tone: p.tone,
          img: PROJECT_IMAGES[p.slug] || '/images/work/projects/educarrt-1.png',
          num: String(idx + 1).padStart(2, '0')
        });
      });
    }
    return list;
  }, []);

  const totalCards = cards.length;

  // Track dimensions
  const [dimensions, setDimensions] = useState({
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
    cardWidth: 440,
    cardGap: 60
  });

  const updateDimensions = useCallback(() => {
    if (!viewportRef.current) return;
    const vpW = viewportRef.current.clientWidth || window.innerWidth;
    let cW = 440;
    let gap = 60;
    if (vpW <= 767) {
      cW = 280;
      gap = 36;
    } else if (vpW <= 991) {
      cW = 350;
      gap = 48;
    }
    setDimensions({ viewportWidth: vpW, cardWidth: cW, cardGap: gap });
  }, []);

  useEffect(() => {
    updateDimensions();
    const handleResize = () => updateDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  const cardStride = dimensions.cardWidth + dimensions.cardGap;
  const totalTrackWidth = totalCards * cardStride;

  // Scroll velocity tracking with physics spring
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(scrollVelocity, {
    stiffness: 90,
    damping: 22,
    mass: 0.8
  });

  // Drag velocity tracking with physics spring
  const dragVelocityValue = useMotionValue(0);
  const smoothDragVelocity = useSpring(dragVelocityValue, {
    stiffness: 90,
    damping: 22,
    mass: 0.8
  });

  // Physics animation state refs
  const offsetRef = useRef(0);
  const momentumRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hoveredCardIndexRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const didDragRef = useRef(false);
  const lastInteractionTimeRef = useRef(Date.now());
  const timeRef = useRef(0);

  // Preload project thumbnail images for instant crisp display
  useEffect(() => {
    Object.values(PROJECT_IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Check user prefers-reduced-motion
  const prefersReducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = media.matches;
      const listener = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Main continuous 60/120fps render loop
  useAnimationFrame((time, delta) => {
    timeRef.current += (delta / 1000);
    const dt = Math.min(delta / 1000, 0.05);

    const scrollV = smoothScrollVelocity.get();
    const dragV = smoothDragVelocity.get();

    // Combined interactive velocity
    const interactiveVelocity = (scrollV * 0.95) - (dragV * 0.7);

    // Apply scroll translation impulse to track
    if (!isDraggingRef.current && Math.abs(scrollV) > 5) {
      offsetRef.current -= scrollV * 0.12;
      lastInteractionTimeRef.current = Date.now();
    }

    // Apply drag release momentum
    if (!isDraggingRef.current && Math.abs(momentumRef.current) > 0.05) {
      offsetRef.current += momentumRef.current;
      momentumRef.current *= 0.94;
      lastInteractionTimeRef.current = Date.now();
    }

    // Idle automatic continuous drift
    const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
    const canAutoDrift =
      !isDraggingRef.current &&
      !isHoveringRef.current &&
      Math.abs(scrollV) < 8 &&
      Math.abs(momentumRef.current) < 0.1 &&
      timeSinceInteraction > 1200 &&
      !prefersReducedMotionRef.current;

    if (canAutoDrift) {
      // Smooth continuous auto glide (~0.65px per frame at 60fps)
      const autoSpeed = -42 * dt;
      offsetRef.current += autoSpeed;
    }

    // Update each individual card 3D plane
    const vpW = dimensions.viewportWidth;
    const halfVpW = vpW * 0.5;
    const visibleThreshold = halfVpW + dimensions.cardWidth * 1.6;

    // Wave intensity derived from velocity
    const rawWaveIntensity = interactiveVelocity / 550;
    const waveIntensity = prefersReducedMotionRef.current
      ? 0
      : Math.min(Math.max(rawWaveIntensity, -1.8), 1.8);

    for (let i = 0; i < totalCards; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;

      const baseX = i * cardStride;
      const rawOffset = baseX + offsetRef.current;
      let dist = ((rawOffset % totalTrackWidth) + totalTrackWidth) % totalTrackWidth;
      if (dist > totalTrackWidth / 2) {
        dist -= totalTrackWidth;
      }

      // Clip cards that are well offscreen to maximize GPU performance
      if (Math.abs(dist) > visibleThreshold) {
        cardEl.style.visibility = 'hidden';
        continue;
      }

      cardEl.style.visibility = 'visible';

      const normDist = dist / (halfVpW || 1);

      // Base 3D architectural perspective curve
      const baseRotateY = -13 + normDist * -3.5;
      const baseRotateX = 8.5;
      const baseRotateZ = -2.2;
      const baseTranslateZ = -Math.abs(normDist) * 130;
      const baseTranslateY = (normDist * 22) + Math.sin(normDist * Math.PI) * -12;

      // Velocity-linked wave deformation (sinusoidal rippling across distance + time)
      const cardPhase = (dist / 240) + (timeRef.current * 2.8);
      const waveSin = Math.sin(cardPhase) * waveIntensity;
      const waveCos = Math.cos(cardPhase) * waveIntensity;

      const waveTranslateY = waveSin * 52;
      const waveTranslateZ = waveCos * 78;
      const waveRotateX = waveCos * 15;
      const waveRotateY = waveSin * 13;
      const waveRotateZ = waveSin * 6;

      // Hover response (lift forward, face camera, and elevate)
      const isCardHovered = hoveredCardIndexRef.current === i;
      const hoverZ = isCardHovered ? 85 : 0;
      const hoverScale = isCardHovered ? 1.05 : 1.0;
      const hoverRotateFactor = isCardHovered ? 0.2 : 1.0;

      // Compute final transforms
      const finalX = dist;
      const finalY = baseTranslateY + waveTranslateY;
      const finalZ = baseTranslateZ + waveTranslateZ + hoverZ;
      const finalRotX = (baseRotateX + waveRotateX) * hoverRotateFactor;
      const finalRotY = (baseRotateY + waveRotateY) * hoverRotateFactor;
      const finalRotZ = (baseRotateZ + waveRotateZ) * hoverRotateFactor;

      // Apply GPU-accelerated transform matrix
      cardEl.style.transform = `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, ${finalZ.toFixed(2)}px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) rotateZ(${finalRotZ.toFixed(2)}deg) scale(${hoverScale})`;

      // Dynamic z-index layering (cards closer to foreground and hovered card on top)
      const zIndex = Math.round(1000 - Math.abs(dist) + (isCardHovered ? 3000 : 0));
      cardEl.style.zIndex = String(zIndex);
    }
  });

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to main pointer button
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    pointerStartXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    dragDistanceRef.current = 0;
    didDragRef.current = false;
    momentumRef.current = 0;
    lastInteractionTimeRef.current = Date.now();

    if (viewportRef.current) {
      try {
        viewportRef.current.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for browsers that don't support pointer capture
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const deltaX = e.clientX - lastPointerXRef.current;
    dragDistanceRef.current += Math.abs(deltaX);

    if (dragDistanceRef.current > 6) {
      didDragRef.current = true;
    }

    offsetRef.current += deltaX;
    lastInteractionTimeRef.current = Date.now();

    // Calculate instantaneous drag velocity
    const dt = Math.max(now - lastPointerTimeRef.current, 16);
    const instantVel = (deltaX / dt) * 1000;
    dragVelocityValue.set(instantVel);

    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastInteractionTimeRef.current = Date.now();

    // Release momentum with spring damping
    const releaseVelocity = dragVelocityValue.get();
    momentumRef.current = Math.max(-28, Math.min(28, releaseVelocity * 0.022));

    // Smoothly decay drag velocity back to 0
    dragVelocityValue.set(0);

    if (viewportRef.current) {
      try {
        viewportRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }
  };

  // Click handler to open project detail page
  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    // If the pointer dragged more than 6px, prevent navigation click
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
      return;
    }
    navigate(`/work/${slug}/`);
  };

  // Keyboard / arrow navigation
  const handleNavShift = (direction: 'prev' | 'next') => {
    const shift = direction === 'next' ? -cardStride : cardStride;
    momentumRef.current = shift * 0.08;
    lastInteractionTimeRef.current = Date.now();
  };

  return (
    <div className="v3d-gallery-wrap" aria-label="3D Selected Work & Systems Gallery">
      {/* Interactive 3D Perspective Viewport */}
      <div
        className="v3d-viewport"
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="v3d-stage">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[idx] = el; }}
              className="v3d-card"
              data-hover-case=""
              data-tag-label="[ Explore Case ]"
              data-tone={card.tone}
              onClick={(e) => handleCardClick(e, card.slug)}
              onPointerEnter={() => {
                isHoveringRef.current = true;
                hoveredCardIndexRef.current = idx;
              }}
              onPointerLeave={() => {
                isHoveringRef.current = false;
                hoveredCardIndexRef.current = null;
              }}
            >
              <div className="v3d-card__inner">
                {/* Project Image Panel */}
                <img
                  className="v3d-card__img"
                  src={card.img}
                  alt={`${card.title}: ${card.description}`}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Cinematic Vignette Shade */}
                <div className="v3d-card__shade" aria-hidden="true" />

                {/* Top Meta Bar */}
                <div className="v3d-card__meta-top">
                  <span className="v3d-card__num">{card.num}</span>
                  <span className="v3d-card__sector">{card.sector}</span>
                </div>

                {/* Bottom Title & Description Bar */}
                <div className="v3d-card__meta-bottom">
                  <h3 className="v3d-card__title">{card.title}</h3>
                  <p className="v3d-card__desc">{card.description}</p>
                  <span className="v3d-card__action">
                    Explore Project <i aria-hidden="true">→</i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Controls & Gesture Hints */}
      <div className="v3d-controls">
        <div className="v3d-hint">
          <span className="v3d-hint__dot" />
          <span>Drag horizontally or scroll to deform • Click to explore</span>
        </div>

        <div className="v3d-nav">
          <button
            type="button"
            className="v3d-nav__btn"
            onClick={() => handleNavShift('prev')}
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            type="button"
            className="v3d-nav__btn"
            onClick={() => handleNavShift('next')}
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
