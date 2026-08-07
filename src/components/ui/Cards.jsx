// 📂 src/components/ui/Cards.jsx
import React, { useRef, useState } from 'react';
import './Cards.css';

// Componente 1: Tarjeta de Estadística Pequeña
export const StatCard = ({ label, value, icon, color, onClick }) => {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      className="stat-card" 
      onClick={onClick} 
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{ 
        '--x': `${pos.x}px`, 
        '--y': `${pos.y}px`,
        '--card-color': color || 'var(--accent-gold)'
      }}
    >
      <div className="stat-icon" style={{ color: color || '#FFAA00' }}>
        {icon}
      </div>
      <div className="stat-data">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
};

// Componente 2: Botón de Acción Grande
export const ActionCard = ({ title, description, icon, color, onClick }) => {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      className="action-card-btn" 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{ 
        '--x': `${pos.x}px`, 
        '--y': `${pos.y}px`,
        '--card-color': color || '#55FFFF'
      }}
    >
      <h3 style={{ color: color }}>
        {icon} {title}
      </h3>
      <p>{description}</p>
    </div>
  );
};