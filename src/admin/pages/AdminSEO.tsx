import React, { useState, useEffect } from 'react';
import { api, SEOSettingsData } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminSEO: React.FC = () => {
  const [formData, setFormData] = useState<SEOSettingsData>({
    meta_title: '',
    meta_description: '',
    keywords: '',
    og_image: '',
    canonical_url: '',
    twitter_card: 'summary_large_image'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.seo.get()
      .then((data) => {
        setFormData({
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          keywords: data.keywords || '',
          og_image: data.og_image || '',
          canonical_url: data.canonical_url || '',
          twitter_card: data.twitter_card || 'summary_large_image'
        });
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load SEO configuration', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.seo.update(formData);
      showToast('Search optimization settings saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save SEO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-state">Loading SEO configuration...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">SEARCH OPTIMIZATION / 07</span>
          <h1 className="admin-page-title">SEO & Social Metadata</h1>
          <p className="admin-page-desc">
            Manage global search engine ranking titles, meta descriptions, and Open Graph previews for social networks.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save SEO Configuration'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-seo-form">
        {/* Search Engine Snippet Preview */}
        <div className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Google SERP Search Preview</h2>
            <p className="admin-form-section__desc">Live simulated representation of your website on Google Search results.</p>
          </div>

          <div className="admin-serp-preview">
            <div className="admin-serp-preview__url">
              {formData.canonical_url || 'https://bloombiz.com/'}
            </div>
            <h3 className="admin-serp-preview__title">
              {formData.meta_title || 'BloomBiz Techno Hub — Design. Engineer. Evolve.'}
            </h3>
            <p className="admin-serp-preview__snippet">
              {formData.meta_description || 'We engineer high-performance websites, custom web systems, and intelligent AI automation that scale businesses.'}
            </p>
          </div>
        </div>

        {/* Global Metadata Inputs */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Global Meta Tags</h2>
            <p className="admin-form-section__desc">Base indexing metadata across all portfolio entry points.</p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="seo-title">
              Default Meta Title ({formData.meta_title.length} characters)
            </label>
            <input
              id="seo-title"
              type="text"
              className="admin-input"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="e.g. BloomBiz Techno Hub — Design. Engineer. Evolve."
            />
            <span className="admin-hint-text">Recommended length: 50–60 characters.</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="seo-desc">
              Default Meta Description ({formData.meta_description.length} characters)
            </label>
            <textarea
              id="seo-desc"
              rows={3}
              className="admin-textarea"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Provide a compelling 150-160 character summary of your studio capabilities."
            />
            <span className="admin-hint-text">Recommended length: 140–160 characters.</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="seo-keywords">
              Meta Keywords (comma-separated)
            </label>
            <input
              id="seo-keywords"
              type="text"
              className="admin-input"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="web engineering, AI automation, enterprise systems, BloomBiz"
            />
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="seo-og">
                Open Graph Image URL
              </label>
              <input
                id="seo-og"
                type="text"
                className="admin-input"
                value={formData.og_image}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                placeholder="/images/bloombiz-logo.png"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="seo-canonical">
                Canonical Base URL
              </label>
              <input
                id="seo-canonical"
                type="url"
                className="admin-input"
                value={formData.canonical_url}
                onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                placeholder="https://bloombiz.com/"
              />
            </div>
          </div>
        </section>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save SEO Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
