import React, { useState, useEffect } from 'react';

interface ViewSwitchProps {
  isSystemView: boolean;
  onToggleSystemView: (active: boolean) => void;
}

export const ViewSwitch: React.FC<ViewSwitchProps> = ({ isSystemView, onToggleSystemView }) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        onToggleSystemView(!isSystemView);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSystemView, onToggleSystemView]);

  return (
    <>
      {!isHidden ? (
        <div className="view-switch" role="group" aria-label="View" data-view-switch="">
          <button
            type="button"
            className={`view-switch__btn ${!isSystemView ? 'is-active' : ''}`}
            data-view-btn="design"
            aria-pressed={!isSystemView}
            aria-label="Design view"
            data-tip="Design"
            onClick={() => onToggleSystemView(false)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="2.5" y="2.5" width="11" height="11" />
              <circle className="view-switch__fill" cx="8" cy="8" r="2.6" />
            </svg>
          </button>
          <button
            type="button"
            className={`view-switch__btn view-switch__btn--system ${isSystemView ? 'is-active' : ''}`}
            data-view-btn="system"
            aria-pressed={isSystemView}
            aria-label="System view: the grid and the specs"
            aria-keyshortcuts="S"
            data-tip="System  S"
            onClick={() => onToggleSystemView(true)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="2.5" y="2.5" width="11" height="11" />
              <path d="M6.17 2.5v11M9.83 2.5v11" />
            </svg>
          </button>
          <button
            type="button"
            className="view-switch__btn view-switch__btn--close"
            data-view-close=""
            aria-label="Hide the view switch"
            data-tip="Hide"
            onClick={() => setIsHidden(true)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="view-restore"
          data-view-restore=""
          aria-label="Show the view switch"
          onClick={() => setIsHidden(false)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8z" />
            <circle cx="8" cy="8" r="1.9" />
          </svg>
        </button>
      )}
    </>
  );
};
