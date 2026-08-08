// 📂 src/components/widgets/ThemeToggle.jsx
import './ThemeToggle.css';

export const ThemeToggle = ({ onThemeChange }) => {
  return (
    <div className="theme-widget">
      <div className="theme-toggle-btn" title="Cambiar Dimensión">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="theme-options">
        <button 
          className="theme-opt opt-overworld" 
          onClick={() => onThemeChange('overworld')} 
          data-tooltip="OVERWORLD_NODE"
        >
          OVR
        </button>

        <button 
          className="theme-opt opt-nether" 
          onClick={() => onThemeChange('nether')} 
          data-tooltip="NETHER_NODE"
        >
          NTH
        </button>

        <button 
          className="theme-opt opt-end" 
          onClick={() => onThemeChange('end')} 
          data-tooltip="END_NODE"
        >
          END
        </button>
      </div>
    </div>
  );
};