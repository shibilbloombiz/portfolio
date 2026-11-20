import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  isLoading?: boolean;
  itemLabel?: string; // e.g. "projects", "media files"
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  itemLabel = 'items'
}) => {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with intelligent ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`admin-pagination ${isLoading ? 'is-loading' : ''}`} aria-label="Pagination Navigation">
      {/* Items count summary */}
      <div className="admin-pagination__summary">
        <span className="admin-pagination__count">
          Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
        <span className="admin-pagination__page-of">
          (Page {currentPage} of {totalPages})
        </span>
      </div>

      {/* Page controls */}
      <div className="admin-pagination__controls">
        {/* First page */}
        <button
          type="button"
          className="admin-pagination__btn admin-pagination__btn--nav"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          title="First page"
          aria-label="First page"
        >
          «
        </button>

        {/* Previous page */}
        <button
          type="button"
          className="admin-pagination__btn admin-pagination__btn--nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Numeric page pills */}
        <div className="admin-pagination__numbers" role="navigation" aria-label="Page numbers">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="admin-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                className={`admin-pagination__btn admin-pagination__btn--num ${isActive ? 'is-active' : ''}`}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading || isActive}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          className="admin-pagination__btn admin-pagination__btn--nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Next page"
        >
          Next
        </button>

        {/* Last page */}
        <button
          type="button"
          className="admin-pagination__btn admin-pagination__btn--nav"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          title="Last page"
          aria-label="Last page"
        >
          »
        </button>
      </div>

      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="admin-pagination__per-page">
          <label htmlFor="admin-items-per-page" className="admin-pagination__per-page-label">
            Per page:
          </label>
          <select
            id="admin-items-per-page"
            className="admin-pagination__select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    </div>
  );
};
