import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-footer-parallax="" className="footer">
      <footer data-footer-parallax-inner="" className="animated-footer">
        <div className="footer-top">
          <Link className="footer-talk" to="/contact/" data-footer-talk="">
            <span className="footer-talk__mark">
              <span className="footer-talk__word">Let's talk</span>
              <span className="footer-talk__line" data-footer-talk-line=""></span>
            </span>
            <span className="footer-talk__arrow" aria-hidden="true">→</span>
          </Link>
          <a className="footer-link" href="mailto:info@bloombiz.com" data-underline-link="">
            info@bloombiz.com
          </a>
          <a className="footer-link" href="https://www.instagram.com/bloombiztechnohub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
            Instagram
          </a>
          <a className="footer-link" href="https://www.linkedin.com/company/bloombiz-techno-hub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
            LinkedIn
          </a>
          <a className="footer-link" href="https://www.behance.net/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
            Behance
          </a>
          <a className="footer-link" href="https://dribbble.com/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
            Dribbble
          </a>
        </div>

        <section className="section-resource">
          <div className="container build_wrapper">
            <div className="div-block-5">
              <p className="ready_heading mobile">SAY HI.</p>
              <p className="ready_heading mobile">BRING THE IDEA.</p>
              <p className="ready_heading mobile">WE'LL BUILD THE SYSTEM.</p>
            </div>
          </div>
        </section>

        <div className="footer-base home-label">
          <div className="footer-base__brand">
            <img
              src="/images/logos/bloombiz-icon.png"
              alt="BloomBiz Techno Hub"
              className="footer-brand-icon"
              width="28"
              height="16"
            />
            <p className="footer-base__copy">© 2026 BloomBiz Techno Hub. All rights reserved.</p>
          </div>
          <a className="footer-base__up" href="#main" onClick={handleBackToTop} data-back-top="">
            Back to the top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </footer>
      <div data-footer-parallax-dark="" className="footer-wrap__dark"></div>
    </div>
  );
};
