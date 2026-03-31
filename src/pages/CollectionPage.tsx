import { useState, useEffect } from 'react';

const EMOTION_EMOJI: Record<string, string> = {
  happy:'😸',calm:'😌',sleepy:'😴',curious:'🐱',annoyed:'😾',anxious:'🙀',
  resigned:'😑',dramatic:'💀',sassy:'💅',clingy:'🥺',zoomies:'⚡',suspicious:'🤨',
  smug:'😏',confused:'😵',hangry:'🍽️',sad:'😢',angry:'😡',scared:'😨',
  disgusted:'🤢',surprised:'😲',loved:'🥰',bored:'😒',ashamed:'😳',tired:'😮‍💨',
  disappointed:'😞',melancholy:'🌧️',
};

const EMOTION_ZH: Record<string, string> = {
  happy:'开心', calm:'平静', sleepy:'困', curious:'好奇', annoyed:'烦', anxious:'焦虑',
  resigned:'无奈', dramatic:'崩溃', sassy:'傲娇', clingy:'黏人', zoomies:'亢奋', suspicious:'怀疑',
  smug:'得意', confused:'懵', hangry:'饿', sad:'难过', angry:'生气', scared:'害怕',
  disgusted:'恶心', surprised:'惊讶', loved:'被爱', bored:'无聊', ashamed:'羞愧', tired:'累了',
  disappointed:'失望', melancholy:'惆怅',
};

const ALL_EMOTIONS = Object.keys(EMOTION_EMOJI);

export function CollectionPage({ userId }: { userId: string }) {
  const [byEmotion, setByEmotion] = useState<Record<string, any[]>>({});
  const [unlocked, setUnlocked] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/social/collection?user_id=${userId}`)
      .then(r => r.json())
      .then(d => {
        setByEmotion(d.by_emotion || {});
        setUnlocked(d.unlocked || 0);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  const selectedItems = selected ? (byEmotion[selected] || []) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">情绪图鉴</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          已解锁 <span className="text-purple-600 font-bold">{unlocked}</span> / {ALL_EMOTIONS.length} 种情绪 · 共收集 {total} 张
        </p>
        {/* Progress bar */}
        <div className="max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${(unlocked / ALL_EMOTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Emotion grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {ALL_EMOTIONS.map(emotion => {
          const items = byEmotion[emotion] || [];
          const isUnlocked = items.length > 0;
          return (
            <button
              key={emotion}
              onClick={() => setSelected(selected === emotion ? null : emotion)}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all text-xs
                ${selected === emotion ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/30' : ''}
                ${isUnlocked
                  ? 'border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 hover:border-purple-400'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50'
                }`}
            >
              <span className="text-2xl">{isUnlocked ? EMOTION_EMOJI[emotion] : '❓'}</span>
              <span className={`mt-1 truncate w-full text-center text-[10px] leading-tight ${isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                <span className="block">{EMOTION_ZH[emotion]}</span>
                <span className="block opacity-60">{emotion}</span>
              </span>
              {isUnlocked && <span className="text-purple-500 font-bold">{items.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Selected emotion detail */}
      {selected && selectedItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-gray-700 shadow space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            {EMOTION_EMOJI[selected]} {EMOTION_ZH[selected]} / {selected} · {selectedItems.length} 张
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {selectedItems.map((item: any, i: number) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {item.cat_images?.image_url ? (
                  <>
                    <img src={item.cat_images.image_url} alt={selected} className="w-full h-full object-cover" />
                    {/* NFT 徽章 */}
                    {item.cat_images.is_nft && (
                      <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                        🏆 NFT
                      </div>
                    )}
                    {/* 稀有度标签 */}
                    {item.cat_images.nft_rarity && (
                      <div className={`absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg
                        ${item.cat_images.nft_rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : ''}
                        ${item.cat_images.nft_rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' : ''}
                        ${item.cat_images.nft_rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' : ''}
                        ${item.cat_images.nft_rarity === 'common' ? 'bg-gray-400 text-white' : ''}
                      `}>
                        {item.cat_images.nft_rarity === 'legendary' && '⭐'}
                        {item.cat_images.nft_rarity === 'epic' && '💎'}
                        {item.cat_images.nft_rarity === 'rare' && '💠'}
                        {item.cat_images.nft_rarity === 'common' && '⚪'}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🐱</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
