import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react';

const ShinyText = ({
  text,
  disabled = false,
  speed = 3,
  className = '',
  color = '#e0e0e0',
  shineColor = '#ffffff',
  spread = 120,
  delay = 0
}) => {
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame(time => {
    if (disabled) return;
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;

    const cycleDuration = animDuration + delayDuration;
    const cycleTime = elapsedRef.current % cycleDuration;
    const p = cycleTime < animDuration ? (cycleTime / animDuration) * 100 : 100;
    progress.set(p);
  });

  // Shine sweeps left → right: at p=0 it's off-screen right, at p=100 off-screen left
  const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        backgroundPosition,
      }}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
