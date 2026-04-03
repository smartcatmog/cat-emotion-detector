import React, { useState } from 'react';

export const PhotoAnimationDemo: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 text-center">猫咪卡通动画演示</h3>
      
      {/* SVG Cartoon Cat Animation */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
      >
        {/* Background */}
        <rect width="200" height="200" fill="#f0f4f8" rx="16" />

        {/* Cat Group - Main Animation */}
        <g
          style={{
            animation: isAnimating ? 'catBounce 3s ease-in-out infinite' : 'none',
          }}
        >
          {/* Head */}
          <circle cx="100" cy="80" r="35" fill="#d4d4d4" />

          {/* Left Ear */}
          <polygon
            points="75,50 65,20 80,45"
            fill="#d4d4d4"
            style={{
              animation: isAnimating ? 'earTwitch 0.4s ease-in-out 0.5s infinite' : 'none',
              transformOrigin: '72px 50px',
            }}
          />

          {/* Right Ear */}
          <polygon
            points="125,50 135,20 120,45"
            fill="#d4d4d4"
            style={{
              animation: isAnimating ? 'earTwitch 0.4s ease-in-out 0.7s infinite' : 'none',
              transformOrigin: '128px 50px',
            }}
          />

          {/* Stripes on head */}
          <path
            d="M 85 70 Q 90 75 85 80"
            stroke="#999"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 115 70 Q 110 75 115 80"
            stroke="#999"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Left Eye */}
          <ellipse cx="85" cy="75" rx="6" ry="10" fill="#d4af37" />
          <ellipse cx="85" cy="75" rx="3" ry="7" fill="#000" />
          <circle cx="86" cy="73" r="1.5" fill="#fff" />

          {/* Right Eye */}
          <ellipse cx="115" cy="75" rx="6" ry="10" fill="#d4af37" />
          <ellipse cx="115" cy="75" rx="3" ry="7" fill="#000" />
          <circle cx="116" cy="73" r="1.5" fill="#fff" />

          {/* Nose */}
          <polygon points="100,90 97,95 103,95" fill="#ffb6c1" />

          {/* Mouth */}
          <path
            d="M 100 95 Q 95 98 92 96"
            stroke="#999"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 100 95 Q 105 98 108 96"
            stroke="#999"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <line x1="60" y1="80" x2="75" y2="78" stroke="#999" strokeWidth="1" />
          <line x1="60" y1="85" x2="75" y2="85" stroke="#999" strokeWidth="1" />
          <line x1="60" y1="90" x2="75" y2="92" stroke="#999" strokeWidth="1" />
          <line x1="140" y1="80" x2="125" y2="78" stroke="#999" strokeWidth="1" />
          <line x1="140" y1="85" x2="125" y2="85" stroke="#999" strokeWidth="1" />
          <line x1="140" y1="90" x2="125" y2="92" stroke="#999" strokeWidth="1" />

          {/* Body */}
          <ellipse cx="100" cy="130" rx="28" ry="35" fill="#d4d4d4" />

          {/* Body Stripes */}
          <path
            d="M 80 115 Q 85 125 80 135"
            stroke="#999"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 120 115 Q 115 125 120 135"
            stroke="#999"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Tail */}
          <path
            d="M 125 145 Q 150 140 155 110"
            stroke="#d4d4d4"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            style={{
              animation: isAnimating ? 'tailWag 0.5s ease-in-out 0.3s infinite' : 'none',
              transformOrigin: '125px 145px',
            }}
          />
          <path
            d="M 125 145 Q 150 140 155 110"
            stroke="#999"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 4"
            style={{
              animation: isAnimating ? 'tailWag 0.5s ease-in-out 0.3s infinite' : 'none',
              transformOrigin: '125px 145px',
            }}
          />

          {/* Front Left Paw */}
          <ellipse cx="80" cy="160" rx="8" ry="12" fill="#d4d4d4" />
          <circle cx="80" cy="172" r="6" fill="#d4d4d4" />

          {/* Front Right Paw */}
          <ellipse cx="120" cy="160" rx="8" ry="12" fill="#d4d4d4" />
          <circle cx="120" cy="172" r="6" fill="#d4d4d4" />
        </g>

        {/* Blink Animation - Eyes */}
        <g
          style={{
            animation: isAnimating ? 'blink 3s ease-in-out infinite' : 'none',
          }}
        >
          <line x1="80" y1="75" x2="90" y2="75" stroke="#d4d4d4" strokeWidth="12" />
          <line x1="110" y1="75" x2="120" y2="75" stroke="#d4d4d4" strokeWidth="12" />
        </g>
      </svg>

      {/* Animation Styles */}
      <style>{`
        @keyframes catBounce {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(0);
          }
        }

        @keyframes tailWag {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(25deg);
          }
        }

        @keyframes earTwitch {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-8deg);
          }
        }

        @keyframes blink {
          0%, 10%, 20%, 100% {
            opacity: 1;
          }
          5%, 15% {
            opacity: 0;
          }
          50%, 60%, 70% {
            opacity: 1;
          }
          55%, 65% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
        >
          {isAnimating ? '暂停' : '播放'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          3秒循环动画：跳跃 + 摇尾巴 + 眨眼 + 竖耳朵
        </p>
      </div>
    </div>
  );
};
