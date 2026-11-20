import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ username: username.trim(), password });
      showToast('Welcome to BloomBiz Portfolio CMS', 'success');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card__header">
          <span className="admin-login-card__brand">
            blo<span className="admin-sidebar__logo-accent">∞</span>mbiz
          </span>
          <h1 className="admin-login-card__title">Portfolio CMS</h1>
          <p className="admin-login-card__subtitle">
            Enter authorized administrator credentials to manage portfolio assets and systems.
          </p>
        </div>

        {error && (
          <div className="admin-alert admin-alert--error" role="alert">
            <span className="admin-alert__icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="login-username" className="admin-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="login-password" className="admin-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="admin-input"
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--full"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="admin-login-card__footer">
          <span className="admin-login-hint">Default Access: <code>admin</code> / <code>bloombiz2026</code></span>
          <a href="/" className="admin-login-back-link">
            ← Return to Public Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};
