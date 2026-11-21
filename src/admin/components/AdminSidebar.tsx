import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: { newEnquiries?: number; drafts?: number };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, stats }) => {
  const { user, logout } = useAdminAuth();

  const navItems = [
    { num: '01', label: 'Overview', to: '/admin', end: true },
    { num: '02', label: 'Projects', to: '/admin/projects', badge: stats?.drafts ? `${stats.drafts} draft` : undefined },
    { num: '03', label: 'Media Library', to: '/admin/media' },
    { num: '04', label: 'Social Links', to: '/admin/social' },
    { num: '05', label: 'Contact Settings', to: '/admin/contact' },
    { num: '06', label: 'Website Content', to: '/admin/content' },
    { num: '07', label: 'SEO Settings', to: '/admin/seo' },
    { num: '08', label: 'General Settings', to: '/admin/settings' },
    { num: '09', label: 'Enquiries', to: '/admin/enquiries', badge: stats?.newEnquiries ? `${stats.newEnquiries} new` : undefined }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Brand header */}
        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-sidebar__brand" onClick={onClose}>
            <img
              src="/images/logos/bloombiz-logo-dark.png"
              alt="BloomBiz Techno Hub"
              className="admin-sidebar__logo-img"
              width="120"
              height="33"
            />
            <span className="admin-sidebar__badge">CMS</span>
          </Link>

          <button
            type="button"
            className="admin-sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="admin-sidebar__nav" aria-label="Admin Navigation">
          <ul className="admin-sidebar__list">
            {navItems.map((item) => (
              <li key={item.to} className="admin-sidebar__item">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? 'is-active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="admin-sidebar__num" aria-hidden="true">
                    {item.num}
                  </span>
                  <span className="admin-sidebar__label">{item.label}</span>
                  {item.badge && (
                    <span className="admin-sidebar__link-badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer info & Logout */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-sidebar__user-meta">
              <span className="admin-sidebar__user-name">{user?.name || 'Administrator'}</span>
              <span className="admin-sidebar__user-email">{user?.email || 'admin'}</span>
            </div>
          </div>

          <div className="admin-sidebar__footer-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-sidebar__footer-link"
              title="Open public website in new tab"
            >
              Live Site ↗
            </a>
            <button
              type="button"
              className="admin-sidebar__footer-link admin-sidebar__footer-link--logout"
              onClick={() => logout()}
            >
              Logout ↩
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
