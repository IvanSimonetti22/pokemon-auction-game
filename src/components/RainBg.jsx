import React from 'react';
import './RainBg.css';

export default function RainBg() {
  return (
    <div className="rain-bg-wrapper" aria-hidden="true">
      <div className="rain-bg-glow glow-1" />
      <div className="rain-bg-glow glow-2" />
      <div className="rain-bg-container" />
    </div>
  );
}
