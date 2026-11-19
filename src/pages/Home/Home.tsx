import React from 'react';
import { Link } from 'react-router-dom';
import { HeroCurtainCard } from '../../components/HeroCurtainCard/HeroCurtainCard';
import { KerningInteraction } from '../../components/TypographyInteraction/KerningInteraction';
import { LEDTicker } from '../../components/LEDTicker/LEDTicker';
import { Footer } from '../../components/Footer/Footer';

interface HomeProps {
  onToggleSystemView: () => void;
}

export const Home: React.FC<HomeProps> = ({ onToggleSystemView }) => {
  const printProjects = [
    { href: '/work/novara/', img: '/images/work/projects/novara-1.png', tone: '#1a1a1c', label: 'Novara' },
    { href: '/work/mocs/', img: '/images/work/projects/mocs-1.png', tone: '#361b14', label: 'MOCS' },
    { href: '/work/nazzi/', img: '/images/work/projects/nazzi-1.png', tone: '#201912', label: 'Nazzi Foods' }
  ];

  const screenProjects = [
    { href: '/work/educarrt/', img: '/images/work/projects/educarrt-1.png', tone: '#10223d', label: 'EduCarrt' },
    { href: '/work/ftx/', img: '/images/work/projects/ftx-1.png', tone: '#141f17', label: 'FTX Detailing' },
    { href: '/work/gadco/', img: '/images/work/projects/gadco-1.png', tone: '#18181a', label: 'Gadco' },
    { href: '/work/jakkur/', img: '/images/work/projects/jakkur-1.png', tone: '#14243b', label: 'Jakkur' }
  ];

  const spaceProjects = [
    { href: '/work/future-safety/', img: '/images/work/projects/future-1.png', tone: '#241c14', label: 'Future Safety' },
    { href: '/work/sabka/', img: '/images/work/projects/sabka-1.png', tone: '#241538', label: 'Sabka Skill' },
    { href: '/work/ftx/', img: '/images/work/projects/ftx-1.png', tone: '#141f17', label: 'FTX Detailing' }
  ];

  const featuredProjects = [
    {
      slug: 'educarrt',
      title: 'EduCarrt',
      line: 'Study Abroad Consultant for a Brighter Future.',
      tone: '#10223d',
      img: '/images/work/projects/educarrt-1.png',
      frame: 'Web / 1440 / 12 cols',
      externalUrl: 'https://educarrt.com/'
    },
    {
      slug: 'ftx',
      title: 'FTX Detailing',
      line: 'Precision, protection, perfection.',
      tone: '#141f17',
      img: '/images/work/projects/ftx-1.png',
      frame: 'Web / 1440 / 12 cols',
      externalUrl: 'https://ftxdetailing.com/'
    },
    {
      slug: 'novara',
      title: 'Novara',
      line: 'Model Novara — minimalism engineered for acoustic purity.',
      tone: '#1a1a1c',
      img: '/images/work/projects/novara-1.png',
      frame: 'Device / Studio 16:9',
      externalUrl: 'https://novaraaudio.com/'
    },
    {
      slug: 'mocs',
      title: 'MOCS',
      line: 'Artisanal charm crafted for timeless ease and natural comfort.',
      tone: '#361b14',
      img: '/images/work/projects/mocs-1.png',
      frame: 'Tablet / 1024 / 12 cols',
      externalUrl: 'https://mocsartisan.com/'
    },
    {
      slug: 'gadco',
      title: 'Gadco',
      line: 'Redefine your lifestyle with timeless modern essentials.',
      tone: '#18181a',
      img: '/images/work/projects/gadco-1.png',
      frame: 'Web / 1440 / 12 cols',
      externalUrl: 'https://gadco.com/'
    }
  ];

  return (
    <div className="home">
      {/* SECTION 01: HERO */}
      <section className="home-section home-hero" id="hero" data-home-hero="" aria-label="Introduction">
        <div className="home-grid">
          <h1 className="home-hero__title" aria-label="DESIGN. ENGINEER. EVOLVE." data-motion="hero">
            <span className="home-hero__line" data-line="" data-spec="">
              <span className="home-word"><span>DESIGN.</span></span>{' '}
              <HeroCurtainCard
                slot="print"
                surface="print"
                projects={printProjects}
                ariaLabel="Open a print project"
                autoPlayInterval={4200}
              />
            </span>

            <span className="home-hero__line home-hero__line--indent" data-line="">
              <HeroCurtainCard
                slot="screen"
                surface="screen"
                projects={screenProjects}
                ariaLabel="Open a screen project"
                autoPlayInterval={4600}
              />{' '}
              <span className="home-word"><span>ENGINEER.</span></span>
            </span>

            <span className="home-hero__line" data-line="">
              <span className="home-mark">
                <span className="home-word"><span>EVOLVE.</span></span>
                <svg
                  className="mz-underline"
                  data-underline="03"
                  viewBox="-2 -2 669.04 44.75"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M220.475 3.59932C147.138 2.75499 73.5014 5.84061 2.51671 18.7972C1.25022 19.0274 0.724462 19.4803 0.62084 19.5839C0.0144608 20.198 -0.0508949 20.8504 0.0258619 21.3877C0.071916 21.7139 0.382916 23.0917 2.08308 23.2337C3.25746 23.3296 11.5931 22.658 14.8092 22.4853C29.9495 21.6755 45.0593 20.5204 60.1612 19.1848C94.4024 16.1682 128.597 13.5585 162.892 11.1829C182.147 9.84733 201.409 8.74199 220.66 7.83626C266.971 8.3774 313.167 10.4882 358.5 12.6681C340.481 13.7773 323.925 14.9018 310.197 15.6309C287.047 16.8591 263.939 18.3097 240.835 20.221C228.965 21.1996 217.11 22.2628 205.262 23.5177C203.95 23.6597 200.96 23.8055 199.513 23.9782C198.899 24.0473 198.454 24.1586 198.254 24.2354C197.003 24.719 196.846 25.7091 196.831 26.208C196.823 26.5112 196.926 28.1653 199.037 28.4877C297.182 43.6165 399.576 26.0161 498.074 40.7228C499.229 40.8955 500.312 40.0972 500.484 38.9381C500.657 37.783 499.859 36.7007 498.7 36.528C405.932 22.6772 309.705 37.4874 216.818 26.6148C224.935 25.8281 233.056 25.1181 241.184 24.4465C264.246 22.539 287.311 21.0922 310.423 19.8641C333.68 18.6321 365.12 16.2258 398.029 14.7099C426.272 16.2834 454.499 18.0488 482.746 19.5455C494.662 20.1749 506.583 20.6969 518.495 21.3378C523.393 21.5988 535.992 22.6926 537.819 22.2857C539.239 21.9672 539.58 20.9502 539.665 20.4398C539.753 19.8871 539.699 19.2001 539.055 18.5439C538.855 18.3366 538.257 17.9068 537.028 17.5537C503.812 8.03969 449.422 8.18936 398.482 10.4882C387.525 9.87417 376.568 9.29082 365.607 8.76504C340.516 7.55612 315.147 6.34334 289.633 5.38772C361.535 3.6108 433.472 4.12125 505.427 5.40693C535.639 5.94806 617.074 9.21024 649.147 12.0925C648.756 12.4954 648.525 13.0558 648.552 13.666C648.606 14.8327 649.6 15.7384 650.77 15.6847C657.387 15.3777 661.213 14.9862 662.729 14.5832C663.673 14.3338 664.188 13.9346 664.425 13.6737C665.009 13.0442 665.116 12.3688 665.001 11.7278C664.928 11.3287 664.748 10.8912 664.333 10.4882C664.057 10.2119 663.382 9.78976 662.23 9.50192C649.623 6.3664 541.476 1.81085 505.504 1.16609C410.445 -0.530234 315.424 -0.875606 220.475 3.59932ZM511.315 16.717C492.74 14.1956 470.964 13.309 448.248 13.3666C459.819 14.0382 471.394 14.6945 482.972 15.3086C492.417 15.8113 501.866 16.2411 511.315 16.717ZM132.865 9.07593C108.495 10.872 84.1514 12.814 59.7888 14.9632C56.9757 15.2088 54.1664 15.4506 51.3532 15.6885C78.2949 12.388 105.517 10.2887 132.865 9.07593Z" />
                </svg>
              </span>{' '}
              <HeroCurtainCard
                slot="space"
                surface="space"
                projects={spaceProjects}
                ariaLabel="Open a space project"
                autoPlayInterval={4400}
              />
            </span>
          </h1>
        </div>

        <div className="home-grid home-hero__sub">
          <p className="home-label home-hero__cue" data-hero-cue="">
            <i aria-hidden="true"></i>Scroll.
          </p>
          <p className="home-body-l home-hero__lead" data-spec="" data-hero-lead="" data-lcp="">
            We engineer high-performance websites, custom web systems, and intelligent AI automation that scale businesses. Every detail built to perform.
          </p>
        </div>
      </section>

      {/* LED Dot-Matrix Ticker Strip */}
      <LEDTicker />

      {/* SECTION 02: 01 HELLO */}
      <section className="home-section home-hello" id="hello" aria-label="Hello">
        <div className="home-grid home-hello__top">
          <p className="home-label home-hello__label">
            <span className="home-label__num" aria-hidden="true">01</span>Hello
          </p>
          <p className="home-statement home-hello__lead" data-reveal="" data-spec="">
            Every solution we build starts with architectural precision and delivers scalable, intelligent systems.
          </p>
        </div>

        <div className="home-hello__stage" data-hello-line="" data-frame="Drawing / one line / 12 cols" aria-hidden="true">
          <svg className="home-hello__svg" focusable="false" viewBox="0 0 1200 120">
            <defs>
              <linearGradient id="hello-line-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
                <stop className="home-hello__ink home-hello__ink--graphite" offset="0" stopColor="#3a3532" />
                <stop className="home-hello__ink home-hello__ink--mid" offset="0.55" stopColor="#23201e" />
                <stop className="home-hello__ink home-hello__ink--ink" offset="1" stopColor="#1c1917" />
              </linearGradient>
            </defs>
            <path
              className="home-hello__path"
              d="M 50 60 Q 250 15, 450 60 T 850 60 T 1150 60"
              stroke="url(#hello-line-ink)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="1200"
              strokeDashoffset="0"
            />
            <circle className="home-hello__tip" cx="1150" cy="60" r="3.5" fill="#1c1917" />
          </svg>
          <span className="home-label home-hello__tag" style={{ left: '15%' }}>A sign over a door</span>
          <span className="home-label home-hello__tag" style={{ left: '50%' }}>A label on a can</span>
          <span className="home-label home-hello__tag" style={{ left: '80%' }}>A screen in someone's hand</span>
        </div>

        <div className="home-grid home-hello__bottom">
          <p className="home-hello__text" data-reveal="" data-spec="">
            We are BloomBiz Techno Hub. We build every type of modern website, scalable enterprise system, and bespoke AI automation: production-ready, cloud-ready, future-proof.
          </p>
          <p className="home-hello__text home-hello__text--muted" data-reveal="">
            From high-conversion web experiences to complex automated workflows, delivering engineering excellence is what we do best.
          </p>
        </div>
      </section>

      {/* SECTION 03: 02 SELECTED WORK & SYSTEMS */}
      <section className="home-section home-work" id="work" data-header-offset="" aria-label="Work">
        <div className="home-grid home-work__head">
          <p className="home-label home-work__label">
            <span className="home-label__num" aria-hidden="true">02</span>Selected work &amp; systems
          </p>
        </div>

        <div className="home-stack" data-work-stack="">
          {featuredProjects.map((proj, idx) => (
            <Link
              key={proj.slug}
              className="home-card"
              to={`/work/${proj.slug}/`}
              data-tone={proj.tone}
              data-work-card={proj.slug}
              data-hover-case=""
              data-motion="hero"
              style={{ zIndex: idx + 1 }}
            >
              <div className="home-card__band">
                <h2 className="home-statement home-card__name" id={`card-${proj.slug}-name`}>
                  <span>{proj.title}</span>
                </h2>
                <p className="home-card__line" id={`card-${proj.slug}-line`}>
                  <span>{proj.line}</span>
                </p>
              </div>
              <p className="home-card__line home-card__line--below">
                {proj.line}
              </p>
              <div className="home-card__image" data-frame={proj.frame}>
                <img
                  src={proj.img}
                  sizes="calc(100vw - 4em)"
                  width="2752"
                  height="1536"
                  alt={`${proj.title}: ${proj.line}`}
                  loading="lazy"
                  decoding="async"
                />
                <div className="home-card__overlay">
                  <a
                    href={proj.externalUrl || `/work/${proj.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-card__center-btn"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open live website for ${proj.title}`}
                  >
                    Live View ↗
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="home-grid home-work__end">
          <Link className="home-all" to="/work/">
            <span>Explore all projects &amp; systems</span>
            <span className="home-all__arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* SECTION 04: 03 THE BORING PART */}
      <KerningInteraction onToggleSystemView={onToggleSystemView} />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
