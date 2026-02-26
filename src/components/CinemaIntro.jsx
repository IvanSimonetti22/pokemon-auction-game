import React, { useEffect, useState } from 'react';
import './CinemaIntro.css';

const CinemaIntro = ({ onComplete }) => {
    const [phase, setPhase] = useState('entering'); // 'entering' -> 'glitching' -> 'exiting'

    useEffect(() => {
        // Optional glitch sound
        try {
            const glitchAudio = new Audio('/sounds/glitch.wav');
            glitchAudio.volume = 0.4;
            glitchAudio.play().catch(() => { });
        } catch (e) { }

        // Total duration is ~1.5 seconds
        // 0.3s: Start heavy glitch
        const glitchTimer = setTimeout(() => {
            setPhase('glitching');
        }, 300);

        // 1.2s: Start fade out / exit sequence
        const exitTimer = setTimeout(() => {
            setPhase('exiting');
        }, 1200);

        // 1.5s: Unmount component
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 1500);

        return () => {
            clearTimeout(glitchTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`cyber-cinema-intro ${phase === 'exiting' ? 'intro-shut-down' : ''}`}>
            {/* Background static noise */}
            <div className="cyber-noise"></div>

            {/* Grid Lines */}
            <div className="cyber-grid"></div>

            {/* Main Cyber Logo Container */}
            <div className={`cyber-logo-container ${phase === 'glitching' ? 'is-glitching' : ''}`}>
                <h1 className="cyber-title" data-text="SISTEMA CINE ACTIVADO">
                    SISTEMA CINE ACTIVADO
                </h1>
                <div className="cyber-subtitle">CARGANDO DATOS SEMANALES...</div>
            </div>

            {/* Scanline Effect */}
            <div className="cyber-scanline"></div>
        </div>
    );
};

export default CinemaIntro;
