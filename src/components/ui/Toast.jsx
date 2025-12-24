// 📂 src/components/ui/Toast.jsx
import React from 'react';
import './Toast.css';

export const Toast = ({ active, message = "IP Copiada al portapapeles" }) => {
  return (
    <div className={`toast-container ${active ? 'active' : ''}`}>
      <div className="toast-icon">
        {/* Icono de Check */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
};