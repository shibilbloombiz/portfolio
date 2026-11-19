import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../../data/projects';

interface DraggableProjectCard {
  id: string;
  slug: string;
  title: string;
  note: string;
  sector: string;
  img: string;
  externalUrl?: string;
  baseLeft: number;
  baseTop: number;
  rot: number;
  x: number;
  y: number;
  zIndex: number;
  isHeld: boolean;
}

// Initial unaligned, non-stacking scattered coordinates across the canvas
const SPREAD_LAYOUT = [
  { left: 6, top: 5, rot: -5 },
  { left: 39, top: 4, rot: 3 },
  { left: 71, top: 7, rot: -4 },
  { left: 12, top: 38, rot: 5 },
  { left: 44, top: 41, rot: -3 },
  { left: 74, top: 39, rot: 4 },
  { left: 8, top: 72, rot: -4 },
  { left: 41, top: 75, rot: 5 },
  { left: 72, top: 71, rot: -3 }
];

export const OffTheClockCards: React.FC = () => {
  const navigate = useNavigate();
  const [zIndexTracker, setZIndexTracker] = useState(20);

  // Map our portfolio projects to scattered cards
  const [cardsState, setCardsState] = useState<DraggableProjectCard[]>(() =>
    projects.slice(0, 9).map((proj, idx) => {
      const layout = SPREAD_LAYOUT[idx] || {
        left: (idx % 3) * 32 + 8,
        top: Math.floor(idx / 3) * 32 + 6,
        rot: ((idx * 3) % 9) - 4
      };
      return {
        id: proj.slug,
        slug: proj.slug,
        title: proj.title,
        note: proj.description,
        sector: proj.sector,
        img: proj.media[0]?.src || '/images/work/projects/educarrt-1.png',
        externalUrl: proj.externalUrl,
        baseLeft: layout.left,
        baseTop: layout.top,
        rot: layout.rot,
        x: 0,
        y: 0,
        zIndex: idx + 1,
        isHeld: false
      };
    })
  );

  const dragRef = useRef<{
    idx: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  }>({
    idx: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false
  });

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const newZ = zIndexTracker + 1;
    setZIndexTracker(newZ);

    dragRef.current = {
      idx: index,
      startX: e.clientX,
      startY: e.clientY,
      originX: cardsState[index].x,
      originY: cardsState[index].y,
      hasMoved: false
    };

    setCardsState((prev) =>
      prev.map((c, i) => (i === index ? { ...c, zIndex: newZ, isHeld: true } : c))
    );
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current.idx === null) return;
    const { idx, startX, startY, originX, originY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.hypot(dx, dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    // Dynamic tilt based on drag motion
    const dynamicRot = Math.max(-10, Math.min(10, dx * 0.08));

    setCardsState((prev) =>
      prev.map((c, i) =>
        i === idx
          ? {
              ...c,
              x: originX + dx,
              y: originY + dy,
              rot: SPREAD_LAYOUT[i]?.rot ? SPREAD_LAYOUT[i].rot + dynamicRot : c.rot
            }
          : c
      )
    );
  };

  const handlePointerUp = (index: number, e: React.PointerEvent) => {
    if (dragRef.current.idx !== null) {
      const { hasMoved } = dragRef.current;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current.idx = null;

      setCardsState((prev) =>
        prev.map((c, i) => (i === index ? { ...c, isHeld: false } : c))
      );

      // If clicked without dragging, navigate to project case study
      if (!hasMoved) {
        navigate(`/work/${cardsState[index].slug}/`);
      }
    }
  };

  return (
    <section className="about-section about-clock" id="projects-field" aria-label="Selected Projects">
      <div className="about-grid">
        <p className="about-label about-clock__label">
          <span className="about-label__num" aria-hidden="true">04</span>Selected Works
        </p>
        <p className="about-label about-label--muted about-clock__hint">
          Click to explore • Drag to arrange
        </p>
      </div>

      <div className="about-grid">
        <ul className="about-field is-enhanced" data-drag-cards="">
          {cardsState.map((card, idx) => (
            <li
              key={card.id}
              className={`about-card is-live ${card.isHeld ? 'is-grabbing' : ''}`}
              data-drag-card=""
              style={{
                position: 'absolute',
                left: `${card.baseLeft}%`,
                top: `${card.baseTop}%`,
                transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rot}deg) scale(${card.isHeld ? 1.05 : 1})`,
                zIndex: card.zIndex,
                cursor: card.isHeld ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none'
              }}
              onPointerDown={(e) => handlePointerDown(idx, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(idx, e)}
              onPointerCancel={(e) => handlePointerUp(idx, e)}
            >
              <div className="about-frame" data-frame={card.sector} data-frame-span="">
                <img
                  className="about-card__img"
                  src={card.img}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <p className="about-label">
                {card.title}
                <span className="about-card__note">{card.note}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
