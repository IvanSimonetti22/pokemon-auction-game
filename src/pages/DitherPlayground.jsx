import React, { useState, useEffect, useRef } from 'react';

const BAYER2 = [
  [0, 2],
  [3, 1]
];

const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function getBayerValue(matrixType, x, y) {
  if (matrixType === 2) return BAYER2[y % 2][x % 2] / 4;
  if (matrixType === 4) return BAYER4[y % 4][x % 4] / 16;
  return BAYER8[y % 8][x % 8] / 64;
}

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

const PALETTE = [
  [255,  85, 255], // purple
  [ 85, 255,  85], // green
  [255, 170,   0], // gold
  [ 85, 255, 255], // cyan
  [255, 255, 255], // white
  [100, 100, 100], // grey
];

export function DitherPlayground({ onBack }) {
  const ref = useRef(null);

  // Configuraciones editables
  const [matrixSize, setMatrixSize] = useState(8);
  const [cellSize, setCellSize] = useState(3);
  const [dotSize, setDotSize] = useState(2);
  const [noiseScale, setNoiseScale] = useState(0.04);
  const [noiseIntensity, setNoiseIntensity] = useState(0.6);
  const [baseAlpha, setBaseAlpha] = useState(30);
  const [maxAlpha, setMaxAlpha] = useState(255);
  const [colorMode, setColorMode] = useState('purple'); // colorful, green, purple
  const [usePureNoise, setUsePureNoise] = useState(false);
  const [thresholdBias, setThresholdBias] = useState(0.0);
  const [densityMode, setDensityMode] = useState('radial-gradient'); // noise, linear-gradient, radial-gradient
  const [animate, setAnimate] = useState(true);

  // Guardamos la posición del mouse (coordenadas reales de pantalla)
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

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
    const ctx = canvas.getContext('2d', { alpha: false }); // Opaque canvas is faster, we will fill black

    let animationFrameId;
    let startTime = performance.now();

    function render(time) {
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      // Si cambió el tamaño, ajustamos el canvas
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      // Fill background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, W, H);

      const CELL = parseInt(cellSize);
      const DOT = parseInt(dotSize);
      const OFF = Math.floor((CELL - DOT) / 2);
      const COLS = Math.ceil(W / CELL);
      const ROWS = Math.ceil(H / CELL);

      // Tiempo para animar el ruido (flujo lento)
      const tOffset = (time - startTime) * 0.0005;

      const img = ctx.getImageData(0, 0, W, H);
      const data = img.data;

      // Mouse en coordenadas de grilla
      const mouseGridX = mousePos.current.x / CELL;
      const mouseGridY = mousePos.current.y / CELL;

      for (let py = 0; py < ROWS; py++) {
        for (let px = 0; px < COLS; px++) {
          
          let threshold = getBayerValue(parseInt(matrixSize), px, py);
          if (usePureNoise) {
            threshold = h21(px, py);
          }
          
          threshold += parseFloat(thresholdBias);

          // Calculate density based on selected mode
          let density = 0;
          if (densityMode === 'noise') {
            const ns = parseFloat(noiseScale);
            density = 
              sn(px * ns + tOffset, py * ns + tOffset) * 0.6 + 
              sn(px * ns * 2.5 - tOffset, py * ns * 2.5 + tOffset) * 0.3 + 
              sn(px * ns * 6, py * ns * 6) * 0.1;
          } else if (densityMode === 'linear-gradient') {
            // Smooth gradient from top to bottom
            density = 1.0 - (py / ROWS);
          } else if (densityMode === 'radial-gradient') {
            // Smooth gradient from mouse position
            const dist = Math.sqrt(Math.pow(px - mouseGridX, 2) + Math.pow(py - mouseGridY, 2));
            const maxDist = Math.max(COLS, ROWS) * 0.6; // Radio del spotlight
            density = Math.max(0, 1.0 - (dist / maxDist));
          }

          const nIntens = parseFloat(noiseIntensity);
          let finalValue;
          if (densityMode === 'noise') {
            finalValue = (density * nIntens) + ((1 - nIntens) * 0.5);
          } else {
            // Agregamos ruido animado para romper el banding y dar efecto vivo
            const microNoise = sn(px * 0.1 + tOffset*2, py * 0.1 + tOffset*2) * 0.1 * nIntens;
            finalValue = density + microNoise;
          }

          if (finalValue > threshold) {
            // Determine color
            let r = 85, g = 255, b = 85; 
            
            if (colorMode === 'colorful') {
              const cn = sn(px * 0.05 + 100 + tOffset, py * 0.05 + 200 + tOffset);
              const ci = Math.floor(cn * 4);
              [r, g, b] = PALETTE[ci] || PALETTE[0];
            } else if (colorMode === 'purple') {
              r = 255; g = 85; b = 255;
            } else if (colorMode === 'white') {
              r = 255; g = 255; b = 255;
            } else if (colorMode === 'gold') {
              r = 255; g = 170; b = 0;
            }

            const t = Math.min(1, Math.max(0, (finalValue - threshold) / (1.0 - threshold + 0.01)));
            const bAlpha = parseInt(baseAlpha);
            const mAlpha = parseInt(maxAlpha);
            const alpha = Math.round(t * (mAlpha - bAlpha) + bAlpha);

            // Draw dot
            for (let dy = 0; dy < DOT; dy++) {
              for (let dx = 0; dx < DOT; dx++) {
                const sx = px * CELL + OFF + dx;
                const sy = py * CELL + OFF + dy;
                if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
                  const i = (sy * W + sx) * 4;
                  const a = alpha / 255;
                  data[i]     = data[i] * (1 - a) + r * a;
                  data[i + 1] = data[i + 1] * (1 - a) + g * a;
                  data[i + 2] = data[i + 2] * (1 - a) + b * a;
                }
              }
            }
          }
        }
      }

      ctx.putImageData(img, 0, 0);

      if (animate) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    // Arrancamos el loop
    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => { 
      cancelAnimationFrame(animationFrameId);
    };
  }, [matrixSize, cellSize, dotSize, noiseScale, noiseIntensity, baseAlpha, maxAlpha, colorMode, usePureNoise, thresholdBias, densityMode, animate]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'monospace' }}>
      
      {/* Background Canvas */}
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Foreground UI to test how it looks behind elements */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          background: 'rgba(18, 18, 30, 0.85)', 
          border: '1px solid #2e2e42', 
          borderRadius: '12px', 
          padding: '40px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 10px 0', letterSpacing: '-1px' }}>SAMPLE CARD</h1>
          <p style={{ color: '#aaa', margin: 0 }}>Así se ve el fondo detrás del contenido.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 20, left: 20,
        width: 320,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(10, 10, 15, 0.95)',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '20px',
        color: '#ccc',
        zIndex: 10,
        pointerEvents: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Dither Lab</h2>
          <button onClick={onBack} style={{ background: '#333', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
        </div>

        <Control label={`Cell Size (${cellSize}px)`}>
          <input type="range" min="1" max="10" value={cellSize} onChange={e => setCellSize(e.target.value)} />
        </Control>

        <Control label={`Dot Size (${dotSize}px)`}>
          <input type="range" min="1" max={cellSize} value={dotSize} onChange={e => setDotSize(e.target.value)} />
        </Control>

        <Control label={`Matrix Size (Bayer ${matrixSize}x${matrixSize})`}>
          <select value={matrixSize} onChange={e => setMatrixSize(e.target.value)} style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #444', padding: '4px' }}>
            <option value="2">2x2</option>
            <option value="4">4x4</option>
            <option value="8">8x8</option>
          </select>
        </Control>

        <Control label="Animación y Reactividad">
          <label style={{ display: 'flex', gap: '8px' }}>
            <input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)} />
            Activar Animación (Mouse & Tiempo)
          </label>
        </Control>

        <Control label="Pattern Type (Threshold)">
          <label style={{ display: 'flex', gap: '8px' }}>
            <input type="checkbox" checked={usePureNoise} onChange={e => setUsePureNoise(e.target.checked)} />
            Usar White Noise en vez de Bayer Matrix
          </label>
        </Control>

        <Control label="Density Mode (Forma del Dither)">
          <select value={densityMode} onChange={e => setDensityMode(e.target.value)} style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #444', padding: '4px' }}>
            <option value="linear-gradient">Linear Gradient (Wash Effect)</option>
            <option value="radial-gradient">Radial Gradient (Spotlight)</option>
            <option value="noise">Organic Noise (Manchas)</option>
          </select>
        </Control>

        <Control label={`Noise Scale (${noiseScale}) - Solo para modo Orgánico`}>
          <input type="range" min="0.005" max="0.15" step="0.005" value={noiseScale} onChange={e => setNoiseScale(e.target.value)} disabled={densityMode !== 'noise'} style={{ opacity: densityMode !== 'noise' ? 0.3 : 1 }}/>
        </Control>

        <Control label={`Noise Intensity (${noiseIntensity})`}>
          <input type="range" min="0.0" max="1.0" step="0.05" value={noiseIntensity} onChange={e => setNoiseIntensity(e.target.value)} />
        </Control>

        <Control label={`Threshold Bias (${thresholdBias})`}>
          <input type="range" min="-0.5" max="0.5" step="0.05" value={thresholdBias} onChange={e => setThresholdBias(e.target.value)} />
        </Control>

        <Control label={`Base Alpha (${baseAlpha})`}>
          <input type="range" min="0" max="255" value={baseAlpha} onChange={e => setBaseAlpha(e.target.value)} />
        </Control>
        
        <Control label={`Max Alpha (${maxAlpha})`}>
          <input type="range" min="0" max="255" value={maxAlpha} onChange={e => setMaxAlpha(e.target.value)} />
        </Control>

        <Control label="Color Mode">
          <select value={colorMode} onChange={e => setColorMode(e.target.value)} style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #444', padding: '4px' }}>
            <option value="colorful">Colorful (Multicolor)</option>
            <option value="green">Green Only</option>
            <option value="purple">Purple Only</option>
            <option value="gold">Gold Only</option>
            <option value="white">White / Monochrome</option>
          </select>
        </Control>

        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#888', borderTop: '1px solid #333', paddingTop: '10px' }}>
          Juega con los sliders. Cuando encuentres la combinación que te gusta, pasame los números (Cell, Dot, Matrix, etc) y lo aplico al Hub real.
        </div>
      </div>
    </div>
  );
}

function Control({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: '#aaa' }}>{label}</label>
      {children}
      <style>{`
        input[type=range] { width: 100%; accent-color: #ff55ff; }
      `}</style>
    </div>
  );
}
