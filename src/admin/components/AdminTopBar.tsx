import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BreadcrumbItem, Breadcrumbs } from './Breadcrumbs';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminTopBarProps {
  onToggleSidebar: () => void;
  breadcrumbs?: BreadcrumbItem[];
  stats?: { newEnquiries?: number };
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onToggleSidebar,
  breadcrumbs = [],
  stats
}) => {
  const { user, logout } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/projects?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="admin-topbar">
      {/* Mobile toggle & Breadcrumbs */}
      <div className="admin-topbar__left">
        <button
          type="button"
          className="admin-topbar__hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <span className="admin-topbar__hamburger-bar" />
          <span className="admin-topbar__hamburger-bar" />
          <span className="admin-topbar__hamburger-bar" />
        </button>

        <div className="admin-topbar__breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Global Search & Quick Actions */}
      <div className="admin-topbar__right">
        <form className="admin-topbar__search-form" onSubmit={handleGlobalSearch}>
          <input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-topbar__search-input"
            aria-label="Search projects"
          />
        </form>

        <Link
          to="/admin/projects/new"
          className="admin-btn admin-btn--primary admin-topbar__quick-add"
        >
          + New Project
        </Link>

        {/* Enquiries notification icon */}
        <Link
          to="/admin/enquiries"
          className="admin-topbar__icon-btn"
          title={stats?.newEnquiries ? `${stats.newEnquiries} new enquiries` : 'Enquiries'}
          aria-label="View enquiries"
        >
          ✉
          {Boolean(stats?.newEnquiries && stats.newEnquiries > 0) && (
            <span className="admin-topbar__icon-badge">{stats?.newEnquiries}</span>
          )}
        </Link>

        {/* Profile Dropdown */}
        <div className="admin-topbar__profile" ref={profileRef}>
          <button
            type="button"
            className="admin-topbar__profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="admin-topbar__avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="admin-topbar__profile-name">{user?.name || 'Admin'}</span>
            <span className="admin-topbar__profile-arrow">▾</span>
          </button>

          {profileOpen && (
            <div className="admin-topbar__dropdown" role="menu">
              <div className="admin-topbar__dropdown-header">
                <strong>{user?.name}</strong>
                <span className="admin-topbar__dropdown-email">{user?.email}</span>
              </div>
              <div className="admin-topbar__dropdown-divider" />
              <Link
                to="/admin/settings"
                className="admin-topbar__dropdown-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                Settings & Password
              </Link>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-topbar__dropdown-item"
                role="menuitem"
              >
                View Public Site ↗
              </a>
              <div className="admin-topbar__dropdown-divider" />
              <button
                type="button"
                className="admin-topbar__dropdown-item admin-topbar__dropdown-item--logout"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
