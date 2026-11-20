import React, { useEffect, useRef, useState } from 'react';
import {
  VERT_SHADER,
  FRAG_SHADER,
  UNIFORM_NAMES,
  ADVANCED_DEFAULTS,
  PRIMARY_DEFAULTS,
  TPS,
  FT
} from './tileShader';

// Helper math functions with zero per-frame memory allocation
function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1, 7), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

export const HeroTileBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Find hero section parent for pointer events and bounding rect
    const heroSection = container.closest<HTMLElement>('#hero') || container;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL2 context with high-performance constraints
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Compile shaders
    const compileShader = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('TileShader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERT_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vs || !fs) {
      setWebglSupported(false);
      return;
    }

    const prog = gl.createProgram();
    if (!prog) {
      setWebglSupported(false);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('TileShader link error:', gl.getProgramInfoLog(prog));
      setWebglSupported(false);
      return;
    }

    // Cache uniform locations into a typed map
    const U: Record<string, WebGLUniformLocation | null> = {};
    for (const name of UNIFORM_NAMES) {
      U[name] = gl.getUniformLocation(prog, name);
    }

    // Full-screen triangle buffer & VAO
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create Texture Atlas (1536x512 with three 512x512 project screenshot cells)
    const atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);

    // Fast initial 2D canvas fallback while texture loads
    const S = 512;
    const N = 9;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = S * N;
    offCanvas.height = S;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      const colors = ['#f3f0ea', '#0c1208', '#f6f3ee', '#1a1a1c', '#18181a', '#14243b', '#361b14', '#201912', '#241538'];
      const textColors = ['#1c1917', '#c6ee2e', '#10223d', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
      const labels = ['NOVARA', 'PRECISION', 'EDUCARRT', 'FUTURE', 'GADCO', 'JAKKUR', 'MOCS', 'NAZZI', 'SABKA'];
      for (let i = 0; i < N; i++) {
        ctx.fillStyle = colors[i] || '#f3f0ea';
        ctx.fillRect(i * S, 0, S, S);
        ctx.fillStyle = textColors[i] || '#1c1917';
        ctx.font = 'bold 70px Helvetica Neue, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i] || '', i * S + 256, 256);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offCanvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Configure texture filtering & anisotropic filtering (up to 8x)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');
    if (anisoExt) {
      const maxAniso = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxAniso));
    }

    // Load actual high-fidelity cropped WebP texture atlas
    const atlasImg = new Image();
    atlasImg.src = '/images/hero-tile-atlas.webp';
    atlasImg.onload = () => {
      if (!gl || gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      drawFrame(performance.now());
    };

    // Pre-allocated typed arrays for zero-garbage uniform setting
    const bg = hexToRgb(PRIMARY_DEFAULTS.background);
    const accent = hexToRgb(PRIMARY_DEFAULTS.accent);
    const peach = hexToRgb(ADVANCED_DEFAULTS.peachColor);
    const inner = hexToRgb(ADVANCED_DEFAULTS.innerColor);
    const stud = hexToRgb(ADVANCED_DEFAULTS.studColor);
    const fl = ADVANCED_DEFAULTS.floorLift / 100;
    const floor = [bg[0] + (1 - bg[0]) * fl, bg[1] + (1 - bg[1]) * fl, bg[2] + (1 - bg[2]) * fl];

    const camPosArr = new Float32Array(3);
    const camRArr = new Float32Array(3);
    const camUArr = new Float32Array(3);
    const camFArr = new Float32Array(3);
    const halfArr = new Float32Array(3);
    const lightDirArr = new Float32Array(3);
    const bgArr = new Float32Array(bg);
    const floorArr = new Float32Array(floor);
    const accentArr = new Float32Array(accent);
    const peachArr = new Float32Array(peach);
    const innerArr = new Float32Array(inner);
    const studArr = new Float32Array(stud);

    // Light direction precomputation
    const la = (ADVANCED_DEFAULTS.lightAngle * Math.PI) / 180;
    const lh = (ADVANCED_DEFAULTS.lightHeight * Math.PI) / 180;
    const cosLh = Math.cos(lh);
    const rawLx = cosLh * Math.cos(la);
    const rawLy = Math.sin(lh);
    const rawLz = cosLh * Math.sin(la);
    const lenL = Math.hypot(rawLx, rawLy, rawLz) || 1;
    lightDirArr[0] = rawLx / lenL;
    lightDirArr[1] = rawLy / lenL;
    lightDirArr[2] = rawLz / lenL;

    // Viewport dimensions & pointer state (zero DOM layout thrashing)
    let cssW = heroSection.clientWidth || container.clientWidth || window.innerWidth;
    let cssH = heroSection.clientHeight || container.clientHeight || window.innerHeight;
    const cachedHeroRect = { left: 0, top: 0 };

    const updateCachedRect = () => {
      const r = heroSection.getBoundingClientRect();
      cachedHeroRect.left = r.left;
      cachedHeroRect.top = r.top;
      cssW = heroSection.clientWidth || container.clientWidth || window.innerWidth;
      cssH = heroSection.clientHeight || container.clientHeight || window.innerHeight;
    };
    updateCachedRect();

    const ptr = { x: 0, y: 0, over: 0 };
    const ez = { over: 0, px: 0, py: 0 };

    // Pointer move listener on hero section
    const onPointerMove = (e: PointerEvent) => {
      ptr.over = 1;
      ptr.x = e.clientX - cachedHeroRect.left;
      ptr.y = e.clientY - cachedHeroRect.top;
    };

    const onPointerLeave = () => {
      ptr.over = 0;
    };

    heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('scroll', updateCachedRect, { passive: true });

    // Adaptive resolution control
    const isMobile = window.innerWidth <= 768;
    let qv = isMobile ? 0.55 : 0.70;
    const minQ = 0.45;
    const maxQ = isMobile ? 0.75 : 1.0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Initial canvas sizing
    const initW = Math.max(1, Math.round(cssW * dpr * qv));
    const initH = Math.max(1, Math.round(cssH * dpr * qv));
    canvas.width = initW;
    canvas.height = initH;

    let last = -1;
    let dist = 0;
    let T = 0;
    let ft = 16.6;
    let cnt = 0;
    let sdt = 1 / 60;
    let rafId = 0;
    let isVisible = true;
    let isTabActive = !document.hidden;
    let isSlowDevice = false;
    let slowCount = 0;

    // Single frame draw routine
    const drawFrame = (now: number) => {
      if (!gl || gl.isContextLost()) return;

      const raw = last < 0 ? 0 : now - last;
      const dt = Math.min(raw / 1000, 1 / 20);
      last = now;

      if (!prefersReducedMotion && !isSlowDevice) {
        T += dt;
      }

      sdt += (dt - sdt) * 0.12;

      // Smoothed frame time measurement for adaptive resolution
      if (raw > 0 && raw < 250) {
        ft += (raw - ft) * 0.06;
        if (++cnt > 24) {
          cnt = 0;
          if (ft > 18.0 && qv > minQ) {
            qv = Math.max(minQ, qv - 0.08);
          } else if (ft < 12.5 && qv < maxQ) {
            qv = Math.min(maxQ, qv + 0.02);
          }

          // Check if device stays pinned at minimum scale for several seconds
          if (qv <= minQ) {
            if (++slowCount > 25) {
              isSlowDevice = true;
            }
          } else {
            slowCount = 0;
          }
        }
      }

      // Compute coarse integer resolution
      const W = Math.max(1, Math.round(cssW * dpr * qv));
      const H = Math.max(1, Math.round(cssH * dpr * qv));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      // Ease hover parameters
      const k = 1 - Math.exp(-dt * 6);
      ez.over += (ptr.over - ez.over) * k;
      const tx = ptr.over ? (ptr.x / Math.max(1, cssW)) * 2 - 1 : 0;
      const ty = ptr.over ? 1 - (ptr.y / Math.max(1, cssH)) * 2 : 0;
      ez.px += (tx - ez.px) * k;
      ez.py += (ty - ez.py) * k;

      const hk = ADVANCED_DEFAULTS.hover / 50;
      const rate = PRIMARY_DEFAULTS.speed / 50;
      if (!prefersReducedMotion && !isSlowDevice) {
        dist += TPS * rate * sdt;
      }

      // Raymarching camera & wave math
      const R = Math.max(0.2, ADVANCED_DEFAULTS.ballRadius / 100);
      const maxH = (PRIMARY_DEFAULTS.lift / 100) * 0.5;
      const jit = ADVANCED_DEFAULTS.heightJitter / 100;
      const ballY = FT + maxH * (1 + jit) + R;

      const ta = (ADVANCED_DEFAULTS.travelAngle * Math.PI) / 180;
      const ga = (ADVANCED_DEFAULTS.gridAngle * Math.PI) / 180;
      const cg = Math.cos(ga);
      const sg = Math.sin(ga);

      const Bx = -Math.cos(ta) * dist;
      const Bz = Math.sin(ta) * dist;
      const wr = (v: number) => ((v % 256) + 256) % 256;
      const bq0 = wr(Bx * cg - Bz * sg);
      const bq1 = wr(Bx * sg + Bz * cg);

      const axis0 = Math.sin(ta);
      const axis2 = Math.cos(ta);
      const th = (dist / R) % (Math.PI * 2);
      const elB = (ADVANCED_DEFAULTS.tilt * Math.PI) / 180;

      const n01 = -Math.sin(elB);
      const n02 = Math.cos(elB);
      const ct = Math.cos(th);
      const st = Math.sin(th);

      // cross([axis0, 0, axis2], [0, n01, n02])
      const kx0 = -axis2 * n01;
      const kx1 = -axis0 * n02;
      const kx2 = axis0 * n01;
      const kd = axis2 * n02;

      halfArr[0] = kx0 * st + axis0 * kd * (1 - ct);
      halfArr[1] = n01 * ct + kx1 * st;
      halfArr[2] = n02 * ct + kx2 * st + axis2 * kd * (1 - ct);

      const focal = Math.max(0.5, ADVANCED_DEFAULTS.perspective / 100);
      const el = elB + (ez.py * 4 * Math.PI / 180) * hk * ez.over;
      const yaw = (ez.px * 6 * Math.PI / 180) * hk * ez.over;
      const D = (R * focal * Math.max(1, cssH)) / Math.max(10, PRIMARY_DEFAULTS.size / 2);

      const cosEl = Math.cos(el);
      const sinEl = Math.sin(el);
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);

      const back0 = -sinYaw * cosEl;
      const back1 = sinEl;
      const back2 = -cosYaw * cosEl;

      camPosArr[0] = back0 * D;
      camPosArr[1] = ballY + back1 * D;
      camPosArr[2] = back2 * D;

      const fwd0 = -back0;
      const fwd1 = -back1;
      const fwd2 = -back2;
      camFArr[0] = fwd0;
      camFArr[1] = fwd1;
      camFArr[2] = fwd2;

      // right = nm([fwd2, 0, -fwd0])
      const rLen = Math.hypot(fwd2, -fwd0) || 1;
      const r0 = fwd2 / rLen;
      const r2 = -fwd0 / rLen;
      camRArr[0] = r0;
      camRArr[1] = 0;
      camRArr[2] = r2;

      // up = cross(fwd, right)
      camUArr[0] = fwd1 * r2;
      camUArr[1] = fwd2 * r0 - fwd0 * r2;
      camUArr[2] = -fwd1 * r0;

      const off = ADVANCED_DEFAULTS.ballOffset / 100;

      // Pointer ray intersection with tile field
      let pq0 = 9999;
      let pq1 = 9999;
      let ps = 0;

      if (ez.over > 0.001 && hk > 0) {
        const ux = (ptr.x - cssW / 2) / Math.max(1, cssH);
        const uy = (cssH / 2 - ptr.y) / Math.max(1, cssH);
        const dir1 = camUArr[1] * (uy - off) + fwd1 * focal;
        if (dir1 < -1e-4) {
          const dir0 = r0 * ux + camUArr[0] * (uy - off) + fwd0 * focal;
          const dir2 = r2 * ux + camUArr[2] * (uy - off) + fwd2 * focal;
          const t = (FT + maxH * 0.5 - camPosArr[1]) / dir1;
          const X = camPosArr[0] + dir0 * t;
          const Z = camPosArr[2] + dir2 * t;
          pq0 = X * cg - Z * sg + bq0;
          pq1 = X * sg + Z * cg + bq1;
          ps = Math.min(1, ez.over * hk * 0.6);
        }
      }

      // Render WebGL frame
      gl.viewport(0, 0, W, H);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);

      gl.uniform2f(U.uRes, W, H);
      gl.uniform3fv(U.uCamPos, camPosArr);
      gl.uniform3fv(U.uCamR, camRArr);
      gl.uniform3fv(U.uCamU, camUArr);
      gl.uniform3fv(U.uCamF, camFArr);
      gl.uniform1f(U.uFocal, focal);
      gl.uniform1f(U.uOff, off);
      gl.uniform2f(U.uGrid, cg, sg);
      gl.uniform2f(U.uBallQ, bq0, bq1);
      gl.uniform2f(U.uBall, R, ballY);
      gl.uniform1f(U.uMaxH, maxH);
      gl.uniform2f(
        U.uMound,
        PRIMARY_DEFAULTS.radius,
        PRIMARY_DEFAULTS.radius * Math.max(0.05, Math.min(0.95, ADVANCED_DEFAULTS.moundInner / 100))
      );
      gl.uniform3f(
        U.uTileP,
        jit,
        ADVANCED_DEFAULTS.missingTiles / 100,
        ADVANCED_DEFAULTS.cornerRound / 100
      );
      gl.uniform3f(
        U.uGaps,
        ADVANCED_DEFAULTS.tileGap / 100,
        ADVANCED_DEFAULTS.floorGap / 100,
        ADVANCED_DEFAULTS.studSize / 100
      );
      gl.uniform3fv(U.uHalf, halfArr);
      gl.uniform3fv(U.uL, lightDirArr);
      gl.uniform3fv(U.uAccent, accentArr);
      gl.uniform3fv(U.uPeach, peachArr);
      gl.uniform3fv(U.uInner, innerArr);
      gl.uniform3fv(U.uFloor, floorArr);
      gl.uniform3fv(U.uStudC, studArr);
      gl.uniform3fv(U.uBg, bgArr);
      gl.uniform4f(
        U.uLook,
        ADVANCED_DEFAULTS.ambient / 100,
        Math.max(1, ADVANCED_DEFAULTS.shadowEdge),
        ADVANCED_DEFAULTS.shadowStrength / 100,
        ADVANCED_DEFAULTS.band / 100
      );
      gl.uniform3f(
        U.uGlass,
        ADVANCED_DEFAULTS.glassRim / 100,
        ADVANCED_DEFAULTS.specular / 100,
        ADVANCED_DEFAULTS.refraction / 100
      );
      gl.uniform3f(U.uPtr, pq0, pq1, ps);
      gl.uniform3f(U.uFx, ADVANCED_DEFAULTS.grain / 100, ADVANCED_DEFAULTS.vignette / 100, T);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(U.uImg, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Core Animation Frame Loop
    const frame = (now: number) => {
      if (!isVisible || !isTabActive) {
        last = -1;
        return;
      }

      drawFrame(now);

      // If user prefers reduced motion or device is too slow, render static frame and halt loop
      if (prefersReducedMotion || isSlowDevice) {
        return;
      }

      rafId = requestAnimationFrame(frame);
    };

    // Pause / resume controller
    const startLoop = () => {
      cancelAnimationFrame(rafId);
      last = -1;
      rafId = requestAnimationFrame(frame);
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafId);
    };

    // IntersectionObserver: Pause when hero is scrolled out of view
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && isTabActive) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(heroSection);

    // Tab visibility & Window focus listeners
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive && isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let blurTimer: any = null;
    const handleBlur = () => {
      blurTimer = setTimeout(() => {
        isTabActive = false;
        stopLoop();
      }, 3000);
    };
    const handleFocus = () => {
      if (blurTimer) clearTimeout(blurTimer);
      isTabActive = true;
      if (isVisible) startLoop();
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // ResizeObserver: update dimensions and immediately redraw frame
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        cssW = entry.contentRect.width || heroSection.clientWidth || window.innerWidth;
        cssH = entry.contentRect.height || heroSection.clientHeight || window.innerHeight;
      }
      updateCachedRect();
      drawFrame(performance.now());
    });
    resizeObserver.observe(heroSection);

    // Context loss / restoration
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      stopLoop();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    // Initial frame draw immediately on mount
    drawFrame(performance.now());

    // Initial start using requestIdleCallback to guarantee zero impact on LCP
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        startLoop();
      }, { timeout: 250 });
    } else {
      setTimeout(startLoop, 100);
    }

    // Cleanup on unmount
    return () => {
      stopLoop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('scroll', updateCachedRect);
      heroSection.removeEventListener('pointermove', onPointerMove);
      heroSection.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);

      // Clean up GPU resources
      if (gl) {
        gl.deleteTexture(atlasTex);
        gl.deleteBuffer(vbo);
        gl.deleteVertexArray(vao);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteProgram(prog);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-tile-bg"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: PRIMARY_DEFAULTS.background
      }}
      aria-hidden="true"
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
      ) : null}
    </div>
  );
};

export default HeroTileBackground;
