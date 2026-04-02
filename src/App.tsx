import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/Layout';
import { Upload } from './components/Upload';
import { Results } from './components/Results';
import { DataAnnotation } from './components/DataAnnotation';
import { Privacy } from './components/Privacy';
import { ShareCard } from './components/ShareCard';
import { LoginModal } from './components/LoginModal';
import { NFTCertificate } from './components/NFTCertificate';
import { downloadNFTCertificate } from './utils/downloadNFT';
import { CalendarPage } from './pages/CalendarPage';
import { CollectionPage } from './pages/CollectionPage';
import { LootboxPage } from './pages/LootboxPage';
import { SameMoodPage } from './pages/SameMoodPage';
import { NFTPreviewPage } from './pages/NFTPreviewPage';
import { AnalysisResult } from './types';
import { saveAnalysisResult, saveMoodFeedback, updateCatEmotion, supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useLang, t } from './lib/i18n';

type AppView = 'upload' | 'preview' | 'results' | 'history' | 'annotate' | 'privacy' | 'mood' | 'calendar' | 'collection' | 'lootbox' | 'same-mood';

const PROMPT = `You are an expert in cat behavior and feline body language. Analyze the cat in this photo.

CRITICAL: The "emotion" field MUST be exactly one of these 26 values:
happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry, sad, angry, scared, disgusted, surprised, loved, bored, ashamed, tired, disappointed, melancholy

Return ONLY valid JSON:
{
  "emotion": "exactly one of the 26 labels",
  "confidence": 85,
  "body_language": "body language description",
  "health_note": "health observation",
  "advice": "owner advice",
  "summary": "one sentence summary",
  "description": "fun, witty one-liner about this cat's vibe"
}`;

async function callClaude(base64: string, mediaType: string, saveToGallery: boolean, petName: string, socialLink: string) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (apiKey) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: base64 } },
        { type: 'text', text: PROMPT },
      ]}],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Cannot parse result');
    const result = JSON.parse(jsonMatch[0]);
    // 前端直接调用路径也要存图片到 gallery
    if (saveToGallery) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sbUrl = import.meta.env.VITE_SUPABASE_URL;
        const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (sbUrl && sbKey) {
          const sb = createClient(sbUrl, sbKey);
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
          const imageBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          const { error: uploadError } = await sb.storage.from('cat-images').upload(fileName, imageBuffer, { contentType: mediaType });
          if (!uploadError) {
            const { data: urlData } = sb.storage.from('cat-images').getPublicUrl(fileName);
            if (urlData?.publicUrl) {
              const { data: insertData } = await sb.from('cat_images').insert({
                image_url: urlData.publicUrl,
                emotion_label: result.emotion,
                confidence: Math.min(100, Math.max(0, result.confidence || 75)),
                description: result.description || result.summary || '',
                pet_name: petName?.trim() || null,
                social_link: socialLink?.trim() || null,
              }).select('id').single();
              if (insertData?.id) result.gallery_id = insertData.id;
            }
          }
        }
      } catch (e) { console.error('gallery save failed:', e); }
    }
    return result;
  } else {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType, save_to_gallery: saveToGallery, pet_name: petName || undefined, social_link: socialLink || undefined }),
    });
    if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Analysis failed'); }
    return response.json();
  }
}

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😸', calm: '😌', sleepy: '😴', curious: '🐱', annoyed: '😾',
  anxious: '🙀', resigned: '😑', dramatic: '💀', sassy: '💅', clingy: '🥺',
  zoomies: '⚡', suspicious: '🤨', smug: '😏', confused: '😵', hangry: '🍽️',
  sad: '😢', angry: '😡', scared: '😨', disgusted: '🤢', surprised: '😲',
  loved: '🥰', bored: '😒', ashamed: '😳', tired: '😮‍💨', disappointed: '😞',
  melancholy: '🌧️',
};

function CatCard({ cat, onLike, onTip, userId }: { cat: any; onLike: (id: string) => void; onTip: (cat: any) => void; userId?: string }) {
  const { lang } = useLang();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(cat.likes || 0);
  const [editingEmotion, setEditingEmotion] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(cat.emotion_label);
  const [showShareCard, setShowShareCard] = useState(false);
  const [collected, setCollected] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [nftData, setNftData] = useState<any>(cat.is_nft ? { token_id: cat.nft_token_id, rarity: cat.nft_rarity, minted_at: cat.nft_minted_at } : null);
  const [minting, setMinting] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  // Comments
  const [showComments, setShowComments] = useState(true);  // default open
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [commentError, setCommentError] = useState<string | null>(null);

  const loadComments = async () => {
    if (commentsLoaded) return;
    const res = await fetch(`/api/social/comments?cat_image_id=${cat.id}`);
    const d = await res.json();
    const list = d.data || [];
    setComments(list);
    setCommentCount(list.length);
    setCommentsLoaded(true);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(v => !v);
  };

  const submitComment = async () => {
    if (!userId || !commentText.trim() || submitting) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cat_image_id: cat.id,
          user_id: userId,
          content: commentText.trim(),
          parent_comment_id: replyTo?.id || null,
        }),
      });
      const d = await res.json();
      if (res.ok && d.data) {
        setComments(prev => [...prev, d.data]);
        setCommentCount(n => n + 1);
        setCommentText('');
        setReplyTo(null);
        setShowComments(true);
      } else {
        setCommentError(d.error || `Error ${res.status}`);
        console.error('[comments] POST failed:', res.status, d);
      }
    } catch (e) {
      setCommentError('Network error');
      console.error('[comments] POST exception:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Build threaded comment tree (top-level + replies)
  const topLevel = comments.filter(c => !c.parent_comment_id);
  const replies = (parentId: string) => comments.filter(c => c.parent_comment_id === parentId);

  const handleCollect = async () => {
    if (!userId || collected || collecting) return;
    setCollecting(true);
    try {
      const res = await fetch('/api/social/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, cat_image_id: cat.id, emotion_label: currentEmotion }),
      });
      if (res.ok || res.status === 409) setCollected(true);
    } finally {
      setCollecting(false);
    }
  };

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((n: number) => n + 1);
      onLike(cat.id);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(cat.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cat.pet_name || 'mood-cat'}-${cat.emotion_label}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(cat.image_url, '_blank');
    }
  };

  const handleMintNFT = async () => {
    setMinting(true);
    try {
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat_image_id: cat.id }),
      });
      const data = await response.json();
      if (response.ok || (response.status === 409 && data.nft)) {
        const nftInfo = {
          ...data.nft,
          image_url: cat.image_url,
          pet_name: cat.pet_name,
        };
        setNftData(nftInfo);
        setShowNFTModal(true); // 显示 NFT 证书模态框
      }
    } catch (error) {
      console.error('Mint failed:', error);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-purple-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="relative">
        <img src={cat.image_url} alt={cat.pet_name || 'A cat'} className="w-full h-56 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 text-xs font-bold text-purple-600">
          {EMOTION_EMOJI[currentEmotion] || '🐱'} {currentEmotion}
        </div>
        {/* NFT 徽章 */}
        {nftData && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            🏆 NFT #{nftData.token_id?.replace('#', '')}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        {cat.pet_name && <p className="font-bold text-gray-900 dark:text-gray-50 text-lg">🐱 {cat.pet_name}</p>}
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{cat.description}"</p>
        {cat.social_link && (
          <a href={cat.social_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium">
            📱 {lang === 'zh' ? '关注主人 →' : 'Follow the owner →'}
          </a>
        )}

        {/* 纠正情绪标签 */}
        {editingEmotion ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">选择正确的情绪：</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(EMOTION_EMOJI).map(([emotion, emoji]) => (
                <button
                  key={emotion}
                  onClick={async () => {
                    await updateCatEmotion(cat.id, emotion);
                    setCurrentEmotion(emotion);
                    setEditingEmotion(false);
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all border
                    ${currentEmotion === emotion
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600'
                    }`}
                >
                  {emoji} {emotion}
                </button>
              ))}
            </div>
            <button onClick={() => setEditingEmotion(false)} className="text-xs text-gray-400 hover:text-gray-600">取消</button>
          </div>
        ) : (
          <button onClick={() => setEditingEmotion(true)} className="text-xs text-gray-400 hover:text-purple-500 transition-colors">
            ✏️ {lang === 'zh' ? '标签不对？纠正一下' : 'Correct label?'}
          </button>
        )}
        
        {/* 铸造 NFT 按钮 */}
        {!nftData && (
          <button 
            onClick={handleMintNFT} 
            disabled={minting}
            className="w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {minting ? '⏳ 铸造中...' : '🏆 铸造 NFT'}
          </button>
        )}
        
        <div className="flex gap-2 pt-1">
          <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition-all ${liked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-50 hover:text-pink-500'}`}>
            {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : (lang === 'zh' ? '点赞' : 'Like')}
          </button>
          {userId && (
            <button onClick={handleCollect} disabled={collected || collecting} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition-all ${collected ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 hover:text-green-600'}`}>
              {collected ? '✅' : collecting ? '...' : '🗂️'} {collected ? (lang === 'zh' ? '已收藏' : 'Saved') : (lang === 'zh' ? '收藏' : 'Collect')}
            </button>
          )}
          <button onClick={() => onTip(cat)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-200 transition-colors">
            🪙 {lang === 'zh' ? '打赏' : 'Tip'}
          </button>
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors">
            ⬇️ {lang === 'zh' ? '保存' : 'Save'}
          </button>
          <button onClick={() => setShowShareCard(true)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors">
            🔗 {lang === 'zh' ? '分享' : 'Share'}
          </button>
        </div>
      </div>
      {/* Comments section */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={toggleComments}
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors"
        >
          <span className="font-medium">💬 {lang === 'zh' ? '评论' : 'Comments'}{commentCount > 0 ? ` (${commentCount})` : ''}</span>
          <span className="text-xs opacity-60">{showComments ? '收起 ▲' : '展开 ▼'}</span>
        </button>

        {showComments && (
          <div className="px-4 pb-5 space-y-4">

            {/* Input — top, always visible */}
            {userId ? (
              <div className="space-y-2">
                {replyTo && (
                  <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                    <span>↩ {lang === 'zh' ? `回复 ${replyTo.username}` : `Replying to ${replyTo.username}`}</span>
                    <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                    placeholder={lang === 'zh' ? '说点什么...' : 'Say something...'}
                    maxLength={500}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <button
                    onClick={submitComment}
                    disabled={submitting || !commentText.trim()}
                    className="px-4 py-2.5 bg-purple-500 text-white rounded-2xl text-sm font-medium hover:bg-purple-600 disabled:opacity-40 transition-colors whitespace-nowrap"
                  >
                    {submitting ? '...' : (lang === 'zh' ? '发送' : 'Send')}
                  </button>
                </div>
                {commentError && (
                  <p className="text-xs text-red-500 px-1">{commentError}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-1">
                {lang === 'zh' ? '登录后才能评论' : 'Sign in to comment'}
              </p>
            )}

            {/* Comment list */}
            {topLevel.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">
                {lang === 'zh' ? '还没有评论，来说第一句话吧 👇' : 'No comments yet — be the first!'}
              </p>
            ) : (
              <div className="space-y-3">
                {topLevel.map(c => (
                  <div key={c.id} className="space-y-2">
                    {/* Comment */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(c.users?.display_name || c.users?.username || '?')[0]}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-2.5">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {c.users?.display_name || c.users?.username || '匿名'}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{c.content}</p>
                        </div>
                        {userId && (
                          <button
                            onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, username: c.users?.display_name || c.users?.username || '匿名' })}
                            className="mt-1 ml-2 text-xs text-gray-400 hover:text-purple-500 transition-colors"
                          >
                            {replyTo?.id === c.id ? (lang === 'zh' ? '取消' : 'Cancel') : (lang === 'zh' ? '回复' : 'Reply')}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Replies */}
                    {replies(c.id).map(r => (
                      <div key={r.id} className="ml-11 flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(r.users?.display_name || r.users?.username || '?')[0]}
                        </div>
                        <div className="flex-1 bg-blue-50 dark:bg-gray-600 rounded-2xl px-4 py-2.5">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            {r.users?.display_name || r.users?.username || '匿名'}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showShareCard && (
        <ShareCard
          imageUrl={cat.image_url}
          emotion={currentEmotion}
          emotionEmoji={EMOTION_EMOJI[currentEmotion] || '🐱'}
          petName={cat.pet_name}
          onClose={() => setShowShareCard(false)}
        />
      )}
      
      {/* NFT 证书模态框 */}
      {showNFTModal && nftData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowNFTModal(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg z-10"
            >
              ✕
            </button>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-2">
                  🎉 NFT 铸造成功！
                </h3>
                <p className="text-gray-300">
                  你的猫咪已经成为独一无二的数字收藏品
                </p>
              </div>
              
              <NFTCertificate
                imageUrl={nftData.image_url || cat.image_url}
                tokenId={nftData.token_id}
                emotion={nftData.emotion_label || currentEmotion}
                emotionChinese={currentEmotion}
                mintDate={new Date(nftData.minted_at).toLocaleDateString('zh-CN')}
                rarity={nftData.rarity}
                petName={nftData.pet_name || cat.pet_name}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    downloadNFTCertificate('nft-certificate', `moodcat-nft-${nftData.token_id}.png`);
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  ⬇️ 下载证书
                </button>
                <button
                  onClick={() => setShowShareCard(true)}
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
                >
                  🔗 分享
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthPrompt({ onLogin, feature }: { onLogin: () => void; feature: string }) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">🔒</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">{feature}需要登录</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">登录后解锁打卡、收集、盲盒等社交功能</p>
      <button onClick={onLogin} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg">
        登录 / 注册
      </button>
    </div>
  );
}

function TipModal({ cat, onClose }: { cat: any; onClose: () => void }) {
  const [tipped, setTipped] = useState(false);
  const amounts = ['£1', '£2', '£5', '£10'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center space-y-3">
          <div className="text-4xl">🪙</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Tip {cat.pet_name || 'this cat'}!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Show some love to the cat owner</p>
          {!tipped ? (
            <>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {amounts.map(amount => (
                  <button key={amount} onClick={() => setTipped(true)} className="py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 transition-colors">
                    {amount}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 pt-1">🚧 Real payments coming soon — no money will be charged</p>
            </>
          ) : (
            <div className="py-4 space-y-2">
              <div className="text-3xl">🎉</div>
              <p className="font-bold text-green-600">Thanks for the love!</p>
              <p className="text-xs text-gray-400">No charge — payment integration coming soon</p>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, username, isAnonymous, isAuthenticated, setAnonymousMode, login, logout } = useAuth();
  const { lang } = useLang();
  const [currentView, setCurrentView] = useState<AppView>('mood');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCollectionConsent, setDataCollectionConsent] = useState(true);
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState<any>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<'idle' | 'picking' | 'done'>('idle');
  const [petName, setPetName] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [tipCat, setTipCat] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [checkinToast, setCheckinToast] = useState<string | null>(null);
  const [sameMoodNotif, setSameMoodNotif] = useState<{ count: number; emotion: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/history') setCurrentView('history');
    else if (path === '/nft-preview') setCurrentView('mood');
    else setCurrentView('mood');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentView === 'privacy') window.history.pushState({}, '', '/privacy');
    else if (currentView === 'history') window.history.pushState({}, '', '/history');
    else window.history.pushState({}, '', '/');
  }, [currentView]);

  const handleLike = async (catId: string) => {
    void supabase.rpc('increment_likes', { cat_id: catId });
  };

  const handleMoodMatch = async () => {
    if (!moodText.trim()) { setMoodError('Tell me how you feel 💭'); return; }
    setMoodLoading(true); setMoodError(null); setMoodResult(null);
    try {
      const response = await fetch('/api/mood-match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodText.trim() }),
      });
      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Match failed';
        try {
          const err = JSON.parse(text);
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setMoodResult(data.data);
      setMoodFeedback('idle');

      // Auto check-in if logged in
      if (user && data.data?.emotion_label) {
        const firstCatId = data.data.cats?.[0]?.id || null;
        fetch('/api/social/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, emotion_label: data.data.emotion_label, mood_text: moodText, cat_image_id: firstCatId }),
        }).then(async r => {
          const d = await r.json();
          if (!r.ok) { console.error('[checkin] failed:', r.status, d); return; }
          if (d.lootbox) setCheckinToast(`🎉 打卡成功！获得一个盲盒`);
          else setCheckinToast('✅ 今日打卡成功');
          setTimeout(() => setCheckinToast(null), 4000);
          // Show same-mood notification if there are matches
          if (d.same_mood_count > 0) {
            setSameMoodNotif({ count: d.same_mood_count, emotion: data.data.emotion_label });
          }
        }).catch(e => console.error('[checkin] error:', e));
      } else {
        console.log('[checkin] skipped - user:', user, 'emotion:', data.data?.emotion_label);
      }
    } catch (err) {
      setMoodError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setMoodLoading(false); }
  };

  const handleFileSelect = (file: File, previewData: string) => {
    setSelectedFile(file); setPreview(previewData); setError(null); setCurrentView('preview');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true); setError(null);
    try {
      if (!selectedFile.type.startsWith('image/')) throw new Error('Please upload an image file.');
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(selectedFile);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxSize = 1600;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
            else { width = Math.round(width * maxSize / height); height = maxSize; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
        };
        img.onerror = reject; img.src = url;
      });
      const claudeResult = await callClaude(base64, 'image/jpeg', saveToGallery, petName, socialLink);
      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11), fileType: 'image',
        fileName: selectedFile.name, fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        emotions: [{ type: claudeResult.emotion, confidence: claudeResult.confidence }],
        interpretation: claudeResult.summary,
        recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean),
        thumbnailUrl: preview || '', originalFileUrl: preview || '',
        galleryId: claudeResult.gallery_id || undefined,
      };
      setAnalysisResult(result); setCurrentView('results');
      if (dataCollectionConsent) {
        saveAnalysisResult({ file_name: selectedFile.name, file_type: 'image', file_size: selectedFile.size, emotion: claudeResult.emotion, confidence: claudeResult.confidence, interpretation: claudeResult.summary, recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean), data_collection_consent: true }).catch(console.error);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed'); }
    finally { setIsLoading(false); }
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null); setPreview(null); setAnalysisResult(null);
    setError(null); setPetName(''); setSocialLink(''); setCurrentView('mood');
  };

  // Check if feature requires auth
  const requiresAuth = (feature: 'calendar' | 'collection' | 'lootbox' | 'same-mood') => {
    if (!isAuthenticated && !isAnonymous) {
      setShowLoginModal(true);
      return true;
    }
    return false;
  };

  return (
    <Provider store={store}>
      <Layout 
        onNavigate={(view) => setCurrentView(view as AppView)}
        currentView={currentView}
        user={user}
        username={username}
        isAnonymous={isAnonymous}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={logout}
      >
        <div className="space-y-6">

          {/* Tab Nav */}
          {(currentView === 'upload' || currentView === 'mood') && (
            <div className="flex justify-center gap-3">
              <button onClick={() => setCurrentView('mood')} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${currentView === 'mood' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 border border-gray-200 dark:border-gray-700'}`}>
                💭 Match My Mood
              </button>
              <button onClick={() => setCurrentView('upload')} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${currentView === 'upload' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-200' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 border border-gray-200 dark:border-gray-700'}`}>
                🐱 Analyze My Cat
              </button>
            </div>
          )}

          {/* Mood Match View */}
          {currentView === 'mood' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{t.howFeeling[lang]}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t.moodSubtitle[lang]}</p>
              </div>
              <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 border border-purple-100 dark:border-gray-700">
                <textarea value={moodText} onChange={(e) => setMoodText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleMoodMatch(); }}} placeholder={t.moodPlaceholder[lang]} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none" rows={3} />
                {moodError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{moodError}</p>}
                <button onClick={handleMoodMatch} disabled={moodLoading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none">
                  {moodLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.findingCat[lang]}</>) : t.findCat[lang]}
                </button>
              </div>

              {moodResult && (
                <div className="max-w-3xl mx-auto space-y-5">

                  {moodResult.cats.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow border border-dashed border-purple-200 dark:border-gray-700">
                      <div className="text-5xl mb-3">🐱</div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No cats match this mood yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Be the first to upload one!</p>
                      <button onClick={() => setCurrentView('upload')} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-200 dark:shadow-none">
                        Upload a Cat Photo
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {moodResult.cats.map((cat: any) => (
                        <CatCard key={cat.id} cat={cat} onLike={handleLike} onTip={setTipCat} userId={user?.id} />
                      ))}
                    </div>
                  )}

                  {/* Mood feedback */}
                  <div className="max-w-xl mx-auto">
                    {moodFeedback === 'idle' && (
                      <div className="flex items-center justify-center gap-3 py-2">
                        <span className="text-sm text-gray-400">不是这个感觉？</span>
                        <button
                          onClick={() => setMoodFeedback('picking')}
                          className="text-sm text-purple-500 hover:text-purple-700 font-medium underline underline-offset-2 transition-colors"
                        >
                          告诉我你真正的心情 →
                        </button>
                      </div>
                    )}

                    {moodFeedback === 'picking' && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 p-4 space-y-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                          你觉得 <span className="text-purple-600 font-bold">"{moodText}"</span> 更接近哪种感觉？
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {Object.entries(EMOTION_EMOJI).map(([emotion, emoji]) => (
                            <button
                              key={emotion}
                              onClick={async () => {
                                await saveMoodFeedback(moodText, moodResult.emotion_label, emotion);
                                setMoodLoading(true);
                                setMoodFeedback('done');
                                try {
                                  const res = await fetch('/api/mood-match', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ mood_text: emotion }),
                                  });
                                  const data = await res.json();
                                  if (data.data) setMoodResult({ ...data.data, emotion_label: emotion });
                                } catch {/* silent */} finally { setMoodLoading(false); }
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                                ${moodResult.emotion_label === emotion
                                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                              {emoji} {emotion}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="或者直接告诉我你的感受，比如 sad、心碎、失落..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const val = e.currentTarget.value.trim();
                                await saveMoodFeedback(moodText, moodResult.emotion_label, val);
                                setMoodFeedback('done');
                              }
                            }}
                          />
                        </div>
                        <button
                          onClick={() => setMoodFeedback('idle')}
                          className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                        >
                          取消
                        </button>
                      </div>
                    )}

                    {moodFeedback === 'done' && (
                      <p className="text-center text-sm text-green-600 dark:text-green-400 py-2">
                        谢谢反馈，已为你重新匹配 🐱
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload View */}
          {currentView === 'upload' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">How is your cat feeling?</h2>
                <p className="text-gray-500 dark:text-gray-400">Upload a photo and AI will decode your cat's mood 🔍</p>
              </div>
              <Upload onFileSelect={handleFileSelect} />
            </div>
          )}

          {/* Preview View */}
          {currentView === 'preview' && selectedFile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Ready to analyze?</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Review your photo before we read your cat's mind</p>
              </div>
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-5 border border-blue-100 dark:border-gray-700">
                <img src={preview || ''} alt="Preview" className="w-full h-auto rounded-xl max-h-[80vh] object-contain bg-gray-50 dark:bg-gray-900" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">File name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{selectedFile.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">File size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={saveToGallery} onChange={(e) => setSaveToGallery(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">✨ Add to mood gallery (help others find their cat match)</span>
                  </label>
                  {saveToGallery && (
                    <div className="space-y-2 pl-7">
                      <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Your cat's name (optional)" className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                      <input type="text" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="Your social media link (optional)" className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                    </div>
                  )}
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={dataCollectionConsent} onChange={(e) => setDataCollectionConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">I consent to anonymous data collection to help improve the model</span>
                </label>
                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={handleAnalyzeAnother} disabled={isLoading} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleAnalyze} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
                    {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>) : '🔍 Analyze'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'results' && analysisResult && (
            <Results result={analysisResult} onAnalyzeAnother={handleAnalyzeAnother} onViewHistory={() => setCurrentView('history')} />
          )}

          {currentView === 'history' && (
            <div className="text-center space-y-4 py-10">
              <div className="text-5xl">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">History</h2>
              <p className="text-gray-500">Coming soon</p>
              <button onClick={handleAnalyzeAnother} className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">Back to Home</button>
            </div>
          )}

          {currentView === 'annotate' && <DataAnnotation />}
          {currentView === 'privacy' && <Privacy />}

          {/* Social Pages - require login */}
          {currentView === 'calendar' && (
            isAuthenticated
              ? <CalendarPage userId={user!.id} />
              : <AuthPrompt onLogin={() => setShowLoginModal(true)} feature="情绪日历" />
          )}
          {currentView === 'collection' && (
            isAuthenticated
              ? <CollectionPage userId={user!.id} />
              : <AuthPrompt onLogin={() => setShowLoginModal(true)} feature="收集图鉴" />
          )}
          {currentView === 'lootbox' && (
            <LootboxPage userId={user?.id} />
          )}
          {currentView === 'same-mood' && (
            isAuthenticated
              ? <SameMoodPage userId={user!.id} currentEmotion={moodResult?.emotion_label} />
              : <AuthPrompt onLogin={() => setShowLoginModal(true)} feature="同心情广场" />
          )}
          
          {/* NFT Preview Page - removed, NFT is now integrated in CatCard and Results */}
        </div>

        {tipCat && <TipModal cat={tipCat} onClose={() => setTipCat(null)} />}

        {/* Check-in toast */}
        {checkinToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium z-50 animate-fade-in">
            {checkinToast}
          </div>
        )}

        {/* Same-mood notification */}
        {sameMoodNotif && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="text-5xl">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                今天有 <span className="text-purple-600">{sameMoodNotif.count}</span> 人和你一样！
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {sameMoodNotif.count} people also feel <span className="font-semibold text-purple-600">{sameMoodNotif.emotion}</span> today
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSameMoodNotif(null); setCurrentView('same-mood'); }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  去看看 →
                </button>
                <button
                  onClick={() => setSameMoodNotif(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
          </div>
        )}
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={(user) => {
              login(user);
              setShowLoginModal(false);
            }}
            onAnonymous={() => {
              setAnonymousMode();
              setShowLoginModal(false);
            }}
          />
        )}
      </Layout>
    </Provider>
  );
}

export default App;
