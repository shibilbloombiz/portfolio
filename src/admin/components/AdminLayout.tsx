import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { BreadcrumbItem } from './Breadcrumbs';
import { api, SummaryStats } from '../services/api';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const location = useLocation();

  // Fetch summary stats periodically to keep sidebar badges fresh
  useEffect(() => {
    if (isAuthenticated) {
      api.settings.getStats()
        .then(setStats)
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  // Generate dynamic breadcrumbs based on current pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return [{ label: 'Overview' }];
    }
    if (path.startsWith('/admin/projects/new')) {
      return [{ label: 'Projects', href: '/admin/projects' }, { label: 'New Project' }];
    }
    if (path.startsWith('/admin/projects/edit/')) {
      return [{ label: 'Projects', href: '/admin/projects' }, { label: 'Edit Project' }];
    }
    if (path.startsWith('/admin/projects')) {
      return [{ label: 'Projects' }];
    }
    if (path.startsWith('/admin/media')) {
      return [{ label: 'Media Library' }];
    }
    if (path.startsWith('/admin/social')) {
      return [{ label: 'Social Links' }];
    }
    if (path.startsWith('/admin/contact')) {
      return [{ label: 'Contact Settings' }];
    }
    if (path.startsWith('/admin/content')) {
      return [{ label: 'Website Content' }];
    }
    if (path.startsWith('/admin/seo')) {
      return [{ label: 'SEO Settings' }];
    }
    if (path.startsWith('/admin/settings')) {
      return [{ label: 'General Settings' }];
    }
    if (path.startsWith('/admin/enquiries')) {
      return [{ label: 'Enquiries' }];
    }
    return [{ label: 'Dashboard' }];
  };

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-screen__inner">
          <img
            src="/images/logos/bloombiz-logo-dark.png"
            alt="BloomBiz Techno Hub"
            className="admin-loading-screen__logo-img"
            width="150"
            height="41"
          />
          <p className="admin-loading-screen__text">Loading portfolio administration system...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={{
          newEnquiries: stats?.enquiries.new,
          drafts: stats?.projects.drafts
        }}
      />

      <div className="admin-main-wrap">
        <AdminTopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={getBreadcrumbs()}
          stats={{
            newEnquiries: stats?.enquiries.new
          }}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
