// 📂 src/pages/Roadmap.jsx
import { useState, useMemo, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, updateDoc, setDoc, increment } from 'firebase/firestore';
import './Roadmap.css';

export const Roadmap = () => {
  // DATOS ESTÁTICOS (Estructura)
  const PHASES = [
    {
      title: "Fase 1: Inmersión Atmosférica",
      items: [
        // 🔥 CORRECCIÓN: Cambiado 'done: true' a 'done: false' para habilitar votación
        { id: "feat_01", title: "Indicador de Sueño (ZzZ)", desc: "Partículas visuales sobre jugadores durmiendo.", done: false },
        { id: "feat_02", title: "Sangrado Crítico", desc: "Feedback visual (gotas) con salud baja (< 3 corazones).", done: false },
        { id: "feat_03", title: "Aliento Gélido", desc: "Vapor de respiración visible en biomas helados.", done: false },
      ]
    },
    {
      title: "Fase 2: Entorno Dinámico",
      items: [
        { id: "feat_04", title: "Viento en Altura", desc: "Sonido ambiental y partículas rápidas sobre Y=140.", done: false },
        { id: "feat_05", title: "Huellas Dinámicas", desc: "Partículas temporales en barro, nieve o arena.", done: false },
        { id: "feat_06", title: "Luciérnagas", desc: "Pequeñas partículas de luz ambiental en pantanos de noche.", done: false },
      ]
    }
  ];

  // ESTADOS
  const [votesData, setVotesData] = useState({}); // Votos reales de Firebase
  const [userVotes, setUserVotes] = useState({}); // Votos locales del usuario
  const [processingVotes, setProcessingVotes] = useState({}); // Estado de carga por botón

  // Referencia al documento único de votos
  const VOTES_DOC_REF = doc(db, "roadmap_db", "global_votes");

  // 1. CONEXIÓN A FIREBASE (Tiempo Real)
  useEffect(() => {
    const unsub = onSnapshot(VOTES_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        setVotesData(docSnap.data());
      } else {
        // Si no existe el documento, lo creamos vacío
        setDoc(VOTES_DOC_REF, {}); 
      }
    }, (error) => {
      console.error("Error escuchando votos:", error);
    });

    // Cargar historial local
    const savedLocalVotes = JSON.parse(localStorage.getItem('np_user_votes')) || {};
    setUserVotes(savedLocalVotes);

    return () => unsub();
  }, []);

  // 2. FUNCIÓN DE VOTAR
  const handleVote = async (itemId) => {
    if (processingVotes[itemId]) return; // Evitar doble clic

    // Bloqueamos el botón
    setProcessingVotes(prev => ({ ...prev, [itemId]: true }));

    const isVoted = !!userVotes[itemId];

    try {
      // Actualizar DB (Incremento Atómico)
      await updateDoc(VOTES_DOC_REF, {
        [itemId]: isVoted ? increment(-1) : increment(1)
      });

      // Actualizar Local
      const newUserVotes = { ...userVotes };
      if (isVoted) delete newUserVotes[itemId];
      else newUserVotes[itemId] = true;
      
      setUserVotes(newUserVotes);
      localStorage.setItem('np_user_votes', JSON.stringify(newUserVotes));

    } catch (error) {
      console.error("Error al votar:", error);
      // Si falla porque el documento no existe, intentamos crearlo y reintentar
      if (error.code === 'not-found') {
          await setDoc(VOTES_DOC_REF, { [itemId]: 1 });
      }
    } finally {
      // Desbloqueamos el botón
      setProcessingVotes(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // 3. CÁLCULOS DE PROGRESO
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    PHASES.forEach(phase => {
      phase.items.forEach(item => {
        total++;
        if (item.done) completed++;
      });
    });
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, []);

  return (
    <div className="roadmap-container fade-in">
      
      {/* CABECERA */}
      <div className="module-header" style={{ marginBottom: '25px', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
          <h2 style={{margin:0, color:'var(--accent-gold)', textTransform:'uppercase', letterSpacing:'1px', fontSize: '1.5rem', display:'flex', alignItems:'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'10px'}}>
              <path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/>
            </svg> 
            Votación de Features
          </h2>
          <div className="progress-badge">
            {stats.completed}/{stats.total} Completado
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${stats.percentage}%` }}></div>
        </div>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="roadmap-grid">
        {PHASES.map((phase, index) => (
          <div key={index} className="card type-gold">
            <div className="module-header">
              <h3>{phase.title}</h3>
            </div>

            {phase.items.map((item) => {
              const isVoted = !!userVotes[item.id];
              const isProcessing = !!processingVotes[item.id];
              
              // Evitamos números negativos visualmente
              const currentVotes = Math.max(0, votesData[item.id] || 0);

              return (
                <div key={item.id} className={`roadmap-item ${item.done ? 'done' : ''}`}>
                  <div className="roadmap-text">
                    <h4>{item.title}</h4>
                    <p className="roadmap-desc">{item.desc}</p>
                  </div>
                  
                  <div className="roadmap-actions">
                    {item.done ? (
                      <span className="status-done">✔</span>
                    ) : (
                      <button 
                        className={`vote-btn ${isVoted ? 'voted' : ''}`}
                        onClick={() => handleVote(item.id)}
                        disabled={isProcessing}
                        style={{ opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'wait' : 'pointer' }}
                        title={isVoted ? "Quitar voto" : "Votar por esto"}
                      >
                        <span className="fire-icon">🔥</span>
                        <span className="vote-count">{currentVotes}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};