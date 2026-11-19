import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Register GSAP CustomEase plugin once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isTransitioningRef = useRef(false);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Preload all project images for instant zero-latency rendering
  useEffect(() => {
    projects.forEach((proj) => {
      const img = new Image();
      img.src = proj.img;
    });
  }, [projects]);

  // Transition to a target project with the smooth staggered white curtain wipe
  const goTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex === currentIndex || isTransitioningRef.current) return;
      if (!projects[targetIndex]) return;

      // Respect prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setDisplayedIndex(targetIndex);
        setCurrentIndex(targetIndex);
        return;
      }

      isTransitioningRef.current = true;
      setCurrentIndex(targetIndex);

      // Kill any previous animation
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }

      const strips = stripsRef.current.filter(Boolean);
      if (strips.length === 0) {
        setDisplayedIndex(targetIndex);
        isTransitioningRef.current = false;
        return;
      }

      // Ensure strips start above viewport
      gsap.set(strips, { yPercent: -101 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(strips, { yPercent: -101 });
          isTransitioningRef.current = false;
          activeTimelineRef.current = null;
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
    [currentIndex, projects]
  );

  // Automatic carousel rotation (pauses on hover so user can interact comfortably)
  useEffect(() => {
    if (isHovered || isTransitioningRef.current) return;
    const timer = setInterval(() => {
      const nextIdx = (currentIndex + 1) % projects.length;
      goTo(nextIdx);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, autoPlayInterval, projects.length, goTo]);

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
          key={currentProject.img}
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
                  if (el) stripsRef.current[i] = el;
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
