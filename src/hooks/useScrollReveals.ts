import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollReveals
 * Recreates the exact scroll reveal animation system from reference moisez.com:
 * 1. [data-reveal-lines]: Splits text into `.reveal-word > span` masking containers,
 *    staggering words up from yPercent: 105 with spring easing.
 * 2. [data-reveal]: Blocks elevate from y: 1.2em, opacity: 0 to 1 as they pass top 88%.
 * 3. [data-reveal-rule]: Horizontal divider lines expand with scaleX / --rule: 1.
 * 4. Image reveal animation (.home-card, [data-work-card], [data-case-fig]):
 *    Outer frame unmasks with clipPath: inset(100% 0% 0% 0%) -> inset(0% 0% 0% 0%)
 *    while the inner photograph counter-scales from 1.08 -> 1.0!
 * 5. [data-portrait-reveal]: Sliced blinds stagger reveal on the About portrait.
 * 6. [data-about-sun]: Sun SVG rotates smoothly from -360deg to 0deg.
 * 7. Underline SVG stroke drawing: paths draw dynamically with strokeDashoffset.
 */
export const useScrollReveals = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Wait for DOM to finish rendering
    const timer = setTimeout(() => {
      const container = document.getElementById('main') || document.body;
      const ctx = gsap.context(() => {
        // 1. Text reveals [data-reveal-lines]
        const lineElements = container.querySelectorAll<HTMLElement>('[data-reveal-lines]');
        lineElements.forEach((el) => {
          if (el.dataset.revealed === 'true') return;

          const text = el.textContent?.trim().replace(/\s+/g, ' ') || '';
          if (!text) return;

          el.setAttribute('aria-label', text);
          el.innerHTML = text
            .split(' ')
            .map(
              (word) =>
                `<span class="reveal-word" aria-hidden="true" style="display:inline-block; overflow:hidden; vertical-align:top; margin: -0.12em -0.12em -0.18em -0.05em; padding: 0.12em 0.12em 0.18em 0.05em;"><span style="display:inline-block; will-change:transform;">${word}</span></span>`
            )
            .join(' ');

          el.dataset.revealed = 'true';
          el.classList.add('is-ready');

          const spans = el.querySelectorAll('.reveal-word > span');
          gsap.from(spans, {
            yPercent: 105,
            stagger: 0.018,
            delay: 0.12,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          });
        });

        // 2. Block reveals [data-reveal]
        const revealElements = container.querySelectorAll<HTMLElement>('[data-reveal]');
        revealElements.forEach((el) => {
          if (el.dataset.revealed === 'true') return;
          el.dataset.revealed = 'true';

          const underline = el.querySelector<SVGPathElement>('.mz-underline path');
          const drawUnderline = () => {
            if (underline) {
              const length = underline.getTotalLength ? underline.getTotalLength() : 250;
              gsap.fromTo(
                underline,
                { strokeDasharray: length, strokeDashoffset: length },
                { strokeDashoffset: 0, duration: 0.9, delay: 0.25, ease: 'power2.out' }
              );
            }
          };

          const isBelow = el.getBoundingClientRect().top > window.innerHeight * 0.88;
          if (isBelow) {
            gsap.set(el, { y: '1.2em', opacity: 0 });
            ScrollTrigger.create({
              trigger: el,
              start: 'top 88%',
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  y: 0,
                  opacity: 1,
                  duration: 0.58,
                  ease: 'power3.out',
                });
                drawUnderline();
              },
            });
          } else {
            drawUnderline();
          }
        });

        // 3. Exact Reference Image Reveal Animation on Project Cards (.home-card / [data-work-card])
        const projectCards = container.querySelectorAll<HTMLElement>('.home-card, [data-work-card]');
        projectCards.forEach((card) => {
          if (card.dataset.imgRevealed === 'true') return;
          card.dataset.imgRevealed = 'true';

          const image = card.querySelector<HTMLElement>('.home-card__image');
          const art = card.querySelector<HTMLElement>('.home-card__image img, .home-card__image .home-ph');
          const textElements = card.querySelectorAll<HTMLElement>('.home-card__name, .home-card__line');

          if (image && art) {
            gsap.set(image, { clipPath: 'inset(100% 0% 0% 0%)' });
            gsap.set(art, { scale: 1.08 });
            if (textElements.length > 0) {
              gsap.set(textElements, { clipPath: 'inset(0% 0% 100% 0%)', y: '0.5em' });
            }

            ScrollTrigger.create({
              trigger: card,
              start: 'top 82%',
              once: true,
              onEnter: () => {
                // Outer image shutter slides open
                gsap.to(image, {
                  clipPath: 'inset(0% 0% 0% 0%)',
                  duration: 0.75,
                  ease: 'power3.out',
                  clearProps: 'clipPath',
                });
                // Inner photograph counter-scales to 1.0
                gsap.to(art, {
                  scale: 1,
                  duration: 0.85,
                  ease: 'power3.out',
                  clearProps: 'transform',
                });
                // Text unmasks with stagger
                if (textElements.length > 0) {
                  gsap.to(textElements, {
                    clipPath: 'inset(-30% -5% -30% -5%)',
                    y: 0,
                    stagger: 0.08,
                    delay: 0.08,
                    duration: 0.6,
                    ease: 'power2.out',
                    clearProps: 'clipPath,transform',
                  });
                }
              },
            });
          }
        });

        // 4. Exact Reference Case Study Figures Image Reveal ([data-case-fig])
        const caseFigs = container.querySelectorAll<HTMLElement>('[data-case-fig]');
        caseFigs.forEach((fig) => {
          if (fig.dataset.figRevealed === 'true') return;
          fig.dataset.figRevealed = 'true';

          const imgWrap = fig.querySelector<HTMLElement>('.case-fig__img');
          const art = fig.querySelector<HTMLElement>('.case-fig__art');

          if (imgWrap && art) {
            gsap.set(imgWrap, { clipPath: 'inset(100% 0% 0% 0%)' });
            gsap.set(art, { scale: 1.08 });

            ScrollTrigger.create({
              trigger: fig,
              start: 'top 85%',
              once: true,
              onEnter: () => {
                gsap.to(imgWrap, {
                  clipPath: 'inset(0% 0% 0% 0%)',
                  duration: 0.8,
                  ease: 'power3.out',
                  clearProps: 'clipPath',
                });
                gsap.to(art, {
                  scale: 1,
                  duration: 1.25,
                  ease: 'power2.out',
                  clearProps: 'transform',
                });
              },
            });
          }
        });

        // 5. Rule / Divider reveals [data-reveal-rule]
        const ruleElements = container.querySelectorAll<HTMLElement>('[data-reveal-rule]');
        ruleElements.forEach((el) => {
          if (el.dataset.revealed === 'true') return;
          el.dataset.revealed = 'true';

          const items = Array.from(el.children) as HTMLElement[];
          const staggerTime = parseFloat(el.dataset.revealRule || '0.06') || 0.06;

          items.forEach((child) => child.style.setProperty('--rule', '0'));

          const animateRules = (delay = 0) => {
            gsap.to(items, {
              '--rule': 1,
              stagger: staggerTime,
              delay,
              duration: 0.65,
              ease: 'power2.out',
            });
          };

          const isBelow = el.getBoundingClientRect().top > window.innerHeight * 0.88;
          if (isBelow) {
            ScrollTrigger.create({
              trigger: el,
              start: 'top 88%',
              once: true,
              onEnter: () => animateRules(0),
            });
          } else {
            animateRules(0.2);
          }
        });

        // 6. Portrait blinds sliced reveal [data-portrait-reveal]
        const portraitElements = container.querySelectorAll<HTMLElement>('[data-portrait-reveal]');
        portraitElements.forEach((el) => {
          const slices = el.querySelectorAll('.about-slices i');
          if (slices.length > 0) {
            el.classList.add('is-ready');
            gsap.fromTo(
              slices,
              { scaleY: 1 },
              {
                scaleY: 0,
                transformOrigin: '50% 0',
                stagger: 0.06,
                duration: 0.65,
                ease: 'power3.inOut',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  once: true,
                },
              }
            );
          }
        });

        // 7. Sun SVG spin animation [data-about-sun]
        const suns = container.querySelectorAll<HTMLElement>('[data-about-sun] svg');
        suns.forEach((svg) => {
          gsap.fromTo(
            svg,
            { rotation: -360 },
            {
              rotation: 0,
              delay: 0.4,
              duration: 1.1,
              transformOrigin: '50% 50%',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: svg,
                start: 'top 90%',
                once: true,
              },
            }
          );
        });

        // Refresh triggers on page layout change
        ScrollTrigger.refresh();
      }, container);

      return () => {
        ctx.revert();
      };
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);
};
