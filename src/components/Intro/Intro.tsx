import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

export const Intro: React.FC = () => {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Only show intro on home page root visit
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      return;
    }

    try {
      const alreadyShown = sessionStorage.getItem('bloombiz-intro');
      if (!alreadyShown) {
        setShowIntro(true);
        sessionStorage.setItem('bloombiz-intro', 'true');

        const tl = gsap.timeline({
          onComplete: () => {
            setShowIntro(false);
          }
        });

        tl.fromTo(
          '.intro__cols i',
          { scaleY: 0, transformOrigin: 'top center' },
          { scaleY: 1, duration: 0.5, stagger: 0.03, ease: 'power2.inOut' }
        )
          .fromTo(
            '.intro__ball',
            { y: -300, scale: 0.5, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'bounce.out' },
            '-=0.2'
          )
          .to('.intro', {
            opacity: 0,
            duration: 0.5,
            delay: 0.4,
            ease: 'power2.out'
          });
      }
    } catch (e) {
      setShowIntro(false);
    }
  }, []);

  if (!showIntro) return null;

  return (
    <div className="intro" data-intro-layer="" aria-hidden="true">
      <div className="intro__cols">
        {Array.from({ length: 14 }).map((_, i) => (
          <i key={i} data-intro-col=""></i>
        ))}
      </div>
      <div className="intro__shadow" data-intro-shadow=""></div>
      <div className="intro__ball" data-intro-ball="">
        <img src="/images/shapes/black_big_shape.svg" alt="" width="256" height="256" />
      </div>
    </div>
  );
};
