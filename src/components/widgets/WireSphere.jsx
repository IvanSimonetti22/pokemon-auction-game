import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './WireSphere.css';

export default function WireSphere({ color = '#a78bfa', size = 80, speed = 8 }) {
  const groupRef = useRef(null);

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;

    // Continuous dual-axis rotation
    gsap.to(el, {
      rotateY: 360,
      duration: speed,
      repeat: -1,
      ease: 'none',
    });

    gsap.to(el, {
      rotateX: 20,
      duration: speed * 1.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Subtle float
    gsap.to(el.parentElement, {
      y: -6,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => gsap.killTweensOf([el, el.parentElement]);
  }, [speed]);

  // 7 rings at different tilt angles to approximate a sphere
  const angles = [0, 26, 51, 77, 103, 129, 154];

  return (
    <div className="wire-sphere-wrap" style={{ '--s': `${size}px`, '--c': color }}>
      <div className="wire-sphere-group" ref={groupRef}>
        {angles.map((angle, i) => (
          <div
            key={i}
            className="wire-ring"
            style={{ transform: `rotateY(${angle}deg)` }}
          />
        ))}
        {/* Equatorial latitude rings */}
        <div className="wire-ring wire-ring--lat" style={{ transform: 'rotateX(90deg) translateZ(0px) scale(1)' }} />
        <div className="wire-ring wire-ring--lat" style={{ transform: 'rotateX(90deg) translateZ(0px) scale(0.71)' }} />
      </div>
    </div>
  );
}
