import React from 'react';
import './BorderBeam.css';

export const BorderBeam = ({
  duration = 8,
  borderWidth = 2,
  colorFrom = "var(--accent-purple)",
  colorTo = "var(--accent-aqua)",
}) => {
  return (
    <div className="border-beam-container" style={{ "--duration": duration }}>
      <svg className="beam-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
          
          <filter id="energy-glow" x="-20%" y="-20%" width="140%" height="140%">
            {/* Ruido fractal para distorsionar el trazo y crear el rayo */}
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="3" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rayo de Energía (Glow y distorsión) */}
        <rect
          className="beam-rect-energy"
          x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="10"
          fill="none"
          stroke="url(#beam-grad)"
          strokeWidth={borderWidth * 2.5}
          pathLength="100"
          filter="url(#energy-glow)"
        />

        {/* Núcleo del Rayo (Blanco brillante) */}
        <rect
          className="beam-rect-core"
          x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="10"
          fill="none"
          stroke="#ffffff"
          strokeWidth={borderWidth * 0.8}
          pathLength="100"
        />
      </svg>
    </div>
  );
};
