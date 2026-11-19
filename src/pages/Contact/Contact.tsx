import React, { useState } from 'react';
import { useMontevideoClock } from '../../hooks/useMontevideoClock';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { Footer } from '../../components/Footer/Footer';

export const Contact: React.FC = () => {
  const time = useMontevideoClock();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('info@bloombiz.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="contact-page">
      <section className="home contact" data-contact="" aria-labelledby="contact-title">
        <div className="home-grid contact__grid">
          <aside className="contact__aside" data-case-rise="">
            <h1 className="u-sr" id="contact-title">Contact</h1>

            <div className="contact__row">
              <p className="home-label contact__muted">Or just write</p>
              <p className="contact__email-row">
                <button
                  className="contact__value contact__email"
                  type="button"
                  data-copy-email="info@bloombiz.com"
                  data-underline-link=""
                  onClick={handleCopyEmail}
                >
                  info@bloombiz.com
                </button>{' '}
                {copied && (
                  <span className="home-label contact__copied is-on" aria-live="polite">
                    Copied
                  </span>
                )}
              </p>
            </div>

            <div className="contact__row">
              <p className="home-label contact__muted">HQ / India</p>
              <p className="contact__value">
                It's <span data-clock="">{time}</span> here
              </p>
            </div>

            <div className="contact__row">
              <p className="home-label contact__muted">Socials</p>
              <ul className="contact__socials">
                <li>
                  <a className="contact__value" href="https://www.instagram.com/bloombiztechnohub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
                    Instagram
                  </a>
                </li>
                <li>
                  <a className="contact__value" href="https://www.linkedin.com/company/bloombiz-techno-hub/" target="_blank" rel="noopener noreferrer" data-underline-link="">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a className="contact__value" href="https://www.behance.net/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
                    Behance
                  </a>
                </li>
                <li>
                  <a className="contact__value" href="https://dribbble.com/bloombiz" target="_blank" rel="noopener noreferrer" data-underline-link="">
                    Dribbble
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
};
