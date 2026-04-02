import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { saveFeedback, updateCatEmotion } from '../lib/supabase';
import { ShareCard } from './ShareCard';
import { NFTCertificate } from './NFTCertificate';
import { downloadNFTCertificate } from '../utils/downloadNFT';
import { useLang } from '../lib/i18n';

const EMOTION_LABELS: Record<string, string> = {
  happy: '😸', calm: '😌', sleepy: '😴', curious: '🐱', annoyed: '😾',
  anxious: '🙀', resigned: '😑', dramatic: '💀', sassy: '💅', clingy: '🥺',
  zoomies: '⚡', suspicious: '🤨', smug: '😏', confused: '😵', hangry: '🍽️',
  sad: '😢', angry: '😡', scared: '😨', disgusted: '🤢', surprised: '😲',
  loved: '🥰', bored: '😒', ashamed: '😳', tired: '😮‍💨', disappointed: '😞',
  melancholy: '🌧️',
};

interface ResultsProps {
  result: AnalysisResult;
  onAnalyzeAnother: () => void;
  onViewHistory: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, onAnalyzeAnother, onViewHistory }) => {
  const { lang } = useLang();
  const [feedbackState, setFeedbackState] = useState<'idle' | 'wrong' | 'done'>('idle');
  const [selectedCorrect, setSelectedCorrect] = useState<string>('');
  const [correctedEmotion, setCorrectedEmotion] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const primaryEmotion = correctedEmotion || result.emotions?.[0]?.type || '';
  const confidence = result.emotions?.[0]?.confidence || 0;

  const handleAccurate = async () => {
    await saveFeedback(result.id, true).catch(console.error);
    setFeedbackState('done');
  };

  const handleInaccurate = () => {
    setFeedbackState('wrong');
  };

  const handleMintNFT = async () => {
    if (!result.galleryId) {
      setMintError('This image is not in the gallery. Please upload with "Add to gallery" enabled.');
      return;
    }

    setMinting(true);
    setMintError(null);

    try {
      console.log('[NFT] Minting for gallery ID:', result.galleryId);
      
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat_image_id: result.galleryId }),
      });

      console.log('[NFT] Response status:', response.status);
      
      const data = await response.json();
      console.log('[NFT] Response data:', data);

      if (!response.ok) {
        if (response.status === 409 && data.nft) {
          // 已经铸造过了
          console.log('[NFT] Already minted, showing existing NFT');
          setNftData(data.nft);
        } else {
          console.error('[NFT] Mint failed:', data);
          throw new Error(data.error || 'Failed to mint NFT');
        }
      } else {
        console.log('[NFT] Mint successful!');
        setNftData(data.nft);
      }
    } catch (error) {
      console.error('[NFT] Error:', error);
      setMintError(error instanceof Error ? error.message : 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const downloadNFTCertificateHandler = () => {
    if (nftData) {
      downloadNFTCertificate('nft-certificate', `moodcat-nft-${nftData.token_id}.png`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">

        {/* 情绪展示 */}
        <div className="text-center space-y-4">
          <div className="text-6xl">😺</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {primaryEmotion}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-12">
                {Math.round(confidence)}%
              </span>
            </div>
          </div>
        </div>

        {/* 分析结果 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">{lang === 'zh' ? '分析结果' : 'Analysis'}</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.interpretation}</p>
        </div>

        {/* 建议 */}
        {result.recommendations.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">{lang === 'zh' ? '建议' : 'Recommendations'}</h3>
            <div className="grid gap-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 图片预览 */}
        {result.thumbnailUrl && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <img src={result.thumbnailUrl} alt="分析图片" className="w-full h-auto rounded-lg max-h-[70vh] object-contain" />
          </div>
        )}

        {/* 用户反馈 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {feedbackState === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {lang === 'zh' ? '分析准确吗？' : 'Was this analysis accurate?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAccurate}
                  className="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  ✅ {lang === 'zh' ? '准确' : 'Accurate'}
                </button>
                <button
                  onClick={handleInaccurate}
                  className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  ❌ {lang === 'zh' ? '不准确' : 'Not accurate'}
                </button>
              </div>
            </div>
          )}

          {feedbackState === 'wrong' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                选择你觉得正确的情绪标签：
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(EMOTION_LABELS).map(([emotion, emoji]) => (
                  <button
                    key={emotion}
                    onClick={async () => {
                      setSelectedCorrect(emotion);
                      if (result.galleryId) {
                        await updateCatEmotion(result.galleryId, emotion);
                        setCorrectedEmotion(emotion);
                      }
                      await saveFeedback(result.id, false, emotion).catch(console.error);
                      setFeedbackState('done');
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCorrect === emotion
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {emoji} {emotion}
                  </button>
                ))}
              </div>
              
              {/* 自由输入框 */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 text-center mb-2">或者直接告诉我你的感受：</p>
                <input
                  type="text"
                  placeholder="比如：心碎、失落、开心到飞起..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const customEmotion = e.currentTarget.value.trim();
                      await saveFeedback(result.id, false, customEmotion).catch(console.error);
                      setFeedbackState('done');
                    }
                  }}
                />
                <p className="text-xs text-gray-400 text-center mt-1">按 Enter 提交</p>
              </div>
              
              <button
                onClick={() => setFeedbackState('idle')}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                取消
              </button>
            </div>
          )}

          {feedbackState === 'done' && (
            <p className="text-center text-sm text-green-600 dark:text-green-400">
              Thanks for your feedback — it helps us get better 🐱
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
          {/* NFT 铸造按钮 */}
          {result.galleryId && !nftData && (
            <button
              onClick={handleMintNFT}
              disabled={minting}
              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {minting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {lang === 'zh' ? '铸造中...' : 'Minting...'}
                </>
              ) : (
                <>
                  🏆 {lang === 'zh' ? '铸造 NFT 证书' : 'Mint NFT Certificate'}
                </>
              )}
            </button>
          )}

          {/* 提示：需要保存到图库才能铸造 NFT */}
          {!result.galleryId && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                💡 想要铸造 NFT？
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                下次上传时勾选 "✨ Add to mood gallery"，就可以铸造独一无二的 NFT 证书了！
              </p>
            </div>
          )}

          {mintError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">
              {mintError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onAnalyzeAnother}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {lang === 'zh' ? '再分析一张' : 'Analyze Another'}
            </button>
            <button
              onClick={() => setShowShareCard(true)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              🔗 {lang === 'zh' ? '分享' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* NFT 证书展示 */}
      {nftData && (
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              🎉 NFT 铸造成功！
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              你的猫咪已经成为独一无二的数字收藏品
            </p>
          </div>
          
          <NFTCertificate
            imageUrl={result.thumbnailUrl || ''}
            tokenId={nftData.token_id}
            emotion={nftData.emotion_label}
            emotionChinese={primaryEmotion}
            mintDate={new Date(nftData.minted_at).toLocaleDateString('zh-CN')}
            rarity={nftData.rarity}
            petName={nftData.pet_name}
          />

          <div className="flex gap-3">
            <button
              onClick={downloadNFTCertificateHandler}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              ⬇️ {lang === 'zh' ? '下载证书' : 'Download Certificate'}
            </button>
            <button
              onClick={() => setShowShareCard(true)}
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              🔗 {lang === 'zh' ? '分享 NFT' : 'Share NFT'}
            </button>
          </div>
        </div>
      )}

      {showShareCard && (
        <ShareCard
          imageUrl={result.thumbnailUrl}
          emotion={primaryEmotion}
          emotionEmoji={EMOTION_LABELS[primaryEmotion] || '🐱'}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
};
