import { useState, useEffect } from 'react';

const EMOTION_EMOJI: Record<string, string> = {
  happy:'😸',calm:'😌',sleepy:'😴',curious:'🐱',annoyed:'😾',anxious:'🙀',
  resigned:'😑',dramatic:'💀',sassy:'💅',clingy:'🥺',zoomies:'⚡',suspicious:'🤨',
  smug:'😏',confused:'😵',hangry:'🍽️',sad:'😢',angry:'😡',scared:'😨',
  disgusted:'🤢',surprised:'😲',loved:'🥰',bored:'😒',ashamed:'😳',tired:'😮‍💨',
  disappointed:'😞',melancholy:'🌧️',
};

export function SameMoodPage({ userId, currentEmotion }: { userId: string; currentEmotion?: string }) {
  const [emotion, setEmotion] = useState(currentEmotion || '');
  const [users, setUsers] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const search = (e: string) => {
    if (!e) return;
    setLoading(true);
    fetch(`/api/social/same-mood?user_id=${userId}&emotion_label=${e}`)
      .then(r => r.json())
      .then(d => { setUsers(d.data || []); setCount(d.count || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (currentEmotion) { setEmotion(currentEmotion); search(currentEmotion); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmotion]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">同心情广场</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">找到今天和你一样心情的人</p>
      </div>

      {/* Emotion selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-gray-700 shadow">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">选择今天的心情：</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EMOTION_EMOJI).map(([e, emoji]) => (
            <button
              key={e}
              onClick={() => { setEmotion(e); search(e); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${emotion === e
                  ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'
                }`}
            >
              {emoji} {e}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {emotion && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">搜索中...</div>
          ) : (
            <>
              <p className="text-center text-sm text-gray-500">
                今天有 <span className="text-purple-600 font-bold">{count}</span> 人和你一样感到 {EMOTION_EMOJI[emotion]} {emotion}
              </p>

              {users.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                  <div className="text-4xl">{EMOTION_EMOJI[emotion]}</div>
                  <p className="text-gray-500 dark:text-gray-400">你是今天第一个 {emotion} 的人</p>
                  <p className="text-sm text-gray-400">先去打卡，等待同心情的朋友出现</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-sm">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.users?.display_name?.[0] || u.users?.username?.[0] || '?'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-50 text-sm truncate">
                          {u.users?.display_name || u.users?.username || '匿名用户'}
                        </p>
                        {u.mood_text && (
                          <p className="text-xs text-gray-400 truncate">"{u.mood_text}"</p>
                        )}
                      </div>
                      {/* Cat image thumbnail */}
                      {u.cat_image?.image_url && (
                        <img src={u.cat_image.image_url} alt="cat" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
