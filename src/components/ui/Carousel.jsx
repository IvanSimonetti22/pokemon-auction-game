// 📂 src/components/ui/Carousel.jsx
import { useState, useEffect } from 'react';
import './Carousel.css';

export const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- LÓGICA DE NAVEGACIÓN ---
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // --- AUTOPLAY (Cada 5 segundos) ---
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    // Limpiamos el reloj si el usuario cambia de foto manualmente o sale de la página
    return () => clearInterval(timer);
  }, [currentIndex]); // Se reinicia cada vez que cambia el índice

  // --- FUNCIONES DE HERRAMIENTAS ---
  const downloadImage = () => {
    if (!images || images.length === 0) return;
    const currentImg = images[currentIndex];
    
    const link = document.createElement('a');
    link.href = currentImg.src;
    // Nombre del archivo sugerido al descargar
    link.download = `Nodo_Screenshot_${currentIndex + 1}.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    const element = document.getElementById('carousel-wrapper');
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error al intentar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Protección por si no llegan imágenes
  if (!images || images.length === 0) {
    return (
      <div className="carousel-container" style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>
        Sin imágenes para mostrar
      </div>
    );
  }

  return (
    // ID necesario para que funcione la pantalla completa
    <div className="carousel-container" id="carousel-wrapper">
      
      {/* --- BARRA DE HERRAMIENTAS (Botones SVG) --- */}
      <div className="carousel-toolbar">
        <button onClick={downloadImage} title="Descargar Imagen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>

        <button onClick={toggleFullscreen} title="Pantalla Completa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>

      {/* --- DIAPOSITIVAS --- */}
      {images.map((img, index) => (
        <div 
          key={index} 
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url("${img.src}")` }}
        >
          <div className="carousel-caption">
            <h3>{img.title}</h3>
          </div>
        </div>
      ))}

      {/* --- BOTONES FLECHA --- */}
      <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
      <button className="carousel-btn next" onClick={nextSlide}>❯</button>

      {/* --- PUNTITOS INDICADORES --- */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>

    </div>
  );
};