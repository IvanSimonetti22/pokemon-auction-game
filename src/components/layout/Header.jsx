// 📂 src/components/layout/Header.jsx
import { useState } from 'react';
import './Header.css';

export const Header = ({ activeSection, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // LISTA DE ITEMS ACTUALIZADA (AGREGAMOS 'changelog')
  const navItems = [
    { id: 'general', label: 'General' },
    { id: 'map', label: 'Satélite' },
    { id: 'mods', label: 'Mods' },
    { id: 'gallery', label: 'Galería' },
    { id: 'systems', label: 'Sistemas' },
    { id: 'downloads', label: 'Descargas' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'changelog', label: 'BITÁCORA' }
  ];

  const isCompact = activeSection !== 'general';

  // Función auxiliar para navegar y cerrar el menú al mismo tiempo
  const handleNavClick = (id) => {
    onNavigate(id);
    setIsMenuOpen(false); // Cierra el menú al elegir una opción
  };

  return (
    <header className={`main-header ${isCompact ? 'compact' : ''}`}>
      <div className="header-inner">

        {/* LOGO + BOTÓN HAMBURGUESA */}
        <div className="header-top-row">
          <div className="header-branding">
            <h1
              onClick={() => onNavigate('home')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Volver al inicio"
            >
              NODO PERSISTENTE
            </h1>
            <div className="subtitle">Infraestructura Vanilla + • Fabric 1.21.10</div>
          </div>

          {/* Botón Hamburguesa (Solo visible en móvil) */}
          <button
            className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* NAVEGACIÓN (Se muestra si no es móvil O si el menú está abierto) */}
        <nav className={`nav-bar ${isMenuOpen ? 'show-mobile' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
};