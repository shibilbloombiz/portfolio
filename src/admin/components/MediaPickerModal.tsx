import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { api, MediaItem } from '../services/api';
import { Pagination } from './Pagination';
import { useToast } from '../context/ToastContext';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaUrl: string, mediaItem?: MediaItem) => void;
  title?: string;
  allowedType?: 'all' | 'image' | 'video';
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  allowedType = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchMedia = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await api.media.list({
        page,
        limit,
        search,
        type: allowedType !== 'all' ? allowedType : undefined
      });
      setMediaList(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      showToast(err.message || 'Failed to load media assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [isOpen, page, limit, search, allowedType]);

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
      setActiveTab('library');
      setPage(1);
      fetchMedia();
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="820px">
      <div className="admin-media-picker">
        {/* Tabs */}
        <div className="admin-media-picker__tabs">
          <button
            type="button"
            className={`admin-media-picker__tab ${activeTab === 'library' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Media Library ({totalItems})
          </button>
          <button
            type="button"
            className={`admin-media-picker__tab ${activeTab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            + Upload New
          </button>
        </div>

        {activeTab === 'library' ? (
          <div className="admin-media-picker__content">
            {/* Search bar */}
            <div className="admin-media-picker__search">
              <input
                type="text"
                placeholder="Search by filename or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="admin-input"
              />
            </div>

            {/* Media Grid */}
            {loading ? (
              <div className="admin-loading-state">Loading media files...</div>
            ) : mediaList.length === 0 ? (
              <div className="admin-empty-state">
                <p>No media files found matching your search.</p>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => setActiveTab('upload')}
                >
                  Upload your first file
                </button>
              </div>
            ) : (
              <div className="admin-media-picker__grid">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className="admin-media-picker__item"
                    onClick={() => {
                      onSelect(item.url, item);
                      onClose();
                    }}
                    title={`Select ${item.original_name}`}
                  >
                    <div className="admin-media-picker__thumb">
                      {item.media_type === 'video' ? (
                        <div className="admin-media-picker__video-icon">▶ Video</div>
                      ) : (
                        <img src={item.url} alt={item.alt_text || item.original_name} loading="lazy" />
                      )}
                    </div>
                    <div className="admin-media-picker__item-info">
                      <span className="admin-media-picker__name">{item.original_name}</span>
                      <span className="admin-media-picker__size">
                        {(item.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="admin-media-picker__pagination">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={limit}
                onPageChange={(p) => setPage(p)}
                isLoading={loading}
                itemLabel="assets"
              />
            </div>
          </div>
        ) : (
          <div
            className="admin-uploader-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept={allowedType === 'video' ? 'video/*' : allowedType === 'image' ? 'image/*' : 'image/*,video/*'}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) handleUpload(e.target.files);
              }}
            />
            <div className="admin-uploader-dropzone__icon">↑</div>
            <h3 className="admin-uploader-dropzone__title">
              {uploading ? 'Uploading assets...' : 'Drag & drop image or video files here'}
            </h3>
            <p className="admin-uploader-dropzone__hint">
              Supports PNG, JPG, WebP, SVG, and MP4 up to 25MB.
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Processing...' : 'Browse Computer'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
