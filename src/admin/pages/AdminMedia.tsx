import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, MediaItem } from '../services/api';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Preview / Detail Modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  // Delete Dialog
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated media
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.media.list({
        page,
        limit,
        search: debouncedSearch,
        type: type !== 'all' ? type : undefined
      });
      setMediaList(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch media assets', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, type, showToast]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Handle Multi-file Upload
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await api.media.upload(formData);
      showToast(res.message, 'success');
      setPage(1);
      fetchMedia();
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Asset URL copied to clipboard!', 'success');
  };

  // Open item detail
  const handleOpenDetail = (item: MediaItem) => {
    setSelectedItem(item);
    setEditAltText(item.alt_text || '');
  };

  const handleSaveMeta = async () => {
    if (!selectedItem) return;
    setSavingMeta(true);
    try {
      await api.media.update(selectedItem.id, { alt_text: editAltText });
      showToast('Asset metadata saved', 'success');
      setMediaList((prev) =>
        prev.map((m) => (m.id === selectedItem.id ? { ...m, alt_text: editAltText } : m))
      );
      setSelectedItem((prev) => (prev ? { ...prev, alt_text: editAltText } : null));
    } catch (err: any) {
      showToast(err.message || 'Failed to update metadata', 'error');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.media.delete(itemToDelete.id);
      showToast('Media asset permanently deleted', 'success');
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      setItemToDelete(null);
      if (mediaList.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchMedia();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete asset', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">ASSET REPOSITORY / 03</span>
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-desc">
            Upload, preview, organize and integrate media assets across projects and portfolio sections.
          </p>
        </div>

        <div className="admin-page-actions">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files);
            }}
          />
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '+ Upload Files'}
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Strip */}
      <div
        className="admin-uploader-dropzone admin-uploader-dropzone--banner"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="admin-uploader-dropzone__inner">
          <div className="admin-uploader-dropzone__icon">↑</div>
          <div>
            <h3 className="admin-uploader-dropzone__title">
              {uploading ? 'Processing and uploading assets...' : 'Drag & drop image or video assets anywhere'}
            </h3>
            <p className="admin-uploader-dropzone__hint">
              Supports PNG, WebP, JPG, SVG, and MP4 up to 25MB per file.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Browse Computer
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        <div className="admin-filters-bar__search">
          <input
            type="search"
            placeholder="Search assets by filename or caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="admin-filters-bar__group">
          <select
            className="admin-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by asset type"
          >
            <option value="all">All Media Types</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="admin-media-container">
        {loading ? (
          <div className="admin-loading-state">Loading asset library...</div>
        ) : mediaList.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No media assets found</h3>
            <p>
              {debouncedSearch || type !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Upload images or video clips to start populating your media library.'}
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Assets
            </button>
          </div>
        ) : (
          <div className="admin-media-grid">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="admin-media-card"
                onClick={() => handleOpenDetail(item)}
              >
                <div className="admin-media-card__thumb">
                  {item.media_type === 'video' ? (
                    <div className="admin-media-card__video-preview">▶ Video Asset</div>
                  ) : (
                    <img src={item.url} alt={item.alt_text || item.original_name} loading="lazy" />
                  )}
                  <span className="admin-media-card__type-tag">{item.media_type}</span>
                </div>

                <div className="admin-media-card__details">
                  <span className="admin-media-card__title" title={item.original_name}>
                    {item.original_name}
                  </span>
                  <div className="admin-media-card__meta">
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      className="admin-media-card__copy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url);
                      }}
                      title="Copy URL"
                    >
                      Copy URL ⎘
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Server-Side Pagination */}
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
          itemLabel="media files"
        />
      </div>

      {/* Asset Detail / Lightbox Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.original_name}
          subtitle={`Type: ${selectedItem.mime_type} • Size: ${(selectedItem.size / 1024).toFixed(0)} KB`}
          maxWidth="760px"
        >
          <div className="admin-media-detail">
            <div className="admin-media-detail__preview">
              {selectedItem.media_type === 'video' ? (
                <video src={selectedItem.url} controls style={{ width: '100%', maxHeight: '400px' }} />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.alt_text || selectedItem.original_name}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
                />
              )}
            </div>

            <div className="admin-media-detail__info">
              <div className="admin-form-group">
                <label className="admin-label">Public Access URL</label>
                <div className="admin-input-group">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="admin-input"
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline"
                    onClick={() => handleCopyUrl(selectedItem.url)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="edit-alt-text">
                  Accessible Alt Text Caption
                </label>
                <input
                  id="edit-alt-text"
                  type="text"
                  className="admin-input"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe this image for screen readers"
                />
              </div>

              <div className="admin-media-detail__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                >
                  {savingMeta ? 'Saving...' : 'Save Caption'}
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => setItemToDelete(selectedItem)}
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Media Asset"
        message={`Are you sure you want to delete "${itemToDelete?.original_name}"? If this image is used in any project case studies, it will no longer display.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Keep Asset"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
