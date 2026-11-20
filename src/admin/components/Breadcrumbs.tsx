import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumbs">
      <Link to="/admin" className="admin-breadcrumbs__link">
        ADMIN
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <span className="admin-breadcrumbs__separator" aria-hidden="true">
              /
            </span>
            {item.href && !isLast ? (
              <Link to={item.href} className="admin-breadcrumbs__link">
                {item.label.toUpperCase()}
              </Link>
            ) : (
              <span className="admin-breadcrumbs__current" aria-current="page">
                {item.label.toUpperCase()}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
