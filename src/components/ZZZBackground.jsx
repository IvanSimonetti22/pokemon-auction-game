import React from 'react';
const ZZZBackground = () => {
    const bgStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'var(--zzz-black)',
        zIndex: 0,
        overflow: 'hidden',
    };
    const patternStyle = {
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        backgroundImage: `repeating-linear-gradient(
            -45deg,
            #111111,
            #111111 20px,
            #1a1a1a 20px,
            #1a1a1a 40px
        )`,
        /* Animación de desplazamiento infinito (Caution Tape) */
        animation: 'moveTapes 2s linear infinite',
    };
    const noiseStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.15,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
    };
    return (
        <div style={bgStyle}>
            <style>{`
                @keyframes moveTapes {
                    0% { background-position: 0 0; }
                    100% { background-position: 56.57px 0; } /* 40px / sin(45deg) ≈ 56.57px */
                }
            `}</style>
            <div style={patternStyle}></div>
            {/* Capa de Ruido (TV Texture) */}
            <div style={noiseStyle}></div>
            {/* Viñeta para oscurecer bordes */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, transparent 40%, black 100%)',
                pointerEvents: 'none'
            }}></div>
        </div>
    );
};
export default ZZZBackground;
