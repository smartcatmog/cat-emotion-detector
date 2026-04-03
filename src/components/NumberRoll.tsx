import React, { useEffect, useState } from 'react';

interface NumberRollProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

export const NumberRoll: React.FC<NumberRollProps> = ({
  from,
  to,
  duration = 800,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    const startTime = Date.now();
    const diff = to - from;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + diff * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
};
