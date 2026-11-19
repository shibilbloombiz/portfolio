import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/projects';
import { Footer } from '../../components/Footer/Footer';

export const Work: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="work-page">
      <section className="home work-hero" aria-label="Work">
        <div className="home-grid">
          <h1 className="work-hero__title" data-reveal-lines="" data-spec="">
            Websites, Systems &amp; AI Automations.
          </h1>
          <p className="home-body-l work-hero__lead" data-reveal="">
            High-performance websites, enterprise web systems, and intelligent AI automation. Engineered to power modern businesses and built to scale.
          </p>
        </div>
      </section>

      <section className="home work-grid-section" aria-label="Projects">
        <div className="home-grid">
          <div className="work-view-controls">
            <span className="home-label work-count">{projects.length} Selected Projects</span>
            <div className="work-view-toggles" role="tablist" aria-label="Project view mode">
              <button
                type="button"
                className={`work-view-toggle ${viewMode === 'grid' ? 'is-active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view (3 in a row)"
                title="3 in a row Grid"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" />
                  <rect x="6.25" y="1" width="3.5" height="3.5" rx="0.5" />
                  <rect x="11.5" y="1" width="3.5" height="3.5" rx="0.5" />
                  <rect x="1" y="6.25" width="3.5" height="3.5" rx="0.5" />
                  <rect x="6.25" y="6.25" width="3.5" height="3.5" rx="0.5" />
                  <rect x="11.5" y="6.25" width="3.5" height="3.5" rx="0.5" />
                  <rect x="1" y="11.5" width="3.5" height="3.5" rx="0.5" />
                  <rect x="6.25" y="11.5" width="3.5" height="3.5" rx="0.5" />
                  <rect x="11.5" y="11.5" width="3.5" height="3.5" rx="0.5" />
                </svg>
                <span>Grid (3)</span>
              </button>
              <button
                type="button"
                className={`work-view-toggle ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
                title="List view"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="2" y1="3.5" x2="14" y2="3.5" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12.5" x2="14" y2="12.5" />
                </svg>
                <span>List</span>
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="work-grid" data-work-grid="">
              {projects.map((proj) => (
                <div
                  key={proj.slug}
                  className="work-grid-card"
                  data-tone={proj.tone}
                  style={{ '--card-tone': proj.tone } as React.CSSProperties}
                  data-hover-case=""
                  data-tag-label="[ Live View ]"
                >
                  <div className="work-grid-card__media">
                    <Link
                      to={`/work/${proj.slug}/`}
                      className="work-grid-card__media-link"
                      aria-label={`View ${proj.title} case study`}
                    >
                      <img
                        src={proj.media[0]?.src}
                        alt={proj.media[0]?.alt || proj.title}
                        className="work-grid-card__img"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                    <div className="work-grid-card__overlay">
                      <a
                        href={proj.externalUrl || `/work/${proj.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="work-grid-card__tag"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open live website for ${proj.title}`}
                      >
                        Live View ↗
                      </a>
                    </div>
                  </div>
                  <Link
                    to={`/work/${proj.slug}/`}
                    className="work-grid-card__info"
                    aria-label={`View ${proj.title} case study`}
                  >
                    <div className="work-grid-card__head">
                      <h2 className="work-grid-card__title">{proj.title}</h2>
                      <span className="work-grid-card__year home-label">{proj.year}</span>
                    </div>
                    <div className="work-grid-card__foot">
                      <p className="work-grid-card__sector">{proj.sector}</p>
                      <span className="work-grid-card__arrow" aria-hidden="true">→</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="work-list-wrapper" style={{ gridColumn: '1 / -1', width: '100%' }}>
              <ul className="work-index__list" data-reveal-rule="0.07">
                {projects.map((proj) => (
                  <li key={proj.slug} className="work-index__item">
                    <Link
                      className="work-row"
                      to={`/work/${proj.slug}/`}
                      data-case-link=""
                      data-work-row={proj.slug}
                      data-tone={proj.tone}
                      style={{ '--row-tone': proj.tone } as React.CSSProperties}
                      data-work-line={proj.description}
                      data-work-year={proj.year}
                      data-hover-case=""
                    >
                      <h2 className="work-row__name">{proj.title}</h2>
                      <p className="work-row__sector">{proj.sector}</p>
                      <p className="home-label work-row__year">{proj.year}</p>
                      <span className="work-row__pieces" data-work-pieces="" aria-hidden="true">
                        {proj.media.map((m, i) => (
                          <img
                            key={i}
                            className="work-piece"
                            src={m.type === 'video' ? (m.poster || m.src) : m.src}
                            alt={m.alt}
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
