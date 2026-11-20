import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, SummaryStats, ProjectData, EnquiryItem } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, projectsData, enquiriesData] = await Promise.all([
        api.settings.getStats(),
        api.projects.list({ page: 1, limit: 5, sortBy: 'updated_at', sortOrder: 'desc' }),
        api.enquiries.list({ page: 1, limit: 5, status: 'all' })
      ]);
      setStats(statsData);
      setRecentProjects(projectsData.data);
      setRecentEnquiries(enquiriesData.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-subtitle">SYSTEM STATUS / OVERVIEW</span>
          <h1 className="admin-page-title">Executive Dashboard</h1>
        </div>

        <div className="admin-page-actions">
          <Link to="/admin/projects/new" className="admin-btn admin-btn--primary">
            + Add Project
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--outline"
          >
            Preview Site ↗
          </a>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading dashboard analytics...</div>
      ) : (
        <>
          {/* KPI Metrics Grid */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <span className="admin-metric-card__num">01</span>
              <span className="admin-metric-card__label">TOTAL PROJECTS</span>
              <div className="admin-metric-card__value">{stats?.projects.total ?? 0}</div>
              <div className="admin-metric-card__meta">
                <span className="admin-badge admin-badge--published">
                  {stats?.projects.published ?? 0} Published
                </span>
                <span className="admin-badge admin-badge--draft">
                  {stats?.projects.drafts ?? 0} Drafts
                </span>
              </div>
            </div>

            <div className="admin-metric-card">
              <span className="admin-metric-card__num">02</span>
              <span className="admin-metric-card__label">MEDIA STORAGE</span>
              <div className="admin-metric-card__value">{stats?.media.total ?? 0}</div>
              <div className="admin-metric-card__meta">
                <span>{stats?.media.totalFormatted || '0 MB'} allocated in storage</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <span className="admin-metric-card__num">03</span>
              <span className="admin-metric-card__label">CLIENT ENQUIRIES</span>
              <div className="admin-metric-card__value">{stats?.enquiries.total ?? 0}</div>
              <div className="admin-metric-card__meta">
                {Boolean(stats?.enquiries.new && stats.enquiries.new > 0) ? (
                  <span className="admin-badge admin-badge--warning">
                    {stats?.enquiries.new} New Submissions
                  </span>
                ) : (
                  <span>All inquiries handled</span>
                )}
              </div>
            </div>

            <div className="admin-metric-card">
              <span className="admin-metric-card__num">04</span>
              <span className="admin-metric-card__label">SOCIAL CHANNELS</span>
              <div className="admin-metric-card__value">{stats?.socials.active ?? 0}</div>
              <div className="admin-metric-card__meta">
                <span>Active external connections</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="admin-quick-links-bar">
            <span className="admin-quick-links-label">FAST NAVIGATION:</span>
            <Link to="/admin/projects" className="admin-quick-link">
              [ 02 Projects Directory ]
            </Link>
            <Link to="/admin/media" className="admin-quick-link">
              [ 03 Media Library ]
            </Link>
            <Link to="/admin/contact" className="admin-quick-link">
              [ 05 Contact Settings ]
            </Link>
            <Link to="/admin/content" className="admin-quick-link">
              [ 06 Website Copy ]
            </Link>
            <Link to="/admin/seo" className="admin-quick-link">
              [ 07 Search Optimization ]
            </Link>
          </div>

          {/* Two-Column Grid: Recent Projects & Recent Inquiries */}
          <div className="admin-grid-2col">
            {/* Recent Projects */}
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h2 className="admin-panel__title">Recent Projects</h2>
                  <p className="admin-panel__subtitle">Latest updated case studies</p>
                </div>
                <Link to="/admin/projects" className="admin-panel__action">
                  View All ({stats?.projects.total}) →
                </Link>
              </div>

              <div className="admin-panel__body">
                {recentProjects.length === 0 ? (
                  <p className="admin-empty-text">No projects found.</p>
                ) : (
                  <div className="admin-recent-list">
                    {recentProjects.map((proj) => (
                      <div key={proj.id} className="admin-recent-item">
                        <div className="admin-recent-item__thumb">
                          {proj.media && proj.media[0] ? (
                            <img src={proj.media[0].src} alt={proj.title} />
                          ) : (
                            <div className="admin-recent-item__no-thumb">No img</div>
                          )}
                        </div>

                        <div className="admin-recent-item__info">
                          <div className="admin-recent-item__top">
                            <span className="admin-recent-item__title">{proj.title}</span>
                            <span className={`admin-badge admin-badge--${proj.status}`}>
                              {proj.status}
                            </span>
                          </div>
                          <span className="admin-recent-item__sector">{proj.sector} ({proj.year})</span>
                        </div>

                        <div className="admin-recent-item__actions">
                          <Link
                            to={`/admin/projects/edit/${proj.id}`}
                            className="admin-btn admin-btn--sm admin-btn--outline"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/work/${proj.slug}/`}
                            target="_blank"
                            className="admin-btn admin-btn--sm admin-btn--ghost"
                            title="Open live case study"
                          >
                            Live ↗
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h2 className="admin-panel__title">Contact Form Inquiries</h2>
                  <p className="admin-panel__subtitle">Submissions from prospective clients</p>
                </div>
                <Link to="/admin/enquiries" className="admin-panel__action">
                  Manage Enquiries →
                </Link>
              </div>

              <div className="admin-panel__body">
                {recentEnquiries.length === 0 ? (
                  <div className="admin-empty-state-mini">
                    <p>No client inquiries received yet.</p>
                    <span className="admin-hint-text">
                      Submissions on the public <code>/contact</code> page will appear here immediately.
                    </span>
                  </div>
                ) : (
                  <div className="admin-recent-list">
                    {recentEnquiries.map((enq) => (
                      <div key={enq.id} className="admin-recent-item">
                        <div className="admin-recent-item__info">
                          <div className="admin-recent-item__top">
                            <span className="admin-recent-item__title">{enq.name}</span>
                            <span className={`admin-badge admin-badge--${enq.status}`}>
                              {enq.status}
                            </span>
                          </div>
                          <span className="admin-recent-item__email">{enq.email}</span>
                          {enq.message && (
                            <p className="admin-recent-item__excerpt">{enq.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
