import { useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import gsap from 'gsap';
import './MinedCube.css';

const MinedCube = forwardRef(({ onCubeClick, faceColor = 'transparent', rippleColor = '#55FFFF' }, ref) => {
  const cubeRef = useRef(null);
  const simRAFRef = useRef(null);

  // Expose triggerRipple so parent card can fire it
  useImperativeHandle(ref, () => ({
    triggerRipple: () => fireRipple(),
  }));

  const fireRipple = useCallback(() => {
    if (!cubeRef.current) return;
    const faces = cubeRef.current.querySelectorAll('.mc-face');
    gsap.to(faces, {
      backgroundColor: rippleColor,
      opacity: 0.85,
      duration: 0.12,
      stagger: 0.04,
      ease: 'power3.out',
      onComplete: () => {
        gsap.to(faces, {
          backgroundColor: faceColor,
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
          onComplete: onCubeClick,
        });
      }
    });
  }, [onCubeClick, rippleColor, faceColor]);

  // Idle rotation driven by GSAP
  useEffect(() => {
    if (!cubeRef.current) return;
    let t = 0;
    const loop = () => {
      t += 0.008;
      if (cubeRef.current) {
        gsap.set(cubeRef.current, {
          rotateX: -20 + Math.sin(t * 0.7) * 5,
          rotateY: t * 40 % 360,
        });
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(simRAFRef.current);
  }, []);

  return (
    <div className="mc-cube-wrapper" onClick={e => { e.stopPropagation(); fireRipple(); }} title="Click para ver bloques minados">
      <div className="mc-cube-scene">
        <div ref={cubeRef} className="mc-cube">
          <div className="mc-face mc-face--front" />
          <div className="mc-face mc-face--back" />
          <div className="mc-face mc-face--right" />
          <div className="mc-face mc-face--left" />
          <div className="mc-face mc-face--top" />
          <div className="mc-face mc-face--bottom" />
        </div>
      </div>
    </div>
  );
});

MinedCube.displayName = 'MinedCube';
export default MinedCube;
