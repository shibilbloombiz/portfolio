import React, { useState, useEffect } from 'react';
import { api, GeneralSettingsData } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const [generalData, setGeneralData] = useState<GeneralSettingsData>({
    site_title: '',
    company_name: '',
    tagline: '',
    contact_email: '',
    timezone: '',
    maintenance_mode: false
  });

  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    api.settings.get()
      .then((data) => {
        setGeneralData({
          site_title: data.site_title || '',
          company_name: data.company_name || '',
          tagline: data.tagline || '',
          contact_email: data.contact_email || '',
          timezone: data.timezone || '',
          maintenance_mode: Boolean(data.maintenance_mode)
        });
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load general settings', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      await api.settings.update(generalData);
      showToast('General settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save general settings', 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      showToast('Admin password changed successfully! Please remember your new password.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-state">Loading system settings...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">SYSTEM PREFERENCES / 08</span>
          <h1 className="admin-page-title">General Settings</h1>
          <p className="admin-page-desc">
            Manage agency branding parameters, administrator credentials, and underlying platform infrastructure.
          </p>
        </div>
      </div>

      <div className="admin-settings-sections">
        {/* General Agency Info */}
        <form onSubmit={handleSaveGeneral} className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Studio & System Identity</h2>
            <p className="admin-form-section__desc">Core agency name and administrative contact credentials.</p>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-site-title">
                Website Brand Title
              </label>
              <input
                id="sett-site-title"
                type="text"
                className="admin-input"
                value={generalData.site_title}
                onChange={(e) => setGeneralData({ ...generalData, site_title: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-comp-name">
                Company Legal Name
              </label>
              <input
                id="sett-comp-name"
                type="text"
                className="admin-input"
                value={generalData.company_name}
                onChange={(e) => setGeneralData({ ...generalData, company_name: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-tagline">
                Official Tagline
              </label>
              <input
                id="sett-tagline"
                type="text"
                className="admin-input"
                value={generalData.tagline}
                onChange={(e) => setGeneralData({ ...generalData, tagline: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-admin-email">
                Administrative Notifications Email
              </label>
              <input
                id="sett-admin-email"
                type="email"
                className="admin-input"
                value={generalData.contact_email}
                onChange={(e) => setGeneralData({ ...generalData, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={savingGeneral}>
              {savingGeneral ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </form>

        {/* Change Admin Password */}
        <form onSubmit={handleChangePassword} className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Security & Password</h2>
            <p className="admin-form-section__desc">Update your authorized administrator authentication password.</p>
          </div>

          <div className="admin-form-grid-3">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-curr-pass">
                Current Password
              </label>
              <input
                id="sett-curr-pass"
                type="password"
                required
                className="admin-input"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-new-pass">
                New Password
              </label>
              <input
                id="sett-new-pass"
                type="password"
                required
                className="admin-input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="sett-conf-pass">
                Confirm New Password
              </label>
              <input
                id="sett-conf-pass"
                type="password"
                required
                className="admin-input"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* Infrastructure Information */}
        <div className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Database & Infrastructure</h2>
            <p className="admin-form-section__desc">Active database engine and runtime environment statistics.</p>
          </div>

          <div className="admin-info-grid">
            <div className="admin-info-item">
              <span className="admin-info-item__label">DATABASE ENGINE</span>
              <span className="admin-info-item__value">SQLite 3 (WAL Mode, better-sqlite3)</span>
            </div>
            <div className="admin-info-item">
              <span className="admin-info-item__label">DATABASE FILE</span>
              <span className="admin-info-item__value">server/data/portfolio.db</span>
            </div>
            <div className="admin-info-item">
              <span className="admin-info-item__label">MEDIA STORAGE</span>
              <span className="admin-info-item__value">public/uploads/ (Local Persistent Disk)</span>
            </div>
            <div className="admin-info-item">
              <span className="admin-info-item__label">CMS VERSION</span>
              <span className="admin-info-item__value">v1.2.0 Production-Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
