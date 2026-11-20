import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

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

export const HeroCurtainCard: React.FC<HeroCurtainCardProps> = ({
  projects,
  slot,
  surface,
  ariaLabel,
  autoPlayInterval = 4200
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextProjectIndex, setNextProjectIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const isTransitioningRef = useRef(false);
  const isHoveredRef = useRef(false);
  isHoveredRef.current = isHovered;

  const currentImgRef = useRef<HTMLImageElement | null>(null);
  const nextImgRef = useRef<HTMLImageElement | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Preload all project images in advance for instantaneous rendering
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

  // Slide transition: Incoming next image enters smoothly from top to bottom
  const triggerTransition = useCallback(
    (targetIndex: number) => {
      if (!projects[targetIndex]) return;
      if (isTransitioningRef.current || targetIndex === currentIndexRef.current) return;

      // Accessibility: respect prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setCurrentIndex(targetIndex);
        return;
      }

      const currentEl = currentImgRef.current;
      const nextEl = nextImgRef.current;

      if (!currentEl || !nextEl) {
        setCurrentIndex(targetIndex);
        return;
      }

      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setNextProjectIndex(targetIndex);

      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }

      // Position the next image directly above the container
      gsap.set(nextEl, { yPercent: -100, autoAlpha: 1 });
      gsap.set(currentEl, { yPercent: 0, autoAlpha: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          if (currentEl) {
            currentEl.src = projects[targetIndex].img;
            gsap.set(currentEl, { yPercent: 0 });
          }
          if (nextEl) {
            gsap.set(nextEl, { yPercent: -100, autoAlpha: 0 });
          }
          setCurrentIndex(targetIndex);
          isTransitioningRef.current = false;
          activeTimelineRef.current = null;
          setIsTransitioning(false);
        }
      });
      activeTimelineRef.current = tl;

      // Animate both elements simultaneously downwards (top to bottom)
      // Next image drops down from above and places cleanly into the frame
      tl.to(currentEl, {
        yPercent: 100,
        duration: 0.85,
        ease: 'power3.inOut'
      }, 0);

      tl.to(nextEl, {
        yPercent: 0,
        duration: 0.85,
        ease: 'power3.inOut'
      }, 0);
    },
    [projects]
  );

  // Automatic rotation: transitions every interval, pausing on hover
  useEffect(() => {
    if (isHovered || isTransitioning || projects.length <= 1) return;

    const timer = setTimeout(() => {
      const nextIdx = (currentIndex + 1) % projects.length;
      triggerTransition(nextIdx);
    }, autoPlayInterval);

    return () => clearTimeout(timer);
  }, [currentIndex, isHovered, isTransitioning, autoPlayInterval, projects.length, triggerTransition]);

  const currentProject = projects[currentIndex] || projects[0];
  const incomingProject = projects[nextProjectIndex] || projects[0];

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
        style={{
          '--tone': currentProject.tone,
          position: 'relative',
          overflow: 'hidden',
          display: 'block',
          width: '100%',
          height: '100%'
        } as React.CSSProperties}
      >
        {/* Current visible resting image */}
        <img
          ref={currentImgRef}
          src={currentProject.img}
          alt={currentProject.label}
          loading="eager"
          decoding="sync"
          className="hero-slide-img"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            willChange: 'transform'
          }}
        />

        {/* Incoming next image entering from top to bottom */}
        <img
          ref={nextImgRef}
          src={incomingProject.img}
          alt={incomingProject.label}
          loading="eager"
          decoding="sync"
          className="hero-slide-img hero-slide-img--incoming"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            willChange: 'transform',
            transform: 'translateY(-100%)',
            visibility: 'hidden'
          }}
        />
      </span>
    </Link>
  );
};
