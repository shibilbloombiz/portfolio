const fs = require('fs');

const gridCss = `
/* Works Page 3-in-a-row Grid Model */
.work-grid-section {
  padding-bottom: 14vh;
}
.work-view-controls {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--dark-brown) 15%, transparent);
  margin-bottom: 2.5rem;
  width: 100%;
}
.work-count {
  font-family: var(--mono);
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--dark-brown) 60%, transparent);
}
.work-view-toggles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.work-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--dark-brown) 20%, transparent);
  background: transparent;
  color: var(--dark-brown);
  font-family: var(--mono);
  font-size: 0.78rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.work-view-toggle:hover {
  background: color-mix(in srgb, var(--dark-brown) 8%, transparent);
}
.work-view-toggle.is-active {
  background: var(--dark-brown);
  color: var(--sand);
  border-color: var(--dark-brown);
}

.work-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.5rem 2rem;
  width: 100%;
}

.work-grid-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.work-grid-card__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 6px;
  background-color: color-mix(in srgb, var(--dark-brown) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--dark-brown) 12%, transparent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.work-grid-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.001);
  transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.work-grid-card:hover .work-grid-card__img {
  transform: scale(1.05);
}

.work-grid-card__overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--card-tone, #160d08) 25%, transparent);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.work-grid-card:hover .work-grid-card__overlay {
  opacity: 1;
}

.work-grid-card__tag {
  display: inline-block;
  padding: 0.45rem 1rem;
  background: var(--sand);
  color: var(--dark-brown);
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(8px);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.work-grid-card:hover .work-grid-card__tag {
  transform: translateY(0);
}

.work-grid-card__info {
  display: flex;
  flex-direction: column;
  padding-top: 1.1rem;
  gap: 0.35rem;
}

.work-grid-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.work-grid-card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--dark-brown);
  transition: color 0.25s ease;
}

.work-grid-card:hover .work-grid-card__title {
  color: var(--main, #160d08);
}

.work-grid-card__year {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--dark-brown) 50%, transparent);
}

.work-grid-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-grid-card__sector {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.3;
  color: color-mix(in srgb, var(--dark-brown) 65%, transparent);
}

.work-grid-card__arrow {
  font-size: 1.1rem;
  color: var(--dark-brown);
  transform: translateX(-4px);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.work-grid-card:hover .work-grid-card__arrow {
  transform: translateX(0);
  opacity: 1;
}

@media screen and (max-width: 1024px) {
  .work-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem 1.5rem;
  }
}

@media screen and (max-width: 640px) {
  .work-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .work-grid-card__title {
    font-size: 1.25rem;
  }
}
`;

fs.appendFileSync('src/styles/main.css', gridCss);
console.log('Appended 3-column work grid CSS successfully.');
