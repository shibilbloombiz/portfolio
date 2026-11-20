import React, { useState, useEffect, useCallback } from 'react';
import { api, SocialLinkItem } from '../services/api';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const AdminSocial: React.FC = () => {
  const [socials, setSocials] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLinkItem | null>(null);
  const [formPlatform, setFormPlatform] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<SocialLinkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchSocials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.social.list({
        page,
        limit,
        search,
        status: status !== 'all' ? status : undefined
      });
      setSocials(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch social links', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, showToast]);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormPlatform('');
    setFormUrl('');
    setFormLabel('');
    setFormActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SocialLinkItem) => {
    setEditingItem(item);
    setFormPlatform(item.platform);
    setFormUrl(item.url);
    setFormLabel(item.label || '');
    setFormActive(item.is_active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlatform.trim() || !formUrl.trim()) {
      showToast('Platform name and URL are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform: formPlatform.trim(),
        url: formUrl.trim(),
        label: formLabel.trim() || formPlatform.trim(),
        is_active: formActive
      };

      if (editingItem) {
        await api.social.update(editingItem.id, payload);
        showToast(`Social link "${payload.platform}" updated`, 'success');
      } else {
        await api.social.create(payload);
        showToast(`Social link "${payload.platform}" added`, 'success');
      }

      setModalOpen(false);
      fetchSocials();
    } catch (err: any) {
      showToast(err.message || 'Failed to save social link', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: SocialLinkItem) => {
    try {
      const res = await api.social.toggle(item.id);
      showToast(res.message, 'success');
      setSocials((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: res.is_active } : s))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.social.delete(itemToDelete.id);
      showToast('Social link deleted', 'success');
      setItemToDelete(null);
      fetchSocials();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete social link', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">EXTERNAL CHANNELS / 04</span>
          <h1 className="admin-page-title">Social Links</h1>
          <p className="admin-page-desc">
            Manage public social profiles, handles, and external community links displayed in the footer and menu.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleOpenAdd}
          >
            + Add Social Channel
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        <div className="admin-filters-bar__search">
          <input
            type="search"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="admin-input"
          />
        </div>

        <div className="admin-filters-bar__group">
          <select
            className="admin-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Channels</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">Loading social connections...</div>
        ) : socials.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No social channels found</h3>
            <p>Connect your Instagram, LinkedIn, GitHub or Behance profiles.</p>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleOpenAdd}
            >
              + Add Social Channel
            </button>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th>Platform</th>
                  <th>Display Label</th>
                  <th>Target URL</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {socials.map((item) => (
                  <tr key={item.id} className="admin-table-row">
                    <td className="admin-table-col-num">{item.display_order}</td>
                    <td>
                      <strong>{item.platform}</strong>
                    </td>
                    <td>{item.label}</td>
                    <td>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-external-link"
                      >
                        {item.url} ↗
                      </a>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-status-pill ${item.is_active ? 'admin-status-pill--published' : 'admin-status-pill--draft'}`}
                        onClick={() => handleToggle(item)}
                        title="Click to toggle active state"
                      >
                        <span className="admin-status-pill__dot" />
                        {item.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--outline"
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                          onClick={() => setItemToDelete(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reusable Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={(p) => setPage(p)}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          isLoading={loading}
          itemLabel="channels"
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Channel: ${editingItem.platform}` : 'Add Social Channel'}
        maxWidth="500px"
      >
        <form onSubmit={handleSave} className="admin-form-vertical">
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="soc-platform">
              Platform Name <span className="admin-required">*</span>
            </label>
            <input
              id="soc-platform"
              type="text"
              required
              className="admin-input"
              placeholder="e.g. LinkedIn, Instagram, X"
              value={formPlatform}
              onChange={(e) => setFormPlatform(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="soc-url">
              Profile URL <span className="admin-required">*</span>
            </label>
            <input
              id="soc-url"
              type="url"
              required
              className="admin-input"
              placeholder="https://linkedin.com/company/bloombiz"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="soc-label">
              Display Handle / Label
            </label>
            <input
              id="soc-label"
              type="text"
              className="admin-input"
              placeholder="e.g. @bloombiztechnohub"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
          </div>

          <div className="admin-form-group admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              <span>Active and visible on website</span>
            </label>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Channel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Social Channel"
        message={`Are you sure you want to remove "${itemToDelete?.platform}" from your public channels?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Channel"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
