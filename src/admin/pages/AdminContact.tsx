import React, { useState, useEffect } from 'react';
import { api, ContactSettingsData } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminContact: React.FC = () => {
  const [formData, setFormData] = useState<ContactSettingsData>({
    whatsapp_number: '',
    whatsapp_message: '',
    email: '',
    phone: '',
    enquiry_url: '',
    booking_url: '',
    address: '',
    timezone: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.contact.get()
      .then((data) => {
        setFormData({
          whatsapp_number: data.whatsapp_number || '',
          whatsapp_message: data.whatsapp_message || '',
          email: data.email || '',
          phone: data.phone || '',
          enquiry_url: data.enquiry_url || '',
          booking_url: data.booking_url || '',
          address: data.address || '',
          timezone: data.timezone || ''
        });
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load contact settings', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleChange = (field: keyof ContactSettingsData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.contact.update(formData);
      showToast('Contact settings successfully updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update contact settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Generate live WhatsApp click preview link
  const cleanNumber = formData.whatsapp_number.replace(/[^0-9]/g, '');
  const whatsAppPreviewUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(formData.whatsapp_message)}`;

  if (loading) {
    return <div className="admin-loading-state">Loading contact configuration...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">COMMUNICATION PIPELINES / 05</span>
          <h1 className="admin-page-title">Contact & Inquiry Channels</h1>
          <p className="admin-page-desc">
            Configure direct client communication channels including WhatsApp instant messaging, inquiry endpoints, and booking links.
          </p>
        </div>

        <div className="admin-page-actions">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--outline"
          >
            Preview Contact Page ↗
          </a>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-contact-form">
        {/* WhatsApp Channel */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">WhatsApp Instant Lead Channel</h2>
            <p className="admin-form-section__desc">
              Direct connection for high-intent visitors on mobile and desktop.
            </p>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="wa-number">
                WhatsApp Number (with country code)
              </label>
              <input
                id="wa-number"
                type="text"
                className="admin-input"
                placeholder="+919876543210"
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              />
              <span className="admin-hint-text">
                Include international country code without spaces or symbols (e.g. +91 98765 43210).
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="wa-msg">
                Pre-Filled Client Message
              </label>
              <textarea
                id="wa-msg"
                rows={3}
                className="admin-textarea"
                placeholder="Hello BloomBiz! I would like to enquire about..."
                value={formData.whatsapp_message}
                onChange={(e) => handleChange('whatsapp_message', e.target.value)}
              />
            </div>
          </div>

          {/* Live WhatsApp Test Button */}
          {cleanNumber && (
            <div className="admin-preview-box">
              <span className="admin-preview-box__title">Live WhatsApp Gateway Preview:</span>
              <p className="admin-preview-box__url">{whatsAppPreviewUrl}</p>
              <a
                href={whatsAppPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--sm admin-btn--primary"
              >
                Test WhatsApp Open Link ↗
              </a>
            </div>
          )}
        </section>

        {/* Corporate Communication Details */}
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h2 className="admin-form-section__title">Email & Phone Endpoints</h2>
            <p className="admin-form-section__desc">
              Official inquiry addresses and consultation scheduling links.
            </p>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-email">
                Inquiry Email Address
              </label>
              <input
                id="corp-email"
                type="email"
                className="admin-input"
                placeholder="info@bloombiz.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-phone">
                Phone Number
              </label>
              <input
                id="corp-phone"
                type="text"
                className="admin-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-enquiry-url">
                Custom Enquiry Form URL
              </label>
              <input
                id="corp-enquiry-url"
                type="url"
                className="admin-input"
                placeholder="https://bloombiz.com/enquire"
                value={formData.enquiry_url}
                onChange={(e) => handleChange('enquiry_url', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-booking-url">
                Consultation Booking URL (Cal.com / Calendly)
              </label>
              <input
                id="corp-booking-url"
                type="url"
                className="admin-input"
                placeholder="https://cal.com/bloombiz/consultation"
                value={formData.booking_url}
                onChange={(e) => handleChange('booking_url', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-addr">
                Studio / Headquarters Address
              </label>
              <input
                id="corp-addr"
                type="text"
                className="admin-input"
                placeholder="Cyberpark, Kozhikode, Kerala, India"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="corp-tz">
                Local Operating Timezone
              </label>
              <input
                id="corp-tz"
                type="text"
                className="admin-input"
                placeholder="Asia/Kolkata (IST)"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Publish Contact Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
