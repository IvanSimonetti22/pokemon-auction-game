// 📂 src/components/ui/Cards.jsx
import React from 'react';
import './Cards.css'; // Crearemos este CSS en el siguiente paso

// Componente 1: Tarjeta de Estadística Pequeña
export const StatCard = ({ label, value, icon, color, onClick }) => {
  return (
    <div className="stat-card" onClick={onClick} style={{ borderColor: color ? `${color}33` : '' }}>
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
  return (
    <div 
      className="action-card-btn" 
      onClick={onClick}
      style={{ borderColor: color }}
    >
      <h3 style={{ color: color }}>
        {icon} {title}
      </h3>
      <p>{description}</p>
    </div>
  );
};