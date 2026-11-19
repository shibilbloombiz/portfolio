import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuRef = useRef<HTMLElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Animated column curtain reveal on menu open/close
  useEffect(() => {
    const cols = colsRef.current ? Array.from(colsRef.current.children) : [];
    if (!cols.length) return;

    if (isOpen) {
      document.body.setAttribute('data-menu-status', 'open');
      document.body.classList.add('menu-open');

      gsap.killTweensOf(cols);
      // Reference staggered curtain drop
      gsap.fromTo(
        cols,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: '50% 0',
          duration: 0.52,
          stagger: 0.018,
          ease: 'power3.out',
        }
      );

      // Stagger menu links
      const words = menuRef.current?.querySelectorAll('.menu__word');
      if (words && words.length > 0) {
        gsap.fromTo(
          words,
          { yPercent: 105, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.06,
            delay: 0.15,
            ease: 'power3.out',
          }
        );
      }

      // Stagger menu facts & socials
      const meta = menuRef.current?.querySelector('.menu__meta');
      if (meta) {
        gsap.fromTo(
          meta,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' }
        );
      }
    } else {
      document.body.removeAttribute('data-menu-status');
      document.body.classList.remove('menu-open');

      gsap.killTweensOf(cols);
      gsap.to(cols, {
        scaleY: 0,
        transformOrigin: '50% 0',
        duration: 0.35,
        stagger: 0.015,
        ease: 'power3.in',
      });
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/', num: '10' },
    { name: 'Work', path: '/work/', num: '02' },
    { name: 'About', path: '/about/', num: '07' },
    { name: 'Contact', path: '/contact/', num: '01' },
  ];

  return (
    <div
      data-animation="default"
      data-collapse="medium"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="navbar w-nav"
    >
      <div className="underlay-nav">
        <header className="underlay-nav__header">
          <div className="underlay-nav__bar">
            <div data-header-bar="" className="underlay-nav__container nav-menu">
              <Link
                to="/"
                aria-current={location.pathname === '/' ? 'page' : undefined}
                className={`brand-2 w-nav-brand ${location.pathname === '/' ? 'w--current' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-label="BloomBiz Techno Hub, home"
              >
                <div className="logo_wrap">
                  <div className="underlay-nav__logo">
                    <img
                      src={
                        location.pathname.startsWith('/work/') && location.pathname !== '/work/'
                          ? '/images/logos/bloombiz-logo-white.png'
                          : '/images/logos/bloombiz-logo-dark.png'
                      }
                      loading="eager"
                      alt="BloomBiz Techno Hub"
                      className="brand-logo"
                      width="120"
                      height="33"
                    />
                  </div>
                </div>
              </Link>

              {/* Centered navigation links: Home, Works, About, Contact */}
              <nav
                className={`underlay-nav__center ${isOpen ? 'is-hidden' : ''}`}
                aria-label="Main Navigation"
              >
                <Link
                  to="/"
                  className={`underlay-nav__center-link ${location.pathname === '/' ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/work/"
                  className={`underlay-nav__center-link ${location.pathname.startsWith('/work') ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Works
                </Link>
                <Link
                  to="/about/"
                  className={`underlay-nav__center-link ${location.pathname.startsWith('/about') ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact/"
                  className={`underlay-nav__center-link ${location.pathname.startsWith('/contact') ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </nav>

              <button
                data-underlay-nav-toggle=""
                aria-expanded={isOpen}
                aria-label={isOpen ? 'close menu' : 'open menu'}
                className={`underlay-nav__toggle ${isOpen ? 'is-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
              >
                <span className="underlay-nav__toggle-text nav_text">
                  <span className="underlay-nav__toggle-label">
                    {isOpen ? 'Close' : 'Menu'}
                  </span>
                </span>
                <span className="underlay-nav__toggle-icon">
                  <span className="underlay-nav__toggle-bar"></span>
                  <span className="underlay-nav__toggle-bar"></span>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Reference 14-column curtain menu */}
        <nav
          ref={menuRef}
          className={`menu ${isOpen ? 'is-open' : ''}`}
          data-menu=""
          aria-label="Menu"
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          {/* Top band matching page tone */}
          <div className="menu__band" aria-hidden="true"></div>

          {/* 14 structural columns with vertical dividing rules */}
          <div ref={colsRef} className="menu__cols" data-menu-cols="" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, idx) => (
              <i key={idx}></i>
            ))}
          </div>

          <div className="menu__in">
            <ul className="menu__list" role="list">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (link.path === '/work/' && location.pathname.startsWith('/work/'));
                return (
                  <li key={link.path} className="menu__row" data-menu-row="">
                    <Link
                      className={`menu__link ${isActive ? 'is-active' : ''}`}
                      to={link.path}
                      data-menu-link=""
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="menu__word">
                        <span className="menu__mask">
                          <span className="menu__stroke" aria-hidden="true"></span>
                          <span className="menu__text" data-underline-src={link.num}>
                            {link.name}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="menu__meta" data-menu-meta="">
              <dl className="menu__facts">
                <div>
                  <dt className="home-label">Write to</dt>
                  <dd>
                    <a href="mailto:info@bloombiz.com" data-underline-link="">
                      info@bloombiz.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="home-label">Socials</dt>
                  <dd className="menu__socials">
                    <a href="https://www.instagram.com/bloombiztechnohub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
                      Instagram
                    </a>
                    <a href="https://www.linkedin.com/company/bloombiz-techno-hub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
                      LinkedIn
                    </a>
                    <a href="https://www.behance.net/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
                      Behance
                    </a>
                    <a href="https://dribbble.com/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
                      Dribbble
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="menu__copy home-label">© 2026 BloomBiz Techno Hub. All rights reserved.</p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
