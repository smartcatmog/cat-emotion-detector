import React, { useState } from 'react';

// Demo cat image (using a data URL for the example)
const DEMO_CAT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%22200%22 y=%22200%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E🐱%3C/text%3E%3C/svg%3E';

interface PhotoAnimationDemoProps {
  imageUrl?: string;
}

export const PhotoAnimationDemo: React.FC<PhotoAnimationDemoProps> = ({ imageUrl = DEMO_CAT_IMAGE }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationType, setAnimationType] = useState<'bounce' | 'spin' | 'pulse' | 'tilt'>('bounce');

  const animationClasses = {
    bounce: 'animate-photo-bounce',
    spin: 'animate-photo-spin',
    pulse: 'animate-photo-pulse',
    tilt: 'animate-photo-tilt',
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 text-center">照片动画化演示</h3>
      
      {/* Photo Animation Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg">
        {/* Background blur effect */}
        <div className="absolute inset-0 backdrop-blur-sm" />
        
        {/* Animated Photo */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isAnimating ? animationClasses[animationType] : ''
          }`}
          style={{
            animation: isAnimating ? undefined : 'none',
          }}
        >
          <img
            src={imageUrl}
            alt="Animated cat"
            className="w-4/5 h-4/5 object-cover rounded-xl shadow-xl"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
            }}
          />
        </div>

        {/* Floating particles */}
        {isAnimating && (
          <>
            <div className="absolute top-10 left-10 text-2xl animate-float" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute top-20 right-12 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>💫</div>
            <div className="absolute bottom-16 left-1/4 text-2xl animate-float" style={{ animationDelay: '1s' }}>⭐</div>
            <div className="absolute bottom-10 right-1/4 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>✨</div>
          </>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes photoFloat {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-60px);
            opacity: 0;
          }
        }

        @keyframes photoBounce {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(1.05) translateY(-15px);
          }
          50% {
            transform: scale(1) translateY(0);
          }
          75% {
            transform: scale(0.98) translateY(5px);
          }
        }

        @keyframes photoSpin {
          0% {
            transform: rotateZ(0deg) scale(1);
          }
          50% {
            transform: rotateZ(5deg) scale(1.02);
          }
          100% {
            transform: rotateZ(0deg) scale(1);
          }
        }

        @keyframes photoPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.08);
            filter: brightness(1.1);
          }
        }

        @keyframes photoTilt {
          0%, 100% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: rotateX(-5deg) rotateY(8deg);
          }
          50% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          75% {
            transform: rotateX(5deg) rotateY(-8deg);
          }
        }

        .animate-photo-bounce {
          animation: photoBounce 3s ease-in-out infinite;
        }

        .animate-photo-spin {
          animation: photoSpin 3s ease-in-out infinite;
        }

        .animate-photo-pulse {
          animation: photoPulse 3s ease-in-out infinite;
        }

        .animate-photo-tilt {
          animation: photoTilt 3s ease-in-out infinite;
          perspective: 1000px;
        }

        .animate-float {
          animation: photoFloat 3s ease-in infinite;
        }
      `}</style>

      {/* Controls */}
      <div className="mt-6 space-y-4">
        <div className="flex gap-2 flex-wrap justify-center">
          {(['bounce', 'spin', 'pulse', 'tilt'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnimationType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                animationType === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {type === 'bounce' && '🎪 跳跃'}
              {type === 'spin' && '🌀 旋转'}
              {type === 'pulse' && '💥 脉冲'}
              {type === 'tilt' && '🎭 倾斜'}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            {isAnimating ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            3秒循环动画 + 浮动粒子效果
          </p>
        </div>
      </div>
    </div>
  );
};
