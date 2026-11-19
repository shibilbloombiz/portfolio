import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Register GSAP CustomEase plugin once safely
if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(CustomEase);
    CustomEase.create('curtainWipeEase', '0.76, 0, 0.24, 1');
  } catch (e) {
    // Fallback if already defined
  }
}

export interface HeroProjectItem {
  href: string;
  img: string;
  tone: string;
  label: string;
}

interface HeroCurtainCardProps {
  projects: HeroProjectItem[];
  slot: 'print' | 'screen' | 'space';
  surface: 'print' | 'screen' | 'space';
  ariaLabel: string;
  autoPlayInterval?: number;
}

const STRIP_COUNT = 10;
const STRIP_DURATION = 0.44;
const STRIP_STAGGER = 0.046;

export const HeroCurtainCard: React.FC<HeroCurtainCardProps> = ({
  projects,
  slot,
  surface,
  ariaLabel,
  autoPlayInterval = 4000
}) => {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayedIndexRef = useRef(0);
  displayedIndexRef.current = displayedIndex;

  const isTransitioningRef = useRef(false);
  const isHoveredRef = useRef(false);
  isHoveredRef.current = isHovered;

  const stripsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Preload all project images for instant zero-latency rendering
  useEffect(() => {
    projects.forEach((proj) => {
      const img = new Image();
      img.src = proj.img;
    });
  }, [projects]);

  // Clean up GSAP animation on unmount
  useEffect(() => {
    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
    };
  }, []);

  // Transition to a target project with the smooth staggered white curtain wipe
  const triggerTransition = useCallback(
    (targetIndex: number) => {
      if (!projects[targetIndex]) return;
      if (isTransitioningRef.current || targetIndex === displayedIndexRef.current) return;

      // Respect prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setDisplayedIndex(targetIndex);
        return;
      }

      isTransitioningRef.current = true;
      setIsTransitioning(true);

      // Kill any previous animation
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }

      const strips = stripsRef.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (strips.length === 0) {
        setDisplayedIndex(targetIndex);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        return;
      }

      // Ensure strips start above viewport
      gsap.set(strips, { yPercent: -101 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(strips, { yPercent: -101 });
          isTransitioningRef.current = false;
          activeTimelineRef.current = null;
          setIsTransitioning(false);
        }
      });
      activeTimelineRef.current = tl;

      // 1. Wipe in: Pure white curtains cascade downward sequentially
      tl.to(strips, {
        yPercent: 0,
        duration: STRIP_DURATION,
        stagger: { each: STRIP_STAGGER, from: 'start' },
        ease: 'curtainWipeEase'
      })
        // 2. ONLY when 100% covered by white strips, swap the underlying image safely
        .call(() => {
          setDisplayedIndex(targetIndex);
        })
        // 3. Hold closed for 80ms to ensure the underlying swap renders with zero blink
        .to({}, { duration: 0.08 })
        // 4. Wipe out: White curtains cascade downward away sequentially to reveal the new project
        .to(strips, {
          yPercent: 101,
          duration: STRIP_DURATION,
          stagger: { each: STRIP_STAGGER, from: 'start' },
          ease: 'curtainWipeEase'
        });
    },
    [projects]
  );

  // Automatic carousel rotation (pauses on hover so user can interact comfortably)
  useEffect(() => {
    if (isHovered || isTransitioning || projects.length <= 1) return;

    const timer = setTimeout(() => {
      const nextIdx = (displayedIndex + 1) % projects.length;
      triggerTransition(nextIdx);
    }, autoPlayInterval);

    return () => clearTimeout(timer);
  }, [displayedIndex, isHovered, isTransitioning, autoPlayInterval, projects.length, triggerTransition]);

  const currentProject = projects[displayedIndex] || projects[0];

  return (
    <Link
      className="home-slot hero-curtain-card"
      to={currentProject.href}
      data-tone={currentProject.tone}
      data-slot={slot}
      aria-label={`${ariaLabel}: ${currentProject.label}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <span
        className="home-ph home-ph--img"
        data-surface={surface}
        style={{ '--tone': currentProject.tone } as React.CSSProperties}
      >
        {/* Underlying project image with sync decoding for zero-blink paint */}
        <img
          src={currentProject.img}
          alt={currentProject.label}
          loading="eager"
          decoding="sync"
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Motion.dev Staggered White Curtain Wipe Overlay */}
        <div className="curtain-wipe-overlay" aria-hidden="true">
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <div key={i} className="curtain-wipe-col">
              <div
                ref={(el) => {
                  stripsRef.current[i] = el;
                }}
                className="curtain-wipe-strip"
              />
            </div>
          ))}
        </div>
      </span>
    </Link>
  );
};
