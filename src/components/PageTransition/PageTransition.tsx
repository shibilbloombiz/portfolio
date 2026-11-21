import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { projects } from '../../data/projects';

/**
 * PageTransition
 * Snappy, responsive, silky smooth 2-phase architectural curtain wipe transition:
 * 1. Upon link click, 14 architectural louvers sweep down smoothly (~0.22s).
 * 2. Route switches and window scrolls to top while screen is covered.
 * 3. Curtain gracefully lifts upward (~0.32s) with harmonic stagger and cubic ease.
 * 4. Pointer events are never permanently blocked; clicks are never swallowed.
 * 5. Back/Forward browser navigation executes smooth reveal automatically.
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
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setTone(targetTone);
    const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
    if (!cols.length) {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
      return;
    }

    gsap.killTweensOf(cols);

    // Fast, elegant upward lift with harmonic wave stagger
    gsap.fromTo(
      cols,
      { scaleY: 1, transformOrigin: 'top center', opacity: 1 },
      {
        scaleY: 0,
        duration: 0.32,
        stagger: {
          amount: 0.14,
          from: 'start',
          ease: 'power2.inOut',
        },
        ease: 'power3.out',
        onComplete: () => {
          setIsTransitioning(false);
          isTransitioningRef.current = false;
        },
      }
    );

    // Content gently breathes into position
    gsap.fromTo(
      '#main',
      { opacity: 0.94, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );

    // Safety watchdog: guaranteed release within 600ms
    safetyTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 600);
  }, []);

  // Phase 1 + Phase 2: Full interactive transition on link click
  const transitionTo = useCallback(
    (targetHref: string) => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      const targetTone = getToneForPath(targetHref);
      setTone(targetTone);

      const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
      if (!cols.length) {
        navigate(targetHref);
        window.scrollTo(0, 0);
        return;
      }

      // If already transitioning, fast-track route change directly
      if (isTransitioningRef.current) {
        navigate(targetHref);
        window.scrollTo(0, 0);
        revealCurtain(targetTone);
        return;
      }

      setIsTransitioning(true);
      isTransitioningRef.current = true;
      gsap.killTweensOf(cols);

      // Phase 1: Columns glide down smoothly over page (~0.22s)
      gsap.set(cols, {
        transformOrigin: 'top center',
        scaleY: 0,
        opacity: 1,
      });

      gsap.to(cols, {
        scaleY: 1,
        duration: 0.22,
        stagger: {
          amount: 0.1,
          from: 'start',
          ease: 'power2.inOut',
        },
        ease: 'power3.inOut',
        onComplete: () => {
          // Immediately route to target and scroll top
          navigate(targetHref);
          window.scrollTo(0, 0);

          // Free pointer events immediately so incoming page is never locked
          setIsTransitioning(false);
          isTransitioningRef.current = false;

          // Seamless Phase 2 lift off
          requestAnimationFrame(() => {
            revealCurtain(targetTone);
          });
        },
      });

      // Safety watchdog: ensure transition state never locks up if interrupted
      safetyTimeoutRef.current = setTimeout(() => {
        if (isTransitioningRef.current) {
          navigate(targetHref);
          window.scrollTo(0, 0);
          setIsTransitioning(false);
          isTransitioningRef.current = false;
        }
      }, 700);
    },
    [navigate, revealCurtain]
  );

  // Intercept user link clicks for smooth 2-phase curtain transition
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

      // Same page with hash anchor (e.g. /#work or /#hello) -> native scroll
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
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [transitionTo]);

  // Fallback listener for browser Back/Forward navigation
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

    // Direct route change via back/forward: smooth reveal
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
      aria-hidden="true"
    >
      <div className="container-2 is--full-height">
        <div className="animated-grid__row">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animated-grid__col"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
