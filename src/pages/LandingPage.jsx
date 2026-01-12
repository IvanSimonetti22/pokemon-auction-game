import React, { useState } from 'react';
import './LandingPage.css';
export const LandingPage = ({ onNavigate }) => {
    const [showHytaleModal, setShowHytaleModal] = useState(false);
    return (
        <div className="landing-container">
            {/* Título Decorado */}
            <div className="landing-title-wrapper">
                <h1 className="landing-title">
                    <span>NODO</span> <span>PERSISTENTE</span>
                </h1>
                <div className="title-decoration-line"></div>
            </div>
            {/* Grid de Tarjetas */}
            <div className="cards-wrapper">
                {/* TARJETA MINECRAFT */}
                <div
                    className="landing-card minecraft"
                    onClick={() => onNavigate('general')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="card-content">
                        <div className="card-icon-box">
                            ⛏️
                        </div>
                        <h2 className="card-title">Minecraft</h2>
                        <p className="card-desc">
                            Survival, Mods, Mapas interactivos, Sistemas y Galería.
                        </p>
                    </div>
                </div>
                {/* TARJETA POKÉMON */}
                <div
                    className="landing-card pokemon"
                    onClick={() => onNavigate('pokemon_auction')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="card-content">
                        <div className="poke-ball-css"></div>
                        <h2 className="card-title">Pokémon</h2>
                        <p className="card-desc">
                            Subasta en vivo, Gestión de equipo, Mochila y Batallas.
                        </p>
                    </div>
                </div>
                {/* --- NUEVA TARJETA 1: HYTALE (Work In Progress) --- */}
                <div
                    className="landing-card hytale-card"
                    onClick={() => setShowHytaleModal(true)}
                    role="button"
                    tabIndex={0}
                >
                    <div className="card-content">
                        <div className="card-icon-box">⚔️</div>
                        <h2 className="card-title">HYTALE SERVER</h2>
                        <p className="card-desc">Próximamente - 13 de Enero</p>
                        <div className="status-badge warning">EN DESARROLLO</div>
                    </div>
                </div>
                {/* --- NUEVA TARJETA 2: ZZZ (Zenless Zone Zero) --- */}
                <div
                    className="landing-card zzz-card"
                    onClick={() => onNavigate('zzz')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="card-content">
                        <div className="card-icon-box">📺</div>
                        <h2 className="card-title">ZZZ CALCULADORA</h2>
                        <p className="card-desc">Calculadora de Tiradas y Probabilidades</p>
                        <div className="status-badge new">NUEVO</div>
                    </div>
                </div>
            </div>
            {/* --- HYTALE POPUP MODAL --- */}
            {showHytaleModal && (
                <div className="modal-overlay" onClick={() => setShowHytaleModal(false)}>
                    <div className="modal-content hytale-theme" onClick={(e) => e.stopPropagation()}>
                        <div className="card-icon-box" style={{ fontSize: '3rem', marginBottom: '10px' }}>⚔️</div>
                        <h2 className="modal-title">Proyecto Hytale</h2>
                        <p className="modal-text">
                            Estoy preparando el servidor oficial. <br />
                            ¡Estará disponible este <strong>13 de Enero</strong>!
                        </p>
                        <button className="modal-close-btn" onClick={() => setShowHytaleModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
