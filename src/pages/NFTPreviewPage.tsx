import React from 'react';
import { NFTCertificate } from '../components/NFTCertificate';

// 使用你的猫的照片作为样本
const sampleCatImage = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'; // 临时占位，你可以替换成实际上传的图片

export const NFTPreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎨 MoodCat NFT 证书设计
          </h1>
          <p className="text-gray-300 text-lg">
            根据情绪稀有度，NFT 分为 4 个等级
          </p>
        </div>

        {/* NFT 样本展示 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {/* 传说级 - 最稀有 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-yellow-400 text-center">
              ⭐ 传说级 Legendary
            </h3>
            <NFTCertificate
              imageUrl={sampleCatImage}
              tokenId="#0000001"
              emotion="suspicious"
              emotionChinese="怀疑人生"
              mintDate="2026-03-31"
              rarity="legendary"
              petName="小虎"
            />
            <p className="text-gray-400 text-sm text-center">
              稀有情绪：suspicious, dramatic, hangry
            </p>
          </div>

          {/* 史诗级 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-400 text-center">
              💎 史诗级 Epic
            </h3>
            <NFTCertificate
              imageUrl={sampleCatImage}
              tokenId="#0000042"
              emotion="smug"
              emotionChinese="得意洋洋"
              mintDate="2026-03-31"
              rarity="epic"
              petName="喵大人"
            />
            <p className="text-gray-400 text-sm text-center">
              罕见情绪：smug, sassy, zoomies
            </p>
          </div>

          {/* 稀有级 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-blue-400 text-center">
              💠 稀有级 Rare
            </h3>
            <NFTCertificate
              imageUrl={sampleCatImage}
              tokenId="#0000123"
              emotion="curious"
              emotionChinese="好奇宝宝"
              mintDate="2026-03-31"
              rarity="rare"
            />
            <p className="text-gray-400 text-sm text-center">
              常见情绪：curious, annoyed, anxious
            </p>
          </div>

          {/* 普通级 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-400 text-center">
              ⚪ 普通级 Common
            </h3>
            <NFTCertificate
              imageUrl={sampleCatImage}
              tokenId="#0000456"
              emotion="calm"
              emotionChinese="岁月静好"
              mintDate="2026-03-31"
              rarity="common"
            />
            <p className="text-gray-400 text-sm text-center">
              基础情绪：happy, calm, sleepy
            </p>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            ✨ NFT 功能特性
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-semibold text-white mb-2">唯一编号</h3>
              <p className="text-sm">每个 NFT 都有独一无二的 Token ID</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌈</div>
              <h3 className="font-semibold text-white mb-2">稀有度分级</h3>
              <p className="text-sm">根据情绪稀有度自动分配等级</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📥</div>
              <h3 className="font-semibold text-white mb-2">可下载分享</h3>
              <p className="text-sm">高清证书图片，可分享到社交媒体</p>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            ← 返回
          </button>
        </div>
      </div>
    </div>
  );
};
