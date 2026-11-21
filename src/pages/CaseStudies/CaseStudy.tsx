import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { projects } from '../../data/projects';
import { Footer } from '../../components/Footer/Footer';

export const CaseStudy: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return <Navigate to="/work/" replace />;
  }

  const nextProject = projects.find((p) => p.slug === project.nextSlug) || projects[0];

  useEffect(() => {
    document.body.setAttribute('data-page-tone', 'dark');
    document.body.style.setProperty('--page-tone-bg', project.tone);
    return () => {
      document.body.removeAttribute('data-page-tone');
      document.body.style.removeProperty('--page-tone-bg');
    };
  }, [project.tone]);

  const leadMedia = project.media[0];
  const pair1_1 = project.media[1];
  const pair1_2 = project.media[2];
  const wideMedia = project.media[3];
  const restMedia = project.media.slice(4);

  return (
    <div
      className="main case-page"
      data-page-tone="dark"
      style={{ '--case-tone': project.tone } as React.CSSProperties}
    >
      {/* CASE HERO */}
      <section className="home case-hero" data-case-hero="" aria-label="Case study">
        <div className="home-grid case-hero__grid">
          <Link className="home-label line-btn case-hero__back" to="/work/" data-case-rise="">
            <span className="line-btn__arrow" aria-hidden="true">←</span>
            Back to work
          </Link>
          <p className="home-label case-hero__label" data-case-rise="">
            Case study
          </p>
          <h1 className="case-hero__name" data-reveal-lines="" data-spec="">
            {project.title}
          </h1>
          <p className="home-body-l case-hero__line" data-case-rise="">
            {project.description}
          </p>
        </div>

        <dl className="home-grid home-label case-hero__meta" data-reveal-rule="0.06" data-case-rise="">
          <div className="case-hero__fact">
            <dt>Sector</dt>
            <dd>{project.sector}</dd>
          </div>
          <div className="case-hero__fact">
            <dt>Scope</dt>
            <dd>{project.scope}</dd>
          </div>
          <div className="case-hero__fact">
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>
      </section>

      {/* LEAD MEDIA */}
      {leadMedia && (
        <div className="home home-grid case-imgs case-imgs--lead">
          {leadMedia.type === 'video' ? (
            <div
              className="case-fig case-fig--wide case-fig--film"
              data-case-fig=""
              data-frame={leadMedia.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                <video
                  className="case-fig__art"
                  poster={leadMedia.poster}
                  src={leadMedia.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={leadMedia.alt}
                ></video>
              </div>
            </div>
          ) : (
            <div
              className="case-fig case-fig--wide"
              data-case-fig=""
              data-motion="hero"
              data-case-lead=""
              data-frame={leadMedia.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                <img
                  className="work-piece case-fig__art"
                  src={leadMedia.src}
                  alt={leadMedia.alt}
                  loading="eager"
                  decoding="async"
                />
              </div>
              <span className="case-fig__cover" data-case-cover="" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i}></i>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STEP 01: PROBLEM */}
      <section className="home case-step" aria-labelledby="case-step-1">
        <div className="home-grid">
          <h2 className="home-label case-step__label" id="case-step-1">
            <span className="home-label__num" aria-hidden="true">01</span>Problem
          </h2>
          <div className="case-step__body">
            <p className="home-statement case-step__text" data-reveal="" data-spec="">
              {project.problem}
            </p>
          </div>
        </div>
      </section>

      {/* PAIR OR SECONDARY MEDIA */}
      {pair1_1 && (
        <div className="home home-grid case-imgs case-imgs--pair">
          <div
            className={`case-fig ${pair1_2 ? 'case-fig--pair' : 'case-fig--wide'}`}
            data-case-fig=""
            data-motion="hero"
            data-frame={pair1_1.frame}
            data-frame-span=""
          >
            <div className="case-fig__img">
              {pair1_1.type === 'video' ? (
                <video
                  className="case-fig__art"
                  poster={pair1_1.poster}
                  src={pair1_1.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={pair1_1.alt}
                />
              ) : (
                <img
                  className="work-piece case-fig__art"
                  src={pair1_1.src}
                  alt={pair1_1.alt}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          </div>
          {pair1_2 && (
            <div
              className="case-fig case-fig--pair"
              data-case-fig=""
              data-motion="hero"
              data-frame={pair1_2.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                {pair1_2.type === 'video' ? (
                  <video
                    className="case-fig__art"
                    poster={pair1_2.poster}
                    src={pair1_2.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={pair1_2.alt}
                  />
                ) : (
                  <img
                    className="work-piece case-fig__art"
                    src={pair1_2.src}
                    alt={pair1_2.alt}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 02: DECISION */}
      <section className="home case-step" aria-labelledby="case-step-2">
        <div className="home-grid">
          <h2 className="home-label case-step__label" id="case-step-2">
            <span className="home-label__num" aria-hidden="true">02</span>Decision
          </h2>
          <div className="case-step__body">
            <p className="home-statement case-step__text" data-reveal="">
              {project.decision}
            </p>
            <ol className="case-points" data-reveal-rule="0.06">
              {project.principles.map((p, idx) => (
                <li key={idx} className="case-points__item">
                  <span className="home-label case-points__num">0{idx + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* WIDE MEDIA (VIDEO OR MOCKUP) */}
      {wideMedia && (
        <div className="home home-grid case-imgs case-imgs--wide">
          {wideMedia.type === 'video' ? (
            <div
              className="case-fig case-fig--wide case-fig--film"
              data-case-fig=""
              data-frame={wideMedia.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                <video
                  className="case-fig__art"
                  poster={wideMedia.poster}
                  src={wideMedia.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={wideMedia.alt}
                ></video>
              </div>
            </div>
          ) : (
            <div
              className="case-fig case-fig--wide"
              data-case-fig=""
              data-motion="hero"
              data-frame={wideMedia.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                <img
                  className="work-piece case-fig__art"
                  src={wideMedia.src}
                  alt={wideMedia.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 03: RESULT */}
      <section className="home case-step" aria-labelledby="case-step-3">
        <div className="home-grid">
          <h2 className="home-label case-step__label" id="case-step-3">
            <span className="home-label__num" aria-hidden="true">03</span>Result
          </h2>
          <div className="case-step__body">
            <p className="home-statement case-step__text" data-reveal="">
              {project.result}
            </p>
            {project.externalUrl && (
              <p className="case-step__link">
                <a
                  className="home-label line-btn"
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit {project.externalUrl.replace('https://', '').replace('/', '')}
                  <span className="line-btn__arrow line-btn__arrow--end" aria-hidden="true">↗</span>
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* REST MEDIA SHOWCASE */}
      {restMedia.length > 0 && (
        <div className="home home-grid case-imgs case-imgs--pair">
          {restMedia.map((m, idx) => (
            <div
              key={idx}
              className={`case-fig ${m.layout === 'wide' ? 'case-fig--wide' : 'case-fig--pair'}`}
              data-case-fig=""
              data-motion="hero"
              data-frame={m.frame}
              data-frame-span=""
            >
              <div className="case-fig__img">
                {m.type === 'video' ? (
                  <video
                    className="case-fig__art"
                    poster={m.poster}
                    src={m.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={m.alt}
                  />
                ) : (
                  <img
                    className="work-piece case-fig__art"
                    src={m.src}
                    alt={m.alt}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEXT CASE BANNER */}
      <Link
        className="home case-next"
        to={`/work/${nextProject.slug}/`}
        data-case-link=""
        data-tone={nextProject.tone}
        data-hover-case=""
        style={{ '--next-tone': nextProject.tone } as React.CSSProperties}
      >
        <span className="home-grid case-next__grid">
          <span className="home-label case-next__label">Next case</span>
          <span className="case-next__name">{nextProject.title}</span>
          <span className="case-next__arrow" aria-hidden="true">→</span>
        </span>
      </Link>

      {/* Floating Bottom-Right Live View Badge (matches cursor button model design) */}
      {project.externalUrl && (
        <a
          href={project.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="case-floating-live"
          aria-label={`Open live website for ${project.title}`}
        >
          <span className="case-floating-live__dot" aria-hidden="true" />
          <span className="case-floating-live__text">[ LIVE VIEW ↗ ]</span>
        </a>
      )}

      <Footer />
    </div>
  );
};
