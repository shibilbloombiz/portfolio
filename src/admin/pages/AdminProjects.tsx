import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ProjectData } from '../services/api';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const AdminProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialLimit = parseInt(searchParams.get('limit') || '10', 10);
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialFeatured = searchParams.get('featured') || 'all';
  const initialSortBy = searchParams.get('sortBy') || 'display_order';
  const initialSortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState(initialCategory);
  const [featured, setFeatured] = useState(initialFeatured);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load categories once
  useEffect(() => {
    api.projects.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch paginated projects from server
  const fetchProjects = useCallback(async () => {
    setLoading(true);

    // Sync URL search params
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status !== 'all') params.status = status;
    if (category !== 'all') params.category = category;
    if (featured !== 'all') params.featured = featured;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    setSearchParams(params, { replace: true });

    try {
      const res = await api.projects.list({
        page,
        limit,
        search: debouncedSearch,
        status,
        category,
        featured,
        sortBy,
        sortOrder
      });

      setProjects(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status, category, featured, sortBy, sortOrder, setSearchParams, showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle Publish / Unpublish Toggle
  const handleToggleStatus = async (proj: ProjectData) => {
    const nextStatus = proj.status === 'published' ? 'draft' : 'published';
    try {
      await api.projects.toggleStatus(proj.id!, nextStatus);
      showToast(`Project "${proj.title}" set to ${nextStatus}`, 'success');
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, status: nextStatus } : p))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update project status', 'error');
    }
  };

  // Handle Project Duplication
  const handleDuplicate = async (proj: ProjectData) => {
    try {
      const res = await api.projects.duplicate(proj.id!);
      showToast(res.message, 'success');
      fetchProjects();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate project', 'error');
    }
  };

  // Handle Project Deletion
  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !projectToDelete.id) return;
    setActionLoading(true);
    try {
      await api.projects.delete(projectToDelete.id);
      showToast(`Project "${projectToDelete.title}" deleted`, 'success');
      setProjectToDelete(null);
      // If we deleted the only item on the page, go to previous page if page > 1
      if (projects.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchProjects();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">PORTFOLIO REPOSITORY / 02</span>
          <h1 className="admin-page-title">Project Management</h1>
          <p className="admin-page-desc">
            Create, edit, organize and publish high-performance case studies across the website.
          </p>
        </div>

        <div className="admin-page-actions">
          <Link to="/admin/projects/new" className="admin-btn admin-btn--primary">
            + Create New Project
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        {/* Search */}
        <div className="admin-filters-bar__search">
          <input
            type="search"
            placeholder="Search by title, sector, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>

        {/* Status Filter */}
        <div className="admin-filters-bar__group">
          <select
            className="admin-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Category Filter */}
          <select
            className="admin-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Featured Filter */}
          <select
            className="admin-select"
            value={featured}
            onChange={(e) => {
              setFeatured(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by featured"
          >
            <option value="all">Featured: All</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Only</option>
          </select>

          {/* Sort By */}
          <select
            className="admin-select"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so as 'asc' | 'desc');
              setPage(1);
            }}
            aria-label="Sort projects"
          >
            <option value="display_order:asc">Order: Ascending</option>
            <option value="display_order:desc">Order: Descending</option>
            <option value="title:asc">Title: A–Z</option>
            <option value="title:desc">Title: Z–A</option>
            <option value="year:desc">Year: Newest First</option>
            <option value="year:asc">Year: Oldest First</option>
            <option value="updated_at:desc">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Projects Table & List */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No projects found</h3>
            <p>
              {debouncedSearch || status !== 'all' || category !== 'all'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'Get started by creating your first client case study.'}
            </p>
            <Link to="/admin/projects/new" className="admin-btn admin-btn--primary">
              + Create New Project
            </Link>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th style={{ width: '80px' }}>Thumbnail</th>
                  <th>Project Details</th>
                  <th>Sector & Year</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '100px' }}>Featured</th>
                  <th style={{ width: '220px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id} className="admin-table-row">
                    {/* Display Order */}
                    <td className="admin-table-col-num">{proj.display_order ?? '—'}</td>

                    {/* Thumbnail */}
                    <td className="admin-table-col-thumb">
                      <div className="admin-table-thumb">
                        {proj.media && proj.media[0] ? (
                          <img src={proj.media[0].src} alt={proj.title} />
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="admin-table-col-main">
                      <div className="admin-table-title-group">
                        <Link
                          to={`/admin/projects/edit/${proj.id}`}
                          className="admin-table-title-link"
                        >
                          {proj.title}
                        </Link>
                        <span className="admin-table-slug">/{proj.slug}</span>
                      </div>
                      {proj.description && (
                        <p className="admin-table-desc">{proj.description}</p>
                      )}
                    </td>

                    {/* Sector & Year */}
                    <td className="admin-table-col-meta">
                      <span className="admin-table-sector">{proj.sector || '—'}</span>
                      <span className="admin-table-year">{proj.year || '—'}</span>
                    </td>

                    {/* Status Toggle */}
                    <td>
                      <button
                        type="button"
                        className={`admin-status-pill admin-status-pill--${proj.status}`}
                        onClick={() => handleToggleStatus(proj)}
                        title={`Click to ${proj.status === 'published' ? 'unpublish' : 'publish'}`}
                      >
                        <span className="admin-status-pill__dot" />
                        {proj.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    {/* Featured */}
                    <td>
                      {proj.is_featured ? (
                        <span className="admin-badge admin-badge--featured">★ Featured</span>
                      ) : (
                        <span className="admin-badge-empty">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-table-actions">
                        <Link
                          to={`/admin/projects/edit/${proj.id}`}
                          className="admin-btn admin-btn--sm admin-btn--outline"
                          title="Edit project"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--ghost"
                          onClick={() => handleDuplicate(proj)}
                          title="Duplicate as draft copy"
                        >
                          Copy
                        </button>

                        <a
                          href={`/work/${proj.slug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--sm admin-btn--ghost"
                          title="View live case study"
                        >
                          Live ↗
                        </a>

                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                          onClick={() => setProjectToDelete(proj)}
                          title="Delete project"
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

        {/* Server-Side Pagination Component */}
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
          itemLabel="projects"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Case Study"
        message={`Are you sure you want to permanently delete "${projectToDelete?.title}"? This action removes the project and its case study data from the database.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Keep Project"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
