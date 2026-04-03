import React from 'react';

interface MedalDropProps {
  rank: number;
  animate?: boolean;
  className?: string;
}

export const MedalDrop: React.FC<MedalDropProps> = ({
  rank,
  animate = true,
  className = '',
}) => {
  const medalColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600',
  };

  const medalColor = medalColors[rank as keyof typeof medalColors] || 'from-blue-400 to-blue-600';

  return (
    <div
      className={`${animate ? 'animate-medal-drop' : ''} ${className}`}
      style={{
        animation: animate ? 'medalDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${medalColor} flex items-center justify-center shadow-lg`}>
        <span className="text-xl font-bold text-white">#{rank}</span>
      </div>
    </div>
  );
};
