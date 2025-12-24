// 📂 src/components/widgets/ThemeToggle.jsx
import './ThemeToggle.css';

export const ThemeToggle = ({ onThemeChange }) => {
  return (
    <div className="theme-widget">
      <div className="theme-toggle-btn" title="Cambiar Dimensión">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      </div>

      <div className="theme-options">
        <button 
          className="theme-opt" 
          onClick={() => onThemeChange('overworld')} 
          style={{background:'#4CAF50', color:'#fff'}}
          data-tooltip="Overworld"  /* <--- ESTO ES LO QUE LEE EL CSS */
        >
          🌿
        </button>

        <button 
          className="theme-opt" 
          onClick={() => onThemeChange('nether')} 
          style={{background:'#8B0000', color:'#fff'}}
          data-tooltip="Nether"
        >
          🔥
        </button>

        <button 
          className="theme-opt" 
          onClick={() => onThemeChange('end')} 
          style={{background:'#4B0082', color:'#fff'}}
          data-tooltip="The End"
        >
          🔮
        </button>
      </div>
    </div>
  );
};