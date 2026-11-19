import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { projects } from '../../data/projects';

/**
 * PageTransition
 * Recreates the exact reference 14-column curtain wipe page reveal animation:
 * Whenever entering a new page, 14 architectural columns matching the page's tone
 * wipe and lift smoothly with staggered spring easing, seamlessly revealing the new page.
 */
export const PageTransition: React.FC = () => {
  const location = useLocation();
  const colsRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tone, setTone] = useState<string>('var(--main)');
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Avoid transition on first mount since Intro handles initial load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Determine target tone for the page
    const matchedProject = projects.find(
      (p) => location.pathname === `/work/${p.slug}/` || location.pathname === `/work/${p.slug}`
    );
    const targetTone = matchedProject ? matchedProject.tone : 'var(--main)';
    setTone(targetTone);
    setIsTransitioning(true);

    const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
    if (!cols.length) return;

    // Reset columns covering the page
    gsap.killTweensOf(cols);
    gsap.set(cols, { clipPath: 'inset(0% 0% 0% 0%)' });

    // Scroll to top
    window.scrollTo(0, 0);

    // Staggered column curtain lift reveal
    gsap.to(cols, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.65,
      delay: 0.05,
      stagger: {
        amount: 0.28,
        from: 'start',
      },
      ease: 'power3.inOut',
      onComplete: () => {
        setIsTransitioning(false);
      },
    });
  }, [location.pathname]);

  return (
    <div
      data-transition-wrap=""
      className="transition"
      style={{
        zIndex: 2147483640,
        pointerEvents: isTransitioning ? 'all' : 'none',
      }}
    >
      <div
        ref={colsRef}
        className={`transition__cols ${isTransitioning ? 'is-active is-tone' : ''}`}
        data-transition-cols=""
        aria-hidden="true"
        style={{ '--transition-tone': tone } as React.CSSProperties}
      >
        {Array.from({ length: 14 }).map((_, idx) => (
          <i key={idx}></i>
        ))}
      </div>
    </div>
  );
};

export const AnimatedGrid: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <div
      data-animated-grid=""
      className={`animated-grid ${isVisible ? 'is-visible' : ''}`}
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <div className="container-2 is--full-height">
        <div className="animated-grid__row">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} data-animated-grid-col="" className="animated-grid__col"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
