import React from 'react';

interface NFTCertificateProps {
  imageUrl: string;
  tokenId: string;
  emotion: string;
  emotionChinese: string;
  mintDate: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  petName?: string;
}

const rarityConfig = {
  common: {
    label: '普通',
    color: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-400',
    glow: 'shadow-gray-400/50',
  },
  rare: {
    label: '稀有',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-400',
    glow: 'shadow-blue-400/50',
  },
  epic: {
    label: '史诗',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-400',
    glow: 'shadow-purple-400/50',
  },
  legendary: {
    label: '传说',
    color: 'from-yellow-400 to-orange-600',
    borderColor: 'border-yellow-400',
    glow: 'shadow-yellow-400/50',
  },
};

export const NFTCertificate: React.FC<NFTCertificateProps> = ({
  imageUrl,
  tokenId,
  emotion,
  emotionChinese,
  mintDate,
  rarity,
  petName,
}) => {
  const config = rarityConfig[rarity];

  return (
    <div className="relative w-full max-w-sm mx-auto" id="nft-certificate" style={{width: '360px', maxWidth: '100%'}}>
      {/* 外层发光效果 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-20 blur-xl rounded-2xl`} />
      
      {/* 主卡片 */}
      <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border-2 ${config.borderColor} shadow-2xl ${config.glow}`}>
        {/* 顶部装饰条 */}
        <div className={`h-2 bg-gradient-to-r ${config.color}`} />
        
        {/* 内容区域 */}
        <div className="p-6 space-y-4">
          {/* 标题区 */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl font-bold text-white">MoodCat NFT</h2>
              <span className="text-2xl">🏆</span>
            </div>
            <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${config.color} text-white text-sm font-semibold`}>
              {config.label}
            </div>
          </div>

          {/* 猫图片 - 主要展示区 */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-30 blur-md rounded-xl`} />
            <img
              src={imageUrl}
              alt="Cat NFT"
              className="relative w-full aspect-square object-cover rounded-xl border-2 border-white/20"
            />
            {/* 图片上的 Token ID 水印 */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-white text-sm font-mono">{tokenId}</span>
            </div>
          </div>

          {/* 信息区 */}
          <div className="space-y-3 bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            {petName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">猫咪名字</span>
                <span className="text-white font-semibold">{petName}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">情绪标签</span>
              <span className="text-white font-semibold">
                {emotionChinese} <span className="text-gray-400 text-xs">({emotion})</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">铸造日期</span>
              <span className="text-white font-mono text-sm">{mintDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Token ID</span>
              <span className="text-white font-mono text-sm">{tokenId}</span>
            </div>
          </div>

          {/* 底部认证标记 */}
          <div className="text-center pt-2 border-t border-gray-700">
            <p className="text-gray-500 text-xs">
              ✨ Certified by MoodCat AI ✨
            </p>
            <p className="text-gray-600 text-xs mt-1">
              This is a unique digital collectible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 预览组件 - 用于展示样本
export const NFTCertificatePreview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          MoodCat NFT 证书样本
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 传说级 - 你的猫 */}
          <NFTCertificate
            imageUrl="/sample-cat.jpg"
            tokenId="#0000001"
            emotion="suspicious"
            emotionChinese="怀疑"
            mintDate="2026-03-31"
            rarity="legendary"
            petName="小虎"
          />

          {/* 史诗级示例 */}
          <NFTCertificate
            imageUrl="/sample-cat.jpg"
            tokenId="#0000042"
            emotion="smug"
            emotionChinese="得意"
            mintDate="2026-03-31"
            rarity="epic"
          />

          {/* 稀有级示例 */}
          <NFTCertificate
            imageUrl="/sample-cat.jpg"
            tokenId="#0000123"
            emotion="curious"
            emotionChinese="好奇"
            mintDate="2026-03-31"
            rarity="rare"
          />

          {/* 普通级示例 */}
          <NFTCertificate
            imageUrl="/sample-cat.jpg"
            tokenId="#0000456"
            emotion="calm"
            emotionChinese="平静"
            mintDate="2026-03-31"
            rarity="common"
          />
        </div>
      </div>
    </div>
  );
};
