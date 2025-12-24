// 📂 src/pages/Mods.jsx
import './Mods.css'; // CSS simple para listas

export const Mods = () => {
  // DATOS: Definimos la información separada del diseño
  const REQUIRED_MODS = [
    { name: "Fabric API", version: "0.91.0", important: true },
    { name: "Sodium", version: "0.5.3", important: true },
    { name: "Lithium", version: "0.11.2", important: true },
    { name: "InventorySorter", version: "2.1.0", important: false },
    { name: "Skin Overrides", version: "2.4.0", important: false },
  ];

  const OPTIONAL_MODS = [
    { name: "Iris Shaders", desc: "Sombras realistas" },
    { name: "Distant Horizons", desc: "LOD Extremo" },
    { name: "Litematica", desc: "Esquemas técnicos" },
    { name: "BlueMap", desc: "Mapa Web integración" },
  ];

  // Componente interno para renderizar una fila (Solo existe dentro de este archivo)
  const ModItem = ({ name, version, desc, color }) => (
    <div className="list-item">
      <div>
        <span style={{ color: color, marginRight: '8px' }}>●</span>
        <span className="item-name">{name}</span>
      </div>
      {version && <span className="item-version">{version}</span>}
      {desc && <span className="item-desc">{desc}</span>}
    </div>
  );

  return (
    <div className="mods-container fade-in">
      <div className="mods-grid">
        
        {/* Tarjeta Verde: Obligatorios */}
        <div className="card type-green">
          <div className="module-header">
            <h3>Mods Oficiales (Base)</h3>
            <span className="module-tag tag-ok">REQUERIDOS</span>
          </div>
          <div className="list-container">
            {REQUIRED_MODS.map((mod, index) => (
              <ModItem 
                key={index} 
                name={mod.name} 
                version={mod.version} 
                color="#55FF55" 
              />
            ))}
          </div>
        </div>

        {/* Tarjeta Dorada: Opcionales */}
        <div className="card type-gold">
          <div className="module-header">
            <h3>Mods Opcionales (Visual)</h3>
            <span className="module-tag tag-opt">RECOMENDADOS</span>
          </div>
          <div className="list-container">
            {OPTIONAL_MODS.map((mod, index) => (
              <ModItem 
                key={index} 
                name={mod.name} 
                desc={mod.desc} 
                color="#FFAA00" 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};