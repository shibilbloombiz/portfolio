import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, ProjectData, MediaItem } from '../services/api';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { useToast } from '../context/ToastContext';

export const AdminProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ProjectData>>({
    title: '',
    slug: '',
    description: '',
    sector: '',
    scope: '',
    year: new Date().getFullYear().toString(),
    tone: '#121110',
    problem: '',
    decision: '',
    principles: [''],
    result: '',
    external_url: '',
    next_slug: '',
    next_title: '',
    next_tone: '#121110',
    media: [
      {
        type: 'image',
        src: '',
        alt: '',
        frame: 'Web / 1440 / 12 cols',
        layout: 'lead'
      }
    ],
    status: 'published',
    is_featured: false,
    display_order: 1
  });

  // Media Picker Modal State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [targetMediaIndex, setTargetMediaIndex] = useState<number | null>(null);

  // Fetch project data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      api.projects.get(id)
        .then((project) => {
          setFormData({
            ...project,
            principles: project.principles?.length ? project.principles : [''],
            media: project.media?.length ? project.media : [
              {
                type: 'image',
                src: '',
                alt: '',
                frame: 'Web / 1440 / 12 cols',
                layout: 'lead'
              }
            ]
          });
        })
        .catch((err: any) => {
          showToast(err.message || 'Failed to load project details', 'error');
          navigate('/admin/projects');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate, showToast]);

  const handleChange = (field: keyof ProjectData, value: any) => {
    setDirty(true);
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title in create mode if slug was not manually touched
      if (field === 'title' && !isEditMode && (!prev.slug || prev.slug === prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  // Principles management
  const handlePrincipleChange = (index: number, val: string) => {
    setDirty(true);
    const updated = [...(formData.principles || [])];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, principles: updated }));
  };

  const addPrinciple = () => {
    setDirty(true);
    setFormData((prev) => ({
      ...prev,
      principles: [...(prev.principles || []), '']
    }));
  };

  const removePrinciple = (index: number) => {
    setDirty(true);
    setFormData((prev) => ({
      ...prev,
      principles: prev.principles?.filter((_, i) => i !== index)
    }));
  };

  // Media items management
  const handleMediaChange = (index: number, key: string, value: any) => {
    setDirty(true);
    const updated = [...(formData.media || [])];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev) => ({ ...prev, media: updated }));
  };

  const addMediaItem = () => {
    setDirty(true);
    setFormData((prev) => ({
      ...prev,
      media: [
        ...(prev.media || []),
        {
          type: 'image',
          src: '',
          alt: '',
          frame: 'Web / 1440 / 12 cols',
          layout: 'lead'
        }
      ]
    }));
  };

  const removeMediaItem = (index: number) => {
    setDirty(true);
    setFormData((prev) => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index)
    }));
  };

  const openMediaPickerFor = (index: number) => {
    setTargetMediaIndex(index);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string, item?: MediaItem) => {
    if (targetMediaIndex !== null && formData.media) {
      const updated = [...formData.media];
      updated[targetMediaIndex] = {
        ...updated[targetMediaIndex],
        src: url,
        alt: item?.alt_text || updated[targetMediaIndex].alt || formData.title || '',
        type: item?.media_type || 'image'
      };
      setFormData((prev) => ({ ...prev, media: updated }));
      setDirty(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast('Project title is required', 'error');
      return;
    }

    if (!formData.slug?.trim()) {
      showToast('Project slug is required', 'error');
      return;
    }

    setSaving(true);
    try {
      // Clean up empty principles
      const cleanedPrinciples = (formData.principles || [])
        .map((p) => p.trim())
        .filter(Boolean);

      // Clean up empty media
      const cleanedMedia = (formData.media || []).filter((m) => m.src && m.src.trim());

      const payload = {
        ...formData,
        principles: cleanedPrinciples,
        media: cleanedMedia
      };

      if (isEditMode && id) {
        await api.projects.update(Number(id), payload);
        showToast('Project updated successfully', 'success');
      } else {
        await api.projects.create(payload);
        showToast('Project created successfully', 'success');
      }

      setDirty(false);
      navigate('/admin/projects');
    } catch (err: any) {
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-state">Loading project details...</div>;
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">
            PROJECTS / {isEditMode ? `EDIT: ${formData.title || id}` : 'CREATE NEW'}
          </span>
          <h1 className="admin-page-title">
            {isEditMode ? `Edit Project: ${formData.title}` : 'Add New Portfolio Case Study'}
          </h1>
        </div>

        <div className="admin-page-actions">
          <Link to="/admin/projects" className="admin-btn admin-btn--outline">
            Cancel
          </Link>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-project-form">
        {/* Section 1: Core Metadata */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">01 / Core Identification</h2>
            <p className="admin-form-section__desc">Basic project taxonomy, naming, and sector classification.</p>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-title">
                Project Title <span className="admin-required">*</span>
              </label>
              <input
                id="proj-title"
                type="text"
                required
                className="admin-input"
                placeholder="e.g. EduCarrt"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-slug">
                URL Slug <span className="admin-required">*</span>
              </label>
              <div className="admin-input-group">
                <span className="admin-input-affix">/work/</span>
                <input
                  id="proj-slug"
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. educarrt"
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-form-grid-3">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-sector">
                Sector / Industry
              </label>
              <input
                id="proj-sector"
                type="text"
                className="admin-input"
                placeholder="e.g. EdTech & Global Advisory"
                value={formData.sector || ''}
                onChange={(e) => handleChange('sector', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-year">
                Year
              </label>
              <input
                id="proj-year"
                type="text"
                className="admin-input"
                placeholder="2026"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-tone">
                Brand Tone (Color)
              </label>
              <div className="admin-color-picker-wrap">
                <input
                  type="color"
                  className="admin-color-input"
                  value={formData.tone || '#121110'}
                  onChange={(e) => handleChange('tone', e.target.value)}
                />
                <input
                  id="proj-tone"
                  type="text"
                  className="admin-input"
                  value={formData.tone || ''}
                  onChange={(e) => handleChange('tone', e.target.value)}
                  placeholder="#10223d"
                />
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-scope">
              Scope of Work
            </label>
            <input
              id="proj-scope"
              type="text"
              className="admin-input"
              placeholder="e.g. Web platform, advisory portal, admissions system"
              value={formData.scope || ''}
              onChange={(e) => handleChange('scope', e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-desc">
              Short Description / Subtitle
            </label>
            <input
              id="proj-desc"
              type="text"
              className="admin-input"
              placeholder="e.g. Study Abroad Consultant for a Brighter Future."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-ext">
              External Live Website URL
            </label>
            <input
              id="proj-ext"
              type="url"
              className="admin-input"
              placeholder="https://clientwebsite.com/"
              value={formData.external_url || ''}
              onChange={(e) => handleChange('external_url', e.target.value)}
            />
          </div>
        </section>

        {/* Section 2: Narrative Case Study */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">02 / Case Study Narrative</h2>
            <p className="admin-form-section__desc">
              Problem framing, strategic decisions, design principles, and measurable business results.
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-problem">
              The Challenge / Problem
            </label>
            <textarea
              id="proj-problem"
              rows={4}
              className="admin-textarea"
              placeholder="What friction, constraint or business challenge did the client face?"
              value={formData.problem || ''}
              onChange={(e) => handleChange('problem', e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-decision">
              Strategic Decision / Architecture
            </label>
            <textarea
              id="proj-decision"
              rows={4}
              className="admin-textarea"
              placeholder="How was the technical architecture or visual system constructed to solve the problem?"
              value={formData.decision || ''}
              onChange={(e) => handleChange('decision', e.target.value)}
            />
          </div>

          {/* Key Principles */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-label">Key Principles (Bullet points)</label>
              <button
                type="button"
                className="admin-btn-text"
                onClick={addPrinciple}
              >
                + Add Principle
              </button>
            </div>

            <div className="admin-principles-list">
              {(formData.principles || []).map((principle, idx) => (
                <div key={idx} className="admin-dynamic-row">
                  <span className="admin-dynamic-row__num">{idx + 1}.</span>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Sub-second page transitions via prefetching"
                    value={principle}
                    onChange={(e) => handlePrincipleChange(idx, e.target.value)}
                  />
                  {(formData.principles?.length || 0) > 1 && (
                    <button
                      type="button"
                      className="admin-dynamic-row__remove"
                      onClick={() => removePrinciple(idx)}
                      title="Remove principle"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="proj-result">
              Measurable Business Result
            </label>
            <textarea
              id="proj-result"
              rows={3}
              className="admin-textarea"
              placeholder="e.g. Consultation bookings increased by 42% within first month of launch."
              value={formData.result || ''}
              onChange={(e) => handleChange('result', e.target.value)}
            />
          </div>
        </section>

        {/* Section 3: Media Gallery */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">03 / Visual Media Showcase</h2>
            <p className="admin-form-section__desc">
              Mockups, videos, and interface screenshots rendered in the case study page and hero displays.
            </p>
          </div>

          <div className="admin-media-cards-list">
            {(formData.media || []).map((m, idx) => (
              <div key={idx} className="admin-media-card-item">
                <div className="admin-media-card-item__preview">
                  {m.src ? (
                    <img src={m.src} alt={m.alt || 'Mockup preview'} />
                  ) : (
                    <div className="admin-media-card-item__placeholder">No image selected</div>
                  )}
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm admin-btn--primary admin-media-card-item__choose-btn"
                    onClick={() => openMediaPickerFor(idx)}
                  >
                    Select Asset
                  </button>
                </div>

                <div className="admin-media-card-item__fields">
                  <div className="admin-form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Media URL / Path</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="/images/work/projects/sample-1.png"
                        value={m.src || ''}
                        onChange={(e) => handleMediaChange(idx, 'src', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Type</label>
                      <select
                        className="admin-select"
                        value={m.type || 'image'}
                        onChange={(e) => handleMediaChange(idx, 'type', e.target.value)}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Frame Device</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Web / 1440 / 12 cols"
                        value={m.frame || ''}
                        onChange={(e) => handleMediaChange(idx, 'frame', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Layout</label>
                      <select
                        className="admin-select"
                        value={m.layout || 'lead'}
                        onChange={(e) => handleMediaChange(idx, 'layout', e.target.value)}
                      >
                        <option value="lead">Lead Display</option>
                        <option value="pair">Pair Column</option>
                        <option value="wide">Full-Bleed Wide</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Accessible Alt Text</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Descriptive caption for screen readers"
                      value={m.alt || ''}
                      onChange={(e) => handleMediaChange(idx, 'alt', e.target.value)}
                    />
                  </div>

                  {(formData.media?.length || 0) > 1 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                      onClick={() => removeMediaItem(idx)}
                    >
                      Remove Asset
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn--outline admin-btn--full"
              onClick={addMediaItem}
            >
              + Add Another Media Item
            </button>
          </div>
        </section>

        {/* Section 4: Next Project & Publication Controls */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">04 / Publication & Routing</h2>
            <p className="admin-form-section__desc">Next-case navigation link, publication status, and sorting order.</p>
          </div>

          <div className="admin-form-grid-3">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-next-slug">
                Next Project Slug
              </label>
              <input
                id="proj-next-slug"
                type="text"
                className="admin-input"
                placeholder="ftx"
                value={formData.next_slug || ''}
                onChange={(e) => handleChange('next_slug', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-next-title">
                Next Project Title
              </label>
              <input
                id="proj-next-title"
                type="text"
                className="admin-input"
                placeholder="FTX Detailing"
                value={formData.next_title || ''}
                onChange={(e) => handleChange('next_title', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-next-tone">
                Next Project Tone
              </label>
              <input
                id="proj-next-tone"
                type="text"
                className="admin-input"
                placeholder="#141f17"
                value={formData.next_tone || ''}
                onChange={(e) => handleChange('next_tone', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-grid-3">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-status">
                Publication Status
              </label>
              <select
                id="proj-status"
                className="admin-select"
                value={formData.status || 'published'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="published">Published (Visible on site)</option>
                <option value="draft">Draft (Hidden from public)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="proj-order">
                Display Order (Weight)
              </label>
              <input
                id="proj-order"
                type="number"
                className="admin-input"
                value={formData.display_order ?? 1}
                onChange={(e) => handleChange('display_order', Number(e.target.value))}
              />
            </div>

            <div className="admin-form-group admin-checkbox-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(formData.is_featured)}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                />
                <span>Feature in Hero & Highlights</span>
              </label>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="admin-form-actions">
          <Link to="/admin/projects" className="admin-btn admin-btn--outline">
            Cancel
          </Link>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving Project...' : isEditMode ? 'Save & Publish Changes' : 'Create Project'}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};
