import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './WireSword.css';

export default function WireSword({ color = '#f87171', size = 80 }) {
  const swordRef = useRef(null);

  useEffect(() => {
    const el = swordRef.current;
    if (!el) return;

    // Slow Y-axis spin + tilt
    gsap.to(el, {
      rotateY: 360,
      duration: 6,
      repeat: -1,
      ease: 'none',
    });

    // Subtle swing on X
    gsap.to(el, {
      rotateX: 15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Float up/down
    gsap.to(el.parentElement, {
      y: -6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => gsap.killTweensOf([el, el.parentElement]);
  }, []);

  return (
    <div className="wire-sword-wrap" style={{ '--s': `${size}px`, '--c': color }}>
      <div className="wire-sword" ref={swordRef}>
        {/* Blade */}
        <div className="ws-blade-left" />
        <div className="ws-blade-right" />
        <div className="ws-blade-tip" />

        {/* Crossguard */}
        <div className="ws-guard" />
        <div className="ws-guard-depth" />

        {/* Handle */}
        <div className="ws-handle-left" />
        <div className="ws-handle-right" />

        {/* Pommel */}
        <div className="ws-pommel" />
      </div>
    </div>
  );
}
