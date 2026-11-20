import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'hello' | 'services' | 'about' | 'footer'>('hero');
  const [contentMap, setContentMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.content.getAll()
      .then((data) => {
        setContentMap(data);
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load website content', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleUpdateSection = async (key: string, payload: any) => {
    setSaving(true);
    try {
      await api.content.updateSection(key, payload);
      showToast(`Section "${key}" saved successfully`, 'success');
      setContentMap((prev) => ({ ...prev, [key]: payload }));
    } catch (err: any) {
      showToast(err.message || 'Failed to update section content', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-state">Loading website copy & sections...</div>;
  }

  const hero = contentMap.hero || {
    headlineWord1: 'DESIGN.',
    headlineWord2: 'ENGINEER.',
    headlineWord3: 'EVOLVE.',
    subLead: 'We engineer high-performance websites, custom web systems, and intelligent AI automation that scale businesses. Every detail built to perform.',
    ctaText: 'Explore Selected Work',
    ctaUrl: '/work/'
  };

  const hello = contentMap.hello || {
    sectionNum: '01',
    sectionLabel: 'Hello',
    statement: 'Every solution we build starts with architectural precision and delivers scalable, intelligent systems.'
  };

  const services = contentMap.services || {
    sectionNum: '02',
    sectionTitle: 'Our Services',
    lead: 'We build high-performance web applications, intelligent AI automation pipelines, and custom enterprise digital systems that drive measurable business outcomes.',
    items: [
      { title: 'Full-Stack Web Engineering', description: 'Ultra-fast Next.js, React, and Node.js web applications engineered for scalability and sub-second latency.' },
      { title: 'Intelligent AI & Automation', description: 'Automate business operations, workflows, customer support, and document processing with LLM agents.' },
      { title: 'Custom Enterprise Systems', description: 'High-availability internal tools, CMS architectures, portals, and cloud infrastructure.' }
    ]
  };

  const about = contentMap.about || {
    companyName: 'BloomBiz Techno Hub',
    headline: 'Engineering scalable web systems with precision & purpose.',
    bio: 'BloomBiz Techno Hub is an engineering-first digital studio. We bridge high-craft aesthetic minimalism with rigorous full-stack software architecture, delivering enterprise web systems and intelligent AI solutions for forward-thinking brands.'
  };

  const footer = contentMap.footer || {
    copyrightText: '© 2026 BloomBiz Techno Hub. All rights reserved.',
    statusText: 'All systems operational. Accepting select enterprise commissions for Q1 2026.'
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">EDITORIAL ARCHITECTURE / 06</span>
          <h1 className="admin-page-title">Website Copy & Content</h1>
          <p className="admin-page-desc">
            Edit supported copy, taglines, statements and service narratives across the public website.
          </p>
        </div>

        <div className="admin-page-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline">
            View Live Site ↗
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'hero' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'hello' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('hello')}
        >
          01 / Hello Statement
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'services' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          02 / Services
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'about' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Page Copy
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'footer' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          Footer Notice
        </button>
      </div>

      <div className="admin-tab-content">
        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSection('hero', hero);
            }}
            className="admin-form-section"
          >
            <div className="admin-form-section__header">
              <h2 className="admin-form-section__title">Hero Section Headline & Lead</h2>
              <p className="admin-form-section__desc">The cinematic introductory masthead of the homepage.</p>
            </div>

            <div className="admin-form-grid-3">
              <div className="admin-form-group">
                <label className="admin-label">Word 1</label>
                <input
                  type="text"
                  className="admin-input"
                  value={hero.headlineWord1}
                  onChange={(e) => setContentMap({ ...contentMap, hero: { ...hero, headlineWord1: e.target.value } })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Word 2</label>
                <input
                  type="text"
                  className="admin-input"
                  value={hero.headlineWord2}
                  onChange={(e) => setContentMap({ ...contentMap, hero: { ...hero, headlineWord2: e.target.value } })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Word 3</label>
                <input
                  type="text"
                  className="admin-input"
                  value={hero.headlineWord3}
                  onChange={(e) => setContentMap({ ...contentMap, hero: { ...hero, headlineWord3: e.target.value } })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Subtitle / Value Proposition</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={hero.subLead}
                onChange={(e) => setContentMap({ ...contentMap, hero: { ...hero, subLead: e.target.value } })}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Hero Copy'}
              </button>
            </div>
          </form>
        )}

        {/* HELLO TAB */}
        {activeTab === 'hello' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSection('hello', hello);
            }}
            className="admin-form-section"
          >
            <div className="admin-form-section__header">
              <h2 className="admin-form-section__title">01 / Hello Statement</h2>
              <p className="admin-form-section__desc">Introductory architectural philosophy statement.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Philosophy Statement</label>
              <textarea
                rows={4}
                className="admin-textarea"
                value={hello.statement}
                onChange={(e) => setContentMap({ ...contentMap, hello: { ...hello, statement: e.target.value } })}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Statement'}
              </button>
            </div>
          </form>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSection('services', services);
            }}
            className="admin-form-section"
          >
            <div className="admin-form-section__header">
              <h2 className="admin-form-section__title">02 / Services & Capabilities</h2>
              <p className="admin-form-section__desc">Core technical solutions BloomBiz provides to businesses.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Services Section Lead</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={services.lead}
                onChange={(e) => setContentMap({ ...contentMap, services: { ...services, lead: e.target.value } })}
              />
            </div>

            <div className="admin-services-edit-list">
              {services.items.map((svc: any, idx: number) => (
                <div key={idx} className="admin-service-card-item">
                  <div className="admin-form-group">
                    <label className="admin-label">Service {idx + 1} Title</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={svc.title}
                      onChange={(e) => {
                        const updated = [...services.items];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setContentMap({ ...contentMap, services: { ...services, items: updated } });
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Description</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={svc.description}
                      onChange={(e) => {
                        const updated = [...services.items];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setContentMap({ ...contentMap, services: { ...services, items: updated } });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Services'}
              </button>
            </div>
          </form>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSection('about', about);
            }}
            className="admin-form-section"
          >
            <div className="admin-form-section__header">
              <h2 className="admin-form-section__title">About Studio Narrative</h2>
              <p className="admin-form-section__desc">Company mission and agency profile.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Headline</label>
              <input
                type="text"
                className="admin-input"
                value={about.headline}
                onChange={(e) => setContentMap({ ...contentMap, about: { ...about, headline: e.target.value } })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Company Bio Narrative</label>
              <textarea
                rows={5}
                className="admin-textarea"
                value={about.bio}
                onChange={(e) => setContentMap({ ...contentMap, about: { ...about, bio: e.target.value } })}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save About Page Copy'}
              </button>
            </div>
          </form>
        )}

        {/* FOOTER TAB */}
        {activeTab === 'footer' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSection('footer', footer);
            }}
            className="admin-form-section"
          >
            <div className="admin-form-section__header">
              <h2 className="admin-form-section__title">Footer Notices & System Status</h2>
              <p className="admin-form-section__desc">Copyright notice and live operational status indicator.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Copyright Line</label>
              <input
                type="text"
                className="admin-input"
                value={footer.copyrightText}
                onChange={(e) => setContentMap({ ...contentMap, footer: { ...footer, copyrightText: e.target.value } })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Availability / Status Line</label>
              <input
                type="text"
                className="admin-input"
                value={footer.statusText}
                onChange={(e) => setContentMap({ ...contentMap, footer: { ...footer, statusText: e.target.value } })}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Footer Copy'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
