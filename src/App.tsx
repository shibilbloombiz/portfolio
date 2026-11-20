import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation/Navigation';
import { Intro } from './components/Intro/Intro';
import { PageTransition } from './components/PageTransition/PageTransition';
import { BottomBlur } from './components/BottomBlur/BottomBlur';
import { CustomCursor } from './components/CustomCursor/CustomCursor';
import { useScrollReveals } from './hooks/useScrollReveals';

// Public Pages
import { Home } from './pages/Home/Home';
import { Work } from './pages/Work/Work';
import { About } from './pages/About/About';
import { Contact } from './pages/Contact/Contact';
import { CaseStudy } from './pages/CaseStudies/CaseStudy';

// Admin CMS Components & Pages
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { ToastProvider } from './admin/context/ToastContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminOverview } from './admin/pages/AdminOverview';
import { AdminProjects } from './admin/pages/AdminProjects';
import { AdminProjectForm } from './admin/pages/AdminProjectForm';
import { AdminMedia } from './admin/pages/AdminMedia';
import { AdminSocial } from './admin/pages/AdminSocial';
import { AdminContact } from './admin/pages/AdminContact';
import { AdminContent } from './admin/pages/AdminContent';
import { AdminSEO } from './admin/pages/AdminSEO';
import { AdminSettings } from './admin/pages/AdminSettings';
import { AdminEnquiries } from './admin/pages/AdminEnquiries';
import './admin/styles/admin.css';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Activate authentic scroll reveal animations system on public routes
  useScrollReveals();

  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectForm />} />
              <Route path="projects/edit/:id" element={<AdminProjectForm />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="social" element={<AdminSocial />} />
              <Route path="contact" element={<AdminContact />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
            </Route>
            <Route path="/admin/*" element={<AdminOverview />} />
          </Routes>
        </ToastProvider>
      </AdminAuthProvider>
    );
  }

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
