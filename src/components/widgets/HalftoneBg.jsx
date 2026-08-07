import React from 'react';

const HalftoneBg = ({
  inkColor = '#141414',
  paperColor = '#1a1a1a',
  pixelSize = 14
}) => {
  // Ajustamos el tamaño del punto para que sea sutil y elegante
  const dotRadius = pixelSize * 0.12; 
  const halfSize = pixelSize / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundColor: paperColor,
        // Patrón entrelazado (hexagonal offset) usando CSS gradients
        backgroundImage: `
          radial-gradient(circle at center, ${inkColor} ${dotRadius}px, transparent ${dotRadius + 0.5}px),
          radial-gradient(circle at center, ${inkColor} ${dotRadius}px, transparent ${dotRadius + 0.5}px)
        `,
        backgroundSize: `${pixelSize}px ${pixelSize}px`,
        backgroundPosition: `0 0, ${halfSize}px ${halfSize}px`,
        pointerEvents: 'none',
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Máscara de gradiente oscuro para darle profundidad y oscurecer el fondo para los textos */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,12,0.4) 0%, rgba(10,10,12,0.95) 100%)',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
};

export default HalftoneBg;
