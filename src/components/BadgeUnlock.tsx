import React, { useEffect, useState } from 'react';

interface BadgeUnlockProps {
  badge: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  onComplete?: () => void;
}

export const BadgeUnlock: React.FC<BadgeUnlockProps> = ({ badge, onComplete }) => {
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return { tx, ty, delay: i * 0.05 };
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* Badge */}
      <div
        className="animate-badge-pop relative"
        style={{
          animation: 'badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className={`w-24 h-24 rounded-full ${badge.color} flex items-center justify-center shadow-lg animate-shine`}
          style={{
            background: `linear-gradient(90deg, ${badge.color}, rgba(255,255,255,0.3), ${badge.color})`,
            backgroundSize: '1000px 100%',
            animation: 'shine 1.5s ease-in-out 2',
          }}
        >
          <span className="text-4xl">{badge.icon}</span>
        </div>
        <p className="text-center mt-4 font-bold text-white drop-shadow-lg">
          {badge.name}
        </p>
      </div>

      {/* Particles */}
      {showParticles &&
        particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              animation: `particles 0.8s ease-out forwards`,
              '--tx': `${particle.tx}px`,
              '--ty': `${particle.ty}px`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties}
          />
        ))}
    </div>
  );
};
