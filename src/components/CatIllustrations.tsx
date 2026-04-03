import React from 'react';

// Sleepy Cat (困困猫)
export const SleepyCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="sleepyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFE5B4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFCC99', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="120" rx="50" ry="55" fill="url(#sleepyGrad)" />
    {/* Head */}
    <circle cx="100" cy="70" r="40" fill="url(#sleepyGrad)" />
    {/* Ears */}
    <polygon points="75,35 65,10 80,25" fill="url(#sleepyGrad)" />
    <polygon points="125,35 135,10 120,25" fill="url(#sleepyGrad)" />
    {/* Inner ears */}
    <polygon points="75,35 70,20 78,28" fill="#FFB380" />
    <polygon points="125,35 130,20 122,28" fill="#FFB380" />
    {/* Eyes closed (sleeping) */}
    <path d="M 85 65 Q 85 70 90 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 110 65 Q 110 70 115 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Nose */}
    <circle cx="100" cy="80" r="3" fill="#FF69B4" />
    {/* Mouth (peaceful) */}
    <path d="M 100 80 Q 95 85 90 83" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 100 80 Q 105 85 110 83" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Front paws */}
    <ellipse cx="80" cy="160" rx="12" ry="20" fill="url(#sleepyGrad)" />
    <ellipse cx="120" cy="160" rx="12" ry="20" fill="url(#sleepyGrad)" />
    {/* Tail */}
    <path d="M 140 110 Q 160 100 155 130" stroke="url(#sleepyGrad)" strokeWidth="15" fill="none" strokeLinecap="round" />
    {/* Z's (sleeping) */}
    <text x="160" y="40" fontSize="20" fill="#FFB380" opacity="0.7">Z</text>
    <text x="170" y="55" fontSize="16" fill="#FFB380" opacity="0.5">z</text>
  </svg>
);

// Hiding Cat (躲柜子猫)
export const HidingCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="hidingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D4A5FF', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#B88FFF', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Curled up body */}
    <circle cx="100" cy="110" r="45" fill="url(#hidingGrad)" />
    {/* Head tucked in */}
    <circle cx="85" cy="75" r="35" fill="url(#hidingGrad)" />
    {/* Ears hidden */}
    <polygon points="70,50 60,35 75,45" fill="url(#hidingGrad)" opacity="0.6" />
    {/* Eyes peeking (worried) */}
    <circle cx="80" cy="70" r="4" fill="#333" />
    <circle cx="90" cy="72" r="4" fill="#333" />
    {/* Eyebrows (worried) */}
    <path d="M 75 65 Q 80 62 85 65" stroke="#333" strokeWidth="1.5" fill="none" />
    <path d="M 90 67 Q 95 64 100 67" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="85" cy="80" r="2.5" fill="#FF69B4" />
    {/* Mouth (worried) */}
    <path d="M 85 85 Q 85 88 82 87" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Tail wrapped around */}
    <path d="M 130 100 Q 150 90 145 120 Q 140 140 120 135" stroke="url(#hidingGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
    {/* Paws tucked in */}
    <ellipse cx="75" cy="140" rx="10" ry="15" fill="url(#hidingGrad)" />
    <ellipse cx="105" cy="145" rx="10" ry="15" fill="url(#hidingGrad)" />
  </svg>
);

// Spiky Cat (炸毛猫)
export const SpikyCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="spikyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FF5252', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="120" rx="45" ry="50" fill="url(#spikyGrad)" />
    {/* Head */}
    <circle cx="100" cy="65" r="38" fill="url(#spikyGrad)" />
    {/* Spiky fur (angry) */}
    <polygon points="60,40 50,20 65,35" fill="url(#spikyGrad)" />
    <polygon points="100,30 95,5 105,25" fill="url(#spikyGrad)" />
    <polygon points="140,40 150,20 135,35" fill="url(#spikyGrad)" />
    <polygon points="50,70 25,65 45,75" fill="url(#spikyGrad)" />
    <polygon points="150,70 175,65 155,75" fill="url(#spikyGrad)" />
    {/* Ears pointed up */}
    <polygon points="75,30 70,5 80,25" fill="url(#spikyGrad)" />
    <polygon points="125,30 130,5 120,25" fill="url(#spikyGrad)" />
    {/* Angry eyes */}
    <circle cx="85" cy="60" r="5" fill="#333" />
    <circle cx="115" cy="60" r="5" fill="#333" />
    {/* Angry eyebrows */}
    <path d="M 78 52 Q 85 48 92 52" stroke="#333" strokeWidth="2" fill="none" />
    <path d="M 108 52 Q 115 48 122 52" stroke="#333" strokeWidth="2" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="75" r="3" fill="#FF1744" />
    {/* Angry mouth */}
    <path d="M 100 78 L 95 85 M 100 78 L 105 85" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    {/* Paws */}
    <ellipse cx="75" cy="160" rx="13" ry="22" fill="url(#spikyGrad)" />
    <ellipse cx="125" cy="160" rx="13" ry="22" fill="url(#spikyGrad)" />
    {/* Tail up (angry) */}
    <path d="M 135 110 Q 155 80 150 50" stroke="url(#spikyGrad)" strokeWidth="16" fill="none" strokeLinecap="round" />
  </svg>
);

// Clingy Cat (粘人猫)
export const ClingyCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="clingyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFB3D9', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FF99CC', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="120" rx="48" ry="52" fill="url(#clingyGrad)" />
    {/* Head */}
    <circle cx="100" cy="68" r="40" fill="url(#clingyGrad)" />
    {/* Ears */}
    <polygon points="75,32 68,8 80,28" fill="url(#clingyGrad)" />
    <polygon points="125,32 132,8 120,28" fill="url(#clingyGrad)" />
    {/* Inner ears */}
    <polygon points="75,32 72,18 78,28" fill="#FFB3D9" opacity="0.7" />
    <polygon points="125,32 128,18 122,28" fill="#FFB3D9" opacity="0.7" />
    {/* Big sad eyes */}
    <circle cx="82" cy="62" r="6" fill="#333" />
    <circle cx="118" cy="62" r="6" fill="#333" />
    {/* Tears */}
    <circle cx="82" cy="75" r="2" fill="#87CEEB" opacity="0.8" />
    <circle cx="118" cy="75" r="2" fill="#87CEEB" opacity="0.8" />
    {/* Sad eyebrows */}
    <path d="M 75 55 Q 82 52 89 55" stroke="#333" strokeWidth="1.5" fill="none" />
    <path d="M 111 55 Q 118 52 125 55" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="75" r="3" fill="#FF69B4" />
    {/* Sad mouth */}
    <path d="M 100 82 Q 95 88 90 85" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Reaching paws */}
    <ellipse cx="65" cy="130" rx="14" ry="24" fill="url(#clingyGrad)" transform="rotate(-20 65 130)" />
    <ellipse cx="135" cy="130" rx="14" ry="24" fill="url(#clingyGrad)" transform="rotate(20 135 130)" />
    {/* Tail wrapped */}
    <path d="M 140 110 Q 160 105 158 135" stroke="url(#clingyGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
  </svg>
);

// Curious Cat (好奇猫)
export const CuriousCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="curiousGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFC700', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="125" rx="46" ry="48" fill="url(#curiousGrad)" />
    {/* Head tilted */}
    <circle cx="100" cy="70" r="38" fill="url(#curiousGrad)" transform="rotate(-15 100 70)" />
    {/* Ears perked up */}
    <polygon points="75,32 68,5 82,28" fill="url(#curiousGrad)" />
    <polygon points="125,32 132,5 118,28" fill="url(#curiousGrad)" />
    {/* Inner ears */}
    <polygon points="75,32 72,15 80,28" fill="#FFE5B4" />
    <polygon points="125,32 128,15 120,28" fill="#FFE5B4" />
    {/* Curious eyes (wide) */}
    <circle cx="82" cy="65" r="6" fill="#333" />
    <circle cx="118" cy="65" r="6" fill="#333" />
    {/* Eyebrows (curious) */}
    <path d="M 75 55 Q 82 50 89 55" stroke="#333" strokeWidth="1.5" fill="none" />
    <path d="M 111 55 Q 118 50 125 55" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="78" r="3" fill="#FF69B4" />
    {/* Mouth (interested) */}
    <path d="M 100 82 Q 98 87 95 85" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Front paws */}
    <ellipse cx="78" cy="160" rx="12" ry="20" fill="url(#curiousGrad)" />
    <ellipse cx="122" cy="160" rx="12" ry="20" fill="url(#curiousGrad)" />
    {/* Tail up (interested) */}
    <path d="M 138 115 Q 155 95 152 65" stroke="url(#curiousGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
  </svg>
);

// Sunny Cat (晒太阳猫)
export const SunnyCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="sunnyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#90EE90', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#7FD87F', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body relaxed */}
    <ellipse cx="100" cy="125" rx="50" ry="45" fill="url(#sunnyGrad)" />
    {/* Head */}
    <circle cx="100" cy="70" r="40" fill="url(#sunnyGrad)" />
    {/* Ears relaxed */}
    <polygon points="75,35 70,12 82,32" fill="url(#sunnyGrad)" />
    <polygon points="125,35 130,12 118,32" fill="url(#sunnyGrad)" />
    {/* Inner ears */}
    <polygon points="75,35 72,20 80,32" fill="#B4E7B4" />
    <polygon points="125,35 128,20 120,32" fill="#B4E7B4" />
    {/* Happy closed eyes */}
    <path d="M 82 65 Q 82 70 88 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 112 65 Q 112 70 118 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Happy eyebrows */}
    <path d="M 78 58 Q 85 55 92 58" stroke="#333" strokeWidth="1.5" fill="none" />
    <path d="M 108 58 Q 115 55 122 58" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="78" r="3" fill="#FF69B4" />
    {/* Happy smile */}
    <path d="M 100 82 Q 95 88 90 85" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 100 82 Q 105 88 110 85" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Relaxed paws */}
    <ellipse cx="75" cy="160" rx="13" ry="18" fill="url(#sunnyGrad)" />
    <ellipse cx="125" cy="160" rx="13" ry="18" fill="url(#sunnyGrad)" />
    {/* Tail curled contentedly */}
    <path d="M 140 115 Q 160 110 158 140" stroke="url(#sunnyGrad)" strokeWidth="15" fill="none" strokeLinecap="round" />
    {/* Sun rays */}
    <circle cx="30" cy="30" r="8" fill="#FFD700" opacity="0.6" />
    <line x1="30" y1="15" x2="30" y2="5" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
    <line x1="45" y1="30" x2="55" y2="30" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
  </svg>
);

// Aloof Cat (高冷观察猫)
export const AloofCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="aloofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D3D3D3', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="125" rx="48" ry="50" fill="url(#aloofGrad)" />
    {/* Head looking away */}
    <circle cx="100" cy="70" r="40" fill="url(#aloofGrad)" transform="rotate(-20 100 70)" />
    {/* Ears */}
    <polygon points="75,32 68,8 80,28" fill="url(#aloofGrad)" />
    <polygon points="125,32 132,8 120,28" fill="url(#aloofGrad)" />
    {/* Inner ears */}
    <polygon points="75,32 72,18 78,28" fill="#E8E8E8" />
    <polygon points="125,32 128,18 122,28" fill="#E8E8E8" />
    {/* Cool eyes (looking away) */}
    <circle cx="88" cy="62" r="5" fill="#333" />
    {/* Eyebrow (cool) */}
    <path d="M 82 54 Q 88 51 94 54" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="95" cy="75" r="2.5" fill="#999" />
    {/* Neutral mouth */}
    <path d="M 95 80 L 92 83" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Paws */}
    <ellipse cx="75" cy="160" rx="12" ry="20" fill="url(#aloofGrad)" />
    <ellipse cx="125" cy="160" rx="12" ry="20" fill="url(#aloofGrad)" />
    {/* Tail elegant */}
    <path d="M 140 115 Q 165 100 160 140" stroke="url(#aloofGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
  </svg>
);

// Frantic Cat (暴冲猫)
export const FranticCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="franticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FF7500', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body in motion */}
    <ellipse cx="100" cy="120" rx="45" ry="50" fill="url(#franticGrad)" transform="rotate(10 100 120)" />
    {/* Head */}
    <circle cx="100" cy="65" r="38" fill="url(#franticGrad)" />
    {/* Ears back (running) */}
    <polygon points="75,35 65,15 78,32" fill="url(#franticGrad)" />
    <polygon points="125,35 135,15 122,32" fill="url(#franticGrad)" />
    {/* Excited eyes */}
    <circle cx="82" cy="60" r="5" fill="#333" />
    <circle cx="118" cy="60" r="5" fill="#333" />
    {/* Excited eyebrows */}
    <path d="M 75 50 Q 82 46 89 50" stroke="#333" strokeWidth="2" fill="none" />
    <path d="M 111 50 Q 118 46 125 50" stroke="#333" strokeWidth="2" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="75" r="3" fill="#FF1744" />
    {/* Excited mouth */}
    <path d="M 100 80 Q 95 87 90 84" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 100 80 Q 105 87 110 84" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Running paws */}
    <ellipse cx="70" cy="160" rx="12" ry="22" fill="url(#franticGrad)" transform="rotate(-30 70 160)" />
    <ellipse cx="130" cy="160" rx="12" ry="22" fill="url(#franticGrad)" transform="rotate(30 130 160)" />
    {/* Tail flying */}
    <path d="M 135 110 Q 165 70 160 40" stroke="url(#franticGrad)" strokeWidth="16" fill="none" strokeLinecap="round" />
    {/* Motion lines */}
    <line x1="40" y1="100" x2="50" y2="100" stroke="url(#franticGrad)" strokeWidth="2" opacity="0.5" />
    <line x1="35" y1="120" x2="48" y2="125" stroke="url(#franticGrad)" strokeWidth="2" opacity="0.5" />
  </svg>
);

// Sad Cat (委屈猫)
export const SadCatIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="sadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#9370DB', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8A5FBF', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="100" cy="125" rx="48" ry="50" fill="url(#sadGrad)" />
    {/* Head */}
    <circle cx="100" cy="70" r="40" fill="url(#sadGrad)" />
    {/* Ears drooping */}
    <polygon points="75,38 68,20 80,35" fill="url(#sadGrad)" />
    <polygon points="125,38 132,20 120,35" fill="url(#sadGrad)" />
    {/* Inner ears */}
    <polygon points="75,38 72,25 78,35" fill="#B8A8DB" />
    <polygon points="125,38 128,25 122,35" fill="#B8A8DB" />
    {/* Sad eyes (big tears) */}
    <circle cx="82" cy="65" r="6" fill="#333" />
    <circle cx="118" cy="65" r="6" fill="#333" />
    {/* Big tears */}
    <circle cx="82" cy="80" r="3" fill="#87CEEB" />
    <circle cx="82" cy="88" r="2.5" fill="#87CEEB" opacity="0.7" />
    <circle cx="118" cy="80" r="3" fill="#87CEEB" />
    <circle cx="118" cy="88" r="2.5" fill="#87CEEB" opacity="0.7" />
    {/* Sad eyebrows */}
    <path d="M 75 55 Q 82 50 89 55" stroke="#333" strokeWidth="1.5" fill="none" />
    <path d="M 111 55 Q 118 50 125 55" stroke="#333" strokeWidth="1.5" fill="none" />
    {/* Nose */}
    <circle cx="100" cy="78" r="3" fill="#FF69B4" />
    {/* Sad mouth (downturned) */}
    <path d="M 100 85 Q 95 90 90 87" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Paws */}
    <ellipse cx="75" cy="160" rx="12" ry="20" fill="url(#sadGrad)" />
    <ellipse cx="125" cy="160" rx="12" ry="20" fill="url(#sadGrad)" />
    {/* Tail down */}
    <path d="M 140 120 Q 155 140 145 160" stroke="url(#sadGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
  </svg>
);

interface CatIllustrationProps {
  personalityId: string;
  className?: string;
}

export const CatIllustration: React.FC<CatIllustrationProps> = ({ personalityId, className = 'w-32 h-32' }) => {
  const illustrations: Record<string, React.ReactNode> = {
    sleepy: <SleepyCatIllustration />,
    hiding: <HidingCatIllustration />,
    spiky: <SpikyCatIllustration />,
    clingy: <ClingyCatIllustration />,
    curious: <CuriousCatIllustration />,
    sunny: <SunnyCatIllustration />,
    aloof: <AloofCatIllustration />,
    frantic: <FranticCatIllustration />,
    sad: <SadCatIllustration />,
  };

  return (
    <div className={className}>
      {illustrations[personalityId] || illustrations.sleepy}
    </div>
  );
};
