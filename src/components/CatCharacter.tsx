import React, { useState, useEffect } from 'react';

interface CatCharacterProps {
  animate?: 'jump' | 'wag' | 'blink' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CatCharacter: React.FC<CatCharacterProps> = ({
  animate = 'idle',
  size = 'md',
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate !== 'idle') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const animationClass = isAnimating
    ? {
        jump: 'animate-jump',
        wag: 'animate-tail-wag',
        blink: 'animate-blink',
        idle: '',
      }[animate]
    : '';

  return (
    <div className={`${sizeMap[size]} ${animationClass} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Body */}
        <circle cx="50" cy="60" r="25" fill="#FF9F5A" />
        
        {/* Head */}
        <circle cx="50" cy="30" r="20" fill="#FF9F5A" />
        
        {/* Ears */}
        <polygon points="35,15 30,0 40,10" fill="#FF9F5A" />
        <polygon points="65,15 70,0 60,10" fill="#FF9F5A" />
        
        {/* Eyes */}
        <circle cx="45" cy="28" r="3" fill="#000" />
        <circle cx="55" cy="28" r="3" fill="#000" />
        
        {/* Nose */}
        <circle cx="50" cy="35" r="2" fill="#FF69B4" />
        
        {/* Mouth */}
        <path d="M 50 35 Q 48 38 45 37" stroke="#000" strokeWidth="1" fill="none" />
        <path d="M 50 35 Q 52 38 55 37" stroke="#000" strokeWidth="1" fill="none" />
        
        {/* Tail */}
        <path
          d="M 70 60 Q 85 50 80 35"
          stroke="#FF9F5A"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={{ transformOrigin: '70px 60px' }}
        />
        
        {/* Paws */}
        <circle cx="40" cy="80" r="4" fill="#FF9F5A" />
        <circle cx="60" cy="80" r="4" fill="#FF9F5A" />
      </svg>
    </div>
  );
};
