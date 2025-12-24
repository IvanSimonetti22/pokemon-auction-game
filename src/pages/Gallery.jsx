// 📂 src/pages/Gallery.jsx
import { Carousel } from '../components/ui/Carousel';

export const Gallery = () => {
  // 📝 IMPORTANTE: Aquí registramos cada foto manualmente.
  // El "src" debe coincidir EXACTAMENTE con el nombre del archivo en public/screenshots
  const GALLERY_IMAGES = [
    { src: "/screenshots/foto1.png", title: "Punto de Partida" },
    { src: "/screenshots/foto2.png", title: "Casa de Mark (en costrucción)" },
    { src: "/screenshots/foto3.png", title: "Granja de Endermans" },
    { src: "/screenshots/foto 4.jpg", title: "El Portal" }, 
    { src: "/screenshots/foto 5.jpg", title: "Casa de Mark (Terminada)" },
    { src: "/screenshots/foto 6.png", title: "Atardecer en lo de Toddy" },
    { src: "/screenshots/foto 7.png", title: "Valle Escondido" },
    { src: "/screenshots/foto 8.png", title: "Cumbres Borrascosas" },
    { src: "/screenshots/foto 9.png", title: "Isla del End" },
    { src: "/screenshots/foto 10.png", title: "Granja de Endermans II" },
    { src: "/screenshots/foto 11.png", title: "Granja de Hierro" },
  ];

  return (
    <div className="gallery-container fade-in">
      <div className="card type-gold" style={{ padding: '20px', borderLeft: '4px solid #FFAA00', background: 'rgba(30,30,30,0.8)' }}>
        <div className="module-header" style={{marginBottom: '10px'}}>
          <h3 style={{margin:0, color:'#e0e0e0'}}>📸 Galería de Momentos</h3>
        </div>
        
        {/* El carrusel recibirá ahora las 11 fotos */}
        <Carousel images={GALLERY_IMAGES} />
        
        <p style={{textAlign:'center', color:'#666', fontSize:'0.8rem', marginTop:'10px'}}>
          Capturas tomadas por Navi, se agregan las mejores que vea en el DS.
        </p>
      </div>
    </div>
  );
};