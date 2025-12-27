import React, { useEffect, useRef } from 'react';
import './LandingPage.css';

export const LandingPage = ({ onNavigate }) => {

    const audioRefs = useRef({});

    useEffect(() => {
        // Preload sounds
        const sounds = {
            minecraft: '/sounds/minecraft_click.mp3',
            pokemon: '/sounds/Boton_A.mp3'
        };

        Object.entries(sounds).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto'; // Force preload
            audio.volume = 0.5;
            audioRefs.current[key] = audio;
        });
    }, []);

    const playSound = (key) => {
        try {
            const audio = audioRefs.current[key];
            if (audio) {
                // 🔥 HACK: Adelantamos el audio de Minecraft porque tiene silencio al inicio
                const startTime = key === 'minecraft' ? 0.5 : 0;
                audio.currentTime = startTime;
                audio.play().catch(e => console.warn("Audio play failed", e));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleNav = (target, soundKey) => {
        playSound(soundKey);
        // Small delay to let sound start before unmounting (optional but recommended)
        setTimeout(() => onNavigate(target), 50);
    };

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
                    onClick={() => handleNav('general', 'minecraft')}
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
                    onClick={() => handleNav('pokemon_auction', 'pokemon')}
                    role="button"
                    tabIndex={0}
                >
                    <div className="card-content">
                        {/* PURE CSS POKEBALL */}
                        <div className="poke-ball-css"></div>
                        <h2 className="card-title">Pokémon</h2>
                        <p className="card-desc">
                            Subasta en vivo, Gestión de equipo, Mochila y Batallas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
