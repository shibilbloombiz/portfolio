import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface LetterState {
  char: string;
  x: number;
}

export const KerningInteraction: React.FC<{ onToggleSystemView?: () => void }> = ({ onToggleSystemView }) => {
  const defaultWord = 'kerning';
  const [letters, setLetters] = useState<LetterState[]>(() =>
    [...defaultWord].map((char) => ({ char, x: 0 }))
  );
  const [isMessedUp, setIsMessedUp] = useState(false);
  const [activeMessage, setActiveMessage] = useState('Your turn. Drag a letter.');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const draggingIdx = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const initialOffset = useRef<number>(0);

  // Handle pointer down on letter
  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingIdx.current = index;
    startX.current = e.clientX;
    initialOffset.current = letters[index].x;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx.current === null) return;
    const delta = e.clientX - startX.current;
    const newX = initialOffset.current + delta;

    setLetters((prev) =>
      prev.map((item, idx) => (idx === draggingIdx.current ? { ...item, x: newX } : item))
    );

    if (!isMessedUp) {
      setIsMessedUp(true);
      setActiveMessage('Nice kerning. Keep messing it up or put it back.');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIdx.current !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      draggingIdx.current = null;
    }
  };

  // "Mess it up" action
  const handleMessItUp = () => {
    const chaoticOffsets = [-55, 42, -78, 64, -36, 85, -45];
    const newLetters = letters.map((item, idx) => ({
      ...item,
      x: chaoticOffsets[idx] || (Math.random() - 0.5) * 100
    }));

    // Animate using GSAP
    if (wordRef.current) {
      const spans = wordRef.current.querySelectorAll('.home-kern__letter');
      spans.forEach((span, idx) => {
        gsap.to(span, {
          x: newLetters[idx].x,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.02
        });
      });
    }

    setLetters(newLetters);
    setIsMessedUp(true);
    setActiveMessage('Now try to put it back.');
  };

  // "Put it back" action
  const handlePutItBack = () => {
    if (wordRef.current) {
      const spans = wordRef.current.querySelectorAll('.home-kern__letter');
      gsap.to(spans, {
        x: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.03,
        onComplete: () => {
          setLetters(letters.map((item) => ({ ...item, x: 0 })));
          setIsMessedUp(false);
          setActiveMessage('Your turn. Drag a letter.');
        }
      });
    } else {
      setLetters(letters.map((item) => ({ ...item, x: 0 })));
      setIsMessedUp(false);
      setActiveMessage('Your turn. Drag a letter.');
    }
  };

  return (
    <section
      className="home-section home-details is-ready"
      id="details"
      data-surface="dark"
      data-kern=""
      data-sys-lines-host=""
      aria-label="The boring part"
      ref={containerRef}
    >
      <div className="home-grid home-details__top">
        <p className="home-label home-details__label">
          <span className="home-label__num" aria-hidden="true">03</span>The boring part
        </p>
        <p className="home-statement home-details__a" data-spec="">
          We sweat the
        </p>
      </div>

      <div className="home-details__wrap">
        <div className="home-kern__guides" data-kern-guides="" aria-hidden="true">
          <div className="home-kern__guide-line" style={{ top: '27%' }}></div>
          <div className="home-kern__guide-line" style={{ top: '50%' }}></div>
          <div className="home-kern__guide-line" style={{ top: '75%' }}></div>
        </div>

        <p
          className="home-details__word"
          data-kern-word=""
          ref={wordRef}
          role="group"
          aria-label="kerning. Your turn: each letter can be moved."
        >
          {letters.map((item, idx) => (
            <React.Fragment key={idx}>
              <span
                className="home-kern__letter"
                role="slider"
                aria-label={item.char}
                aria-valuenow={Math.round(item.x)}
                tabIndex={0}
                style={{
                  transform: `translateX(${item.x}px)`,
                  cursor: draggingIdx.current === idx ? 'grabbing' : 'grab',
                  display: 'inline-block',
                  userSelect: 'none',
                  touchAction: 'none'
                }}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {item.char}
              </span>
              {idx < letters.length - 1 && (
                <span
                  className={`home-kern__tag ${idx % 2 === 1 ? 'home-kern__tag--alt' : ''}`}
                  aria-hidden="true"
                  style={{
                    opacity: item.x !== 0 ? 1 : 0.4,
                    transform: `translateX(${(item.x + (letters[idx + 1]?.x || 0)) / 2}px)`
                  }}
                >
                  {Math.round(Math.abs(item.x - (letters[idx + 1]?.x || 0)))}px
                </span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>

      <div className="home-grid home-details__bottom">
        <div className="home-details__action">
          <div className="home-details__say" data-kern-say="">
            <p className="home-label home-details__msg" aria-live="polite" data-kern-msg="">
              {activeMessage}
            </p>
            <p className="home-details__tools">
              {!isMessedUp ? (
                <button
                  className="home-label home-details__back"
                  type="button"
                  data-kern-mess=""
                  onClick={handleMessItUp}
                >
                  Mess it up
                </button>
              ) : (
                <button
                  className="home-label home-details__back"
                  type="button"
                  data-kern-back=""
                  onClick={handlePutItBack}
                >
                  Put it back
                </button>
              )}
            </p>
          </div>
          <button
            className="home-label line-btn home-details__btn"
            type="button"
            data-system-btn=""
            onClick={onToggleSystemView}
          >
            <span>Show me the workings</span>
          </button>
        </div>
        <p className="home-statement home-details__b">so you don't have to.</p>
      </div>
    </section>
  );
};
