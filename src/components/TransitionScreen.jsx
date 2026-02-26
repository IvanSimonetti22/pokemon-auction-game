import React, { useEffect, useState } from 'react';
import './TransitionScreen.css';
const TransitionScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('tunnel'); // tunnel -> slam -> glitch -> exit
    useEffect(() => {
        // 0s - 0.3s: Tunnel (Grid Only)
        // 0.3s: Slam Impact
        const slamTimer = setTimeout(() => {
            setPhase('slam');
        }, 300);
        // 0.6s: Glitch Active
        const glitchTimer = setTimeout(() => {
            setPhase('glitch');
        }, 600);
        // 2.0s: Full Screen Glitch Exit
        const exitTimer = setTimeout(() => {
            setPhase('exit');
        }, 2000);
        // 2.3s: Unmount
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2300);
        return () => {
            clearTimeout(slamTimer);
            clearTimeout(glitchTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);
    return (
        <div className={`hollow-dive-container ${phase === 'exit' ? 'shut-down' : ''}`}>
            {/* 1. LAYER: GRID TUNNEL (Always active until exit) */}
            <div className="grid-tunnel"></div>
            {/* 2. LAYER: LOGO & CONTENT */}
            <div className={`logo-wrapper ${phase === 'slam' ? 'slam-enter' : ''} ${phase === 'glitch' ? 'glitch-active' : ''}`} style={{ opacity: phase === 'tunnel' ? 0 : 1 }}>
                <h1 className="hdd-logo" data-text="CALCULADORA PROXY">
                    CALCULADORA PROXY
                </h1>
            </div>
            {/* 3. LAYER: NOISE OVERLAY (Visible on Exit) */}
            <div className="noise-overlay"></div>
        </div>
    );
};
export default TransitionScreen;
