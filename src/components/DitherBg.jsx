/**
 * DitherBg.jsx
 * Linear Wash Bayer-ordered halftone with animated noise blending.
 * Configured from user's Dither Lab preferences.
 */
import { useEffect, useRef } from 'react';

// ── 8×8 Bayer ordered-dither matrix (values 0–63) ─────────────────────────
const BAYER = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
];

function h21(x, y) {
  let v = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return ((v ^ (v >>> 16)) >>> 0) / 0x100000000;
}

function sn(x, y) {
  const ix = x | 0, iy = y | 0;
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    h21(ix,   iy)   * (1 - ux) * (1 - uy) +
    h21(ix+1, iy)   *      ux  * (1 - uy) +
    h21(ix,   iy+1) * (1 - ux) *      uy  +
    h21(ix+1, iy+1) *      ux  *      uy
  );
}

export default function DitherBg() {
  const ref = useRef(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: -1000 }); // Fuera de pantalla por defecto

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let startTime = performance.now();

    function render(time) {
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W;
        canvas.height = H;
      }

      ctx.clearRect(0, 0, W, H);

      const CELL = 3;
      const DOT  = 2;
      const OFF  = Math.floor((CELL - DOT) / 2);
      const COLS = Math.ceil(W / CELL);
      const ROWS = Math.ceil(H / CELL);

      const tOffset = (time - startTime) * 0.0005;

      const mouseGridX = mousePos.current.x / CELL;
      const mouseGridY = mousePos.current.y / CELL;

      const img  = ctx.createImageData(W, H);
      const data = img.data;

      for (let py = 0; py < ROWS; py++) {
        for (let px = 0; px < COLS; px++) {
          
          const threshold = BAYER[py & 7][px & 7] / 64;

          // Subtle Mouse Distortion (Magnify / Push effect)
          let dpx = px;
          let dpy = py;
          const dx = px - mouseGridX;
          const dy = py - mouseGridY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 45; // Radio del efecto en celdas (aprox 135px)
          
          if (dist < maxDist && dist > 0) {
            const force = Math.pow((maxDist - dist) / maxDist, 2);
            // Empuja el campo de ruido lejos del mouse
            dpx -= (dx / dist) * force * 15;
            dpy -= (dy / dist) * force * 15;
          }

          // Linear Wash (fades from top to bottom)
          const density = 1.0 - (dpy / ROWS);

          // Animated micro noise to break banding and add life
          const nIntens = 0.6;
          const microNoise = sn(dpx * 0.1 + tOffset*2, dpy * 0.1 + tOffset*2) * 0.1 * nIntens;
          const finalValue = density + microNoise;

          if (finalValue > threshold) {
            const r = 255, g = 85, b = 255; // Purple color

            const t = Math.min(1, Math.max(0, (finalValue - threshold) / (1.0 - threshold + 0.01)));
            const bAlpha = 245;
            const mAlpha = 255;
            const alpha = Math.round(t * (mAlpha - bAlpha) + bAlpha);

            for (let dy = 0; dy < DOT; dy++) {
              for (let dx = 0; dx < DOT; dx++) {
                const sx = px * CELL + OFF + dx;
                const sy = py * CELL + OFF + dy;
                if (sx < W && sy < H) {
                  const i = (sy * W + sx) * 4;
                  data[i]     = r;
                  data[i + 1] = g;
                  data[i + 2] = b;
                  data[i + 3] = alpha;
                }
              }
            }
          }
        }
      }

      ctx.putImageData(img, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,         // behind all page content
      }}
    />
  );
}
