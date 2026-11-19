import React, { useEffect, useRef } from 'react';

// 7x5 Classic Dot Matrix Font Dictionary
const FONT_7x5: Record<string, number[]> = {
  'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01111, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b01111],
  'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  'G': [0b01111, 0b10000, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'I': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  'J': [0b00011, 0b00001, 0b00001, 0b00001, 0b00001, 0b10001, 0b01110],
  'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  'N': [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10011, 0b10101, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  '&': [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  '*': [0b00100, 0b10101, 0b01110, 0b11111, 0b01110, 0b10101, 0b00100],
  '•': [0b00000, 0b00000, 0b01110, 0b01110, 0b01110, 0b00000, 0b00000],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b01100],
  '/': [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  '?': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b00000, 0b00100],
  ':': [0b00000, 0b01100, 0b01100, 0b00000, 0b01100, 0b01100, 0b00000],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000]
};

export interface LEDTickerProps {
  phrases?: string[];
  separator?: string;
  direction?: 'left' | 'right';
  speed?: number; // Speed in pixels/frame equivalent
  dotQuantity?: number; // Matrix rows (e.g. 9 or 10)
  dotShape?: 'round' | 'square';
  dotSpread?: number;
  onColor?: string;
  offColor?: string;
  glow?: boolean;
  glowBlur?: number;
  flicker?: boolean;
  flickerAmount?: number;
  className?: string;
}

const DEFAULT_PHRASES = [
  'CREATIVE DEVELOPMENT',
  'DIGITAL EXPERIENCES',
  'INTERACTIVE DESIGN',
  'MOTION & ANIMATION',
  'WEB TECHNOLOGY',
  'CREATIVE THINKING'
];

export const LEDTicker: React.FC<LEDTickerProps> = ({
  phrases = DEFAULT_PHRASES,
  separator = '  *  ',
  direction = 'left',
  speed = 22,
  dotQuantity = 9,
  dotShape = 'round',
  dotSpread = 1.6,
  onColor = '#FFFFFF',
  offColor = 'rgba(255, 255, 255, 0.045)',
  glow = true,
  glowBlur = 4,
  flicker = true,
  flickerAmount = 0.025,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Build the 2D boolean grid from the phrases
  const bitGridRef = useRef<number[][]>([]);
  const totalColsRef = useRef<number>(0);

  useEffect(() => {
    // Construct repeating text string: "PHRASE 1  *  PHRASE 2  *  ..."
    const fullText = phrases.join(separator) + separator;
    const grid: number[][] = Array.from({ length: 7 }, () => []);

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i].toUpperCase();
      const glyph = FONT_7x5[char] || FONT_7x5[' '];

      // Add 5 columns for character
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 7; r++) {
          grid[r].push((glyph[r] >> (4 - c)) & 1);
        }
      }

      // 1 column spacing between characters (or 2 for spaces)
      const spaceCols = char === ' ' ? 2 : 1;
      for (let s = 0; s < spaceCols; s++) {
        for (let r = 0; r < 7; r++) {
          grid[r].push(0);
        }
      }
    }

    bitGridRef.current = grid;
    totalColsRef.current = grid[0].length;
  }, [phrases, separator]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let scrollPos = 0; // Float scroll offset in matrix columns

    // Resize handling with ResizeObserver and Device Pixel Ratio
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    updateCanvasSize();
    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(container);

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const grid = bitGridRef.current;
      const totalTextCols = totalColsRef.current;

      if (!grid.length || totalTextCols === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      // Vertical layout: calculate dot pitch based on dotQuantity
      // dotQuantity represents rows on canvas (7 font rows + vertical padding)
      const rows = Math.max(7, dotQuantity);
      const topPaddingRows = Math.floor((rows - 7) / 2);
      const pitch = height / rows;
      const dotRadius = Math.max(1, (pitch - dotSpread) / 2) * dpr;
      const effectivePitch = pitch * dpr;

      // Advance scroll position (speed in columns per second)
      // speed 20 means ~20 matrix columns per second
      const colSpeed = (speed * 0.85);
      if (direction === 'left') {
        scrollPos += colSpeed * dt;
        if (scrollPos >= totalTextCols) {
          scrollPos %= totalTextCols;
        }
      } else {
        scrollPos -= colSpeed * dt;
        if (scrollPos < 0) {
          scrollPos = (scrollPos % totalTextCols) + totalTextCols;
        }
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numCols = Math.ceil(canvas.width / effectivePitch) + 2;
      const startColIndex = Math.floor(scrollPos);
      const colFraction = scrollPos - startColIndex;

      // Realistic subtle flicker factor
      const flickerVal = flicker
        ? 1 - flickerAmount * Math.sin(currentTime * 0.015)
        : 1;

      // Pre-compute glow
      if (glow) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.42)';
        ctx.shadowBlur = glowBlur * dpr;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw all LED dots
      for (let c = 0; c < numCols; c++) {
        // Screen X position
        const screenX = (c - colFraction) * effectivePitch + effectivePitch / 2;
        if (screenX < -effectivePitch || screenX > canvas.width + effectivePitch) continue;

        // Current column in circular text grid
        const textCol = (startColIndex + c) % totalTextCols;

        for (let r = 0; r < rows; r++) {
          const screenY = r * effectivePitch + effectivePitch / 2;

          // Check if this row is part of the 7-row font
          const fontRow = r - topPaddingRows;
          const isLit = fontRow >= 0 && fontRow < 7 && grid[fontRow][textCol] === 1;

          if (isLit) {
            ctx.fillStyle = onColor;
            ctx.globalAlpha = Math.min(1, Math.max(0.85, flickerVal));
            if (glow) {
              ctx.shadowColor = 'rgba(255, 255, 255, 0.42)';
              ctx.shadowBlur = glowBlur * dpr;
            }
          } else {
            ctx.fillStyle = offColor;
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          }

          if (dotShape === 'round') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(
              screenX - dotRadius,
              screenY - dotRadius,
              dotRadius * 2,
              dotRadius * 2
            );
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [direction, speed, dotQuantity, dotShape, dotSpread, onColor, offColor, glow, glowBlur, flicker, flickerAmount]);

  return (
    <section
      className={`led-ticker-wrap ${className}`}
      aria-label="Interactive LED Ticker"
    >
      <div className="led-ticker-container" ref={containerRef}>
        <canvas className="led-ticker-canvas" ref={canvasRef} aria-hidden="true" />
        <span className="u-sr">
          {phrases.join(' — ')}
        </span>
      </div>
    </section>
  );
};
