import React, { useState, useEffect, useCallback } from 'react';
import { api, EnquiryItem } from '../services/api';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // View Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);

  // Delete Confirm
  const [itemToDelete, setItemToDelete] = useState<EnquiryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.list({
        page,
        limit,
        search,
        status: status !== 'all' ? status : undefined
      });
      setEnquiries(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch client enquiries', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, showToast]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleStatusChange = async (enquiry: EnquiryItem, nextStatus: string) => {
    try {
      await api.enquiries.updateStatus(enquiry.id, nextStatus);
      showToast(`Inquiry marked as ${nextStatus}`, 'success');
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiry.id ? { ...e, status: nextStatus as any } : e))
      );
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update enquiry status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.enquiries.delete(itemToDelete.id);
      showToast('Enquiry deleted successfully', 'success');
      if (selectedEnquiry?.id === itemToDelete.id) {
        setSelectedEnquiry(null);
      }
      setItemToDelete(null);
      fetchEnquiries();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete enquiry', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">CLIENT INQUIRIES / 09</span>
          <h1 className="admin-page-title">Client Enquiries</h1>
          <p className="admin-page-desc">
            Direct form submissions and prospective project requests received from the public website.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        <div className="admin-filters-bar__search">
          <input
            type="search"
            placeholder="Search by client name, email, or message..."
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
            <option value="all">All Enquiries ({totalItems})</option>
            <option value="new">New / Unread</option>
            <option value="in_progress">In Discussion</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">Loading client inquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No enquiries found</h3>
            <p>
              {search || status !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Any messages submitted via the public /contact form will be displayed here immediately.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th>Client Contact</th>
                  <th>Project Type / Service</th>
                  <th>Budget</th>
                  <th>Date</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="admin-table-row">
                    <td className="admin-table-col-num">{enq.id}</td>
                    <td>
                      <div className="admin-table-title-group">
                        <strong className="admin-table-client-name">{enq.name}</strong>
                        <span className="admin-table-client-email">{enq.email}</span>
                        {enq.phone && <span className="admin-table-client-phone">{enq.phone}</span>}
                      </div>
                    </td>
                    <td>{enq.service || 'General Web Project'}</td>
                    <td>{enq.budget || 'Flexible'}</td>
                    <td className="admin-table-date">
                      {new Date(enq.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <select
                        className={`admin-status-select admin-status-select--${enq.status}`}
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq, e.target.value)}
                      >
                        <option value="new">● New</option>
                        <option value="in_progress">◐ In Progress</option>
                        <option value="completed">✓ Completed</option>
                        <option value="archived">✕ Archived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--outline"
                          onClick={() => setSelectedEnquiry(enq)}
                        >
                          View Message
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                          onClick={() => setItemToDelete(enq)}
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
          itemLabel="enquiries"
        />
      </div>

      {/* View Enquiry Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title={`Inquiry from: ${selectedEnquiry.name}`}
          subtitle={`Submitted on ${new Date(selectedEnquiry.created_at).toLocaleString()}`}
          maxWidth="600px"
        >
          <div className="admin-enquiry-modal">
            <div className="admin-enquiry-modal__grid">
              <div>
                <span className="admin-enquiry-modal__label">EMAIL:</span>
                <a href={`mailto:${selectedEnquiry.email}`} className="admin-enquiry-modal__value">
                  {selectedEnquiry.email}
                </a>
              </div>
              {selectedEnquiry.phone && (
                <div>
                  <span className="admin-enquiry-modal__label">PHONE:</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="admin-enquiry-modal__value">
                    {selectedEnquiry.phone}
                  </a>
                </div>
              )}
              {selectedEnquiry.service && (
                <div>
                  <span className="admin-enquiry-modal__label">REQUESTED SERVICE:</span>
                  <span className="admin-enquiry-modal__value">{selectedEnquiry.service}</span>
                </div>
              )}
              {selectedEnquiry.budget && (
                <div>
                  <span className="admin-enquiry-modal__label">INDICATIVE BUDGET:</span>
                  <span className="admin-enquiry-modal__value">{selectedEnquiry.budget}</span>
                </div>
              )}
            </div>

            <div className="admin-enquiry-modal__message-box">
              <span className="admin-enquiry-modal__label">MESSAGE CONTENT:</span>
              <p className="admin-enquiry-modal__message-text">
                {selectedEnquiry.message || 'No additional message text provided.'}
              </p>
            </div>

            <div className="admin-modal-actions">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=BloomBiz Techno Hub - Re: Your Project Inquiry`}
                className="admin-btn admin-btn--primary"
              >
                Reply via Email ✉
              </a>
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={() => setSelectedEnquiry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Enquiry Record"
        message={`Are you sure you want to delete the enquiry from "${itemToDelete?.name}"?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Enquiry"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
