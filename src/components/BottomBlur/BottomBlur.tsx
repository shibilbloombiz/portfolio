import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * BottomBlur and ScrollMeter
 * Recreates the exact reference progressive glass blur sticky bar at the bottom of the viewport
 * along with the precision 1px scroll-meter tracking indicator.
 */
export const BottomBlur: React.FC = () => {
  const blurRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const blurEl = blurRef.current;
    const meterEl = meterRef.current;
    const thumbEl = thumbRef.current;
    if (!blurEl) return;

    // Exact reference formula from moisez.com site.js
    const l = 0.12; // top threshold
    const u = 0.20; // bottom threshold
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const update = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - vh;

      if (maxScroll <= 20) {
        blurEl.style.setProperty('--blur-k', '0');
        blurEl.style.visibility = 'hidden';
        if (meterEl) meterEl.classList.add('is-idle');
        return;
      }

      const distFromBottom = maxScroll - scrollY;
      const topFactor = smoothstep(clamp(scrollY / (vh * l), 0, 1));
      const bottomFactor = smoothstep(clamp(distFromBottom / (vh * u), 0, 1));
      const blurK = Math.min(topFactor, bottomFactor);

      blurEl.style.setProperty('--blur-k', blurK.toFixed(3));
      blurEl.style.visibility = blurK < 0.004 ? 'hidden' : 'visible';

      if (meterEl && thumbEl) {
        meterEl.classList.remove('is-idle');
        const ratio = Math.min(1, vh / docHeight);
        const thumbHeightFraction = Math.max(0.12, ratio);
        const scrollFraction = clamp(scrollY / maxScroll, 0, 1);

        thumbEl.style.height = `${thumbHeightFraction * 100}%`;
        const translateY = (scrollFraction * (1 - thumbHeightFraction) * 100) / thumbHeightFraction;
        thumbEl.style.transform = `translateY(${translateY}%)`;
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [location.pathname]);

  return (
    <>
      {/* 5-layer progressive glass blur container that sticks to the bottom */}
      <div
        ref={blurRef}
        className="progressive-blur"
        data-bottom-blur=""
        aria-hidden="true"
      >
        <div className="progressive-blur__layer is--1"></div>
        <div className="progressive-blur__layer is--2"></div>
        <div className="progressive-blur__layer is--3"></div>
        <div className="progressive-blur__layer is--4"></div>
        <div className="progressive-blur__layer is--5"></div>
      </div>

      {/* Difference-blended scroll tracking indicator */}
      <div ref={meterRef} className="scroll-meter" aria-hidden="true">
        <i ref={thumbRef} className="scroll-meter__thumb"></i>
      </div>
    </>
  );
};
