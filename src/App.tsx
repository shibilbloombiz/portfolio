import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation/Navigation';
import { Intro } from './components/Intro/Intro';
import { PageTransition } from './components/PageTransition/PageTransition';
import { BottomBlur } from './components/BottomBlur/BottomBlur';
import { CustomCursor } from './components/CustomCursor/CustomCursor';
import { useScrollReveals } from './hooks/useScrollReveals';

import { Home } from './pages/Home/Home';
import { Work } from './pages/Work/Work';
import { About } from './pages/About/About';
import { Contact } from './pages/Contact/Contact';
import { CaseStudy } from './pages/CaseStudies/CaseStudy';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppContent: React.FC = () => {
  // Activate authentic scroll reveal animations system
  useScrollReveals();

  return (
    <>
      <ScrollToTop />
      <Intro />
      <Navigation />

      {/* Signature 14-column curtain wipe page transition */}
      <PageTransition />

      {/* Reference custom cursor & [ Open the case ] spring tag */}
      <CustomCursor />

      {/* Film grain effect */}
      <div data-grain-animate="true" className="grain"></div>

      {/* Main content mount */}
      <main id="main" tabIndex={-1} data-main="" className="main">
        <Routes>
          <Route path="/" element={<Home onToggleSystemView={() => {}} />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact/" element={<Contact />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/work/:slug/" element={<CaseStudy />} />
          <Route path="*" element={<Home onToggleSystemView={() => {}} />} />
        </Routes>
      </main>

      {/* Progressive glass blur sticky effect & precision scroll meter */}
      <BottomBlur />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};
