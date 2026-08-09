import React, { useState, useRef, useEffect } from 'react';
import './BeforeAfterSlider.css';

export const BeforeAfterSlider = ({ beforeImage, afterImage, alt = 'Comparativa' }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate raw X relative to container
        let x = clientX - rect.left;
        // Clamp x to container bounds
        x = Math.max(0, Math.min(x, rect.width));
        // Convert to percentage
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection
        handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        // Don't prevent default here as it blocks scrolling entirely, 
        // but if dragging the slider, we want to slide instead of scroll.
        if (e.cancelable) e.preventDefault();
        handleMove(e.touches[0].clientX);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove, { passive: false });
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div 
            className="before-after-container" 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* Imagen AFTER (Fondo - Con Shaders) */}
            <img 
                src={afterImage} 
                alt={`Con Shaders - ${alt}`} 
                className="ba-img ba-after" 
                draggable="false" 
            />
            
            {/* Imagen BEFORE (Arriba - Sin Shaders - Recortada) */}
            <img 
                src={beforeImage} 
                alt={`Sin Shaders - ${alt}`} 
                className="ba-img ba-before" 
                draggable="false"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            />

            {/* Línea divisoria interactiva */}
            <div className="ba-slider-line" style={{ left: `${sliderPosition}%` }}>
                <div className="ba-slider-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>

            {/* Etiquetas informativas */}
            <div className="ba-label ba-label-left">SIN SHADERS</div>
            <div className="ba-label ba-label-right">CON SHADERS</div>
        </div>
    );
};
