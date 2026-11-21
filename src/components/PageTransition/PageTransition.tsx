import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { projects } from '../../data/projects';

/**
 * PageTransition
 * Elegant, silky smooth 2-phase architectural curtain wipe transition:
 * 1. Upon navigation, 14 architectural louvers sweep down smoothly over the page.
 * 2. Once covered, the route switches instantly and scrolls to the top without visual pop.
 * 3. The curtain then lifts away upward with a harmonic wave stagger and cubic ease,
 *    while the incoming page content subtly breathes into position.
 * Also provides seamless fallback for browser Back/Forward navigation.
 */
export const PageTransition: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const colsRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const [tone, setTone] = useState<string>('var(--main)');
  const isFirstMount = useRef(true);
  const lastPathname = useRef(location.pathname);

  // Helper to resolve tone from target pathname
  const getToneForPath = (path: string): string => {
    const cleanPath = path.replace(/\/+$/, '') || '/';
    const matchedProject = projects.find(
      (p) =>
        cleanPath === `/work/${p.slug}` ||
        path === `/work/${p.slug}/` ||
        path === `/work/${p.slug}`
    );
    return matchedProject ? matchedProject.tone : 'var(--main)';
  };

  // Phase 2: Smooth Curtain Reveal (Lift off)
  const revealCurtain = useCallback((targetTone: string) => {
    setTone(targetTone);
    setIsTransitioning(true);
    isTransitioningRef.current = true;

    const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
    if (!cols.length) {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
      return;
    }

    gsap.killTweensOf(cols);

    // Ensure columns are fully covering from top before lifting
    gsap.set(cols, {
      scaleY: 1,
      transformOrigin: 'top center',
      clipPath: 'none',
      opacity: 1,
    });

    // Reveal: smooth upward lift with harmonic wave stagger and cubic ease
    gsap.to(cols, {
      scaleY: 0,
      duration: 0.58,
      delay: 0.02,
      stagger: {
        amount: 0.22,
        from: 'start',
        ease: 'power2.inOut',
      },
      ease: 'power3.inOut',
      onComplete: () => {
        setIsTransitioning(false);
        isTransitioningRef.current = false;
      },
    });

    // Gently breathe incoming content into position
    gsap.fromTo(
      '#main',
      { opacity: 0.9, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );
  }, []);

  // Phase 1 + Phase 2: Full interactive transition on link click
  const transitionTo = useCallback(
    (targetHref: string) => {
      if (isTransitioningRef.current) return;

      const targetTone = getToneForPath(targetHref);
      setTone(targetTone);
      setIsTransitioning(true);
      isTransitioningRef.current = true;

      const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
      if (!cols.length) {
        navigate(targetHref);
        return;
      }

      gsap.killTweensOf(cols);

      // Phase 1: Columns glide DOWN from top to smoothly drape over page
      gsap.set(cols, {
        transformOrigin: 'top center',
        scaleY: 0,
        clipPath: 'none',
        opacity: 1,
      });

      gsap.to(cols, {
        scaleY: 1,
        duration: 0.36,
        stagger: {
          amount: 0.16,
          from: 'start',
          ease: 'power2.inOut',
        },
        ease: 'power3.inOut',
        onComplete: () => {
          // Page is now fully covered by the curtain
          navigate(targetHref);
          window.scrollTo(0, 0);

          // Allow DOM to mount new route, then gracefully reveal
          requestAnimationFrame(() => {
            setTimeout(() => {
              revealCurtain(targetTone);
            }, 25);
          });
        },
      });
    },
    [navigate, revealCurtain]
  );

  // Intercept standard user link clicks for smooth 2-phase curtain transition
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (cmd/ctrl for new tab) or default-prevented events
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external, tel, mailto, anchor hashes, and admin links
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        href.startsWith('/admin') ||
        anchor.getAttribute('target') === '_blank' ||
        anchor.getAttribute('download') !== null
      ) {
        return;
      }

      // Check current and target URLs
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, window.location.origin);

      // Same page with hash anchor (e.g. /#work or /#hello) -> let native smooth scrolling handle it
      if (currentUrl.pathname === targetUrl.pathname && targetUrl.hash) {
        return;
      }

      // Same exact page
      if (
        currentUrl.pathname === targetUrl.pathname &&
        currentUrl.search === targetUrl.search &&
        !targetUrl.hash
      ) {
        return;
      }

      e.preventDefault();
      transitionTo(targetUrl.pathname + targetUrl.search + targetUrl.hash);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [transitionTo]);

  // Fallback listener for browser Back/Forward navigation or direct location changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastPathname.current = location.pathname;
      return;
    }

    if (lastPathname.current === location.pathname) {
      return;
    }
    lastPathname.current = location.pathname;

    // If an interactive transition is already driving this change, do not double-trigger
    if (isTransitioningRef.current) {
      return;
    }

    // Direct route change (e.g. browser back/forward button): execute smooth reveal
    window.scrollTo(0, 0);
    const targetTone = getToneForPath(location.pathname);
    revealCurtain(targetTone);
  }, [location.pathname, revealCurtain]);

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
