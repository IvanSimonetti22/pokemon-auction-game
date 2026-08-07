import { useState, useEffect, useRef } from 'react';
import './CyclicTitle.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?[]{}|<>';

const EFFECTS = ['default', 'halftone', 'crt', 'ascii', 'glitch', 'neon', 'vhs'];

function scramble(text, revealedCount) {
  return text.split('').map((char, i) => {
    if (char === ' ') return ' ';
    if (i < revealedCount) return char;
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }).join('');
}

const CyclicTitle = ({ text, className = '' }) => {
  const [effectIdx, setEffectIdx] = useState(0);
  const [display, setDisplay] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const rafRef = useRef(null);
  const nextEffectRef = useRef(1);

  useEffect(() => {
    let intervalId;

    const runTransition = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsScrambling(true);

      const startTime = performance.now();
      const scrambleDur = 320;  // ms fully scrambled
      const revealDur  = 350;   // ms to reveal left→right
      const total = scrambleDur + revealDur;

      const loop = (now) => {
        const elapsed = now - startTime;

        if (elapsed < scrambleDur) {
          // Phase 1: full scramble
          setDisplay(scramble(text, 0));
        } else {
          // Phase 2: reveal progressively
          const t = Math.min((elapsed - scrambleDur) / revealDur, 1);
          // Ease-out the reveal
          const eased = 1 - Math.pow(1 - t, 2);
          const revealed = Math.floor(eased * text.length);
          setDisplay(scramble(text, revealed));

          if (t >= 1) {
            setDisplay(text);
            setIsScrambling(false);
            // Switch to next effect exactly when the real text is shown
            setEffectIdx(nextEffectRef.current);
            nextEffectRef.current = (nextEffectRef.current + 1) % EFFECTS.length;
            return;
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    };

    // First transition after 2s, then every 2.5s
    const firstTimeout = setTimeout(() => {
      runTransition();
      intervalId = setInterval(runTransition, 6000);
    }, 6000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(intervalId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text]);

  const effect = EFFECTS[effectIdx];

  return (
    <span
      className={`cyclic-title cyclic-title--${effect} ${isScrambling ? 'cyclic-title--scrambling' : ''} ${className}`}
      data-text={display}
      aria-label={text}
    >
      {display}
    </span>
  );
};

export default CyclicTitle;
