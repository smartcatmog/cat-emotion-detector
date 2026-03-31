import { useState, useEffect } from 'react';

const RARITY_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  common:    { label: '普通',   color: 'text-gray-600',   bg: 'bg-gray-100' },
  rare:      { label: '稀有',   color: 'text-blue-600',   bg: 'bg-blue-100' },
  epic:      { label: '史诗',   color: 'text-purple-600', bg: 'bg-purple-100' },
  legendary: { label: '传说',   color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

const BOX_EMOJI: Record<string, string> = {
  common: '📦', silver: '🥈', gold: '🥇', rainbow: '🌈',
};

export function LootboxPage({ userId }: { userId: string }) {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [reward, setReward] = useState<any>(null);

  const fetchBoxes = () => {
    setLoading(true);
    fetch(`/api/social/lootbox?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setBoxes(d.data || []))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBoxes(); }, [userId]);

  const openBox = async (boxId: string) => {
    setOpening(boxId);
    setReward(null);
    try {
      const res = await fetch('/api/social/lootbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, box_id: boxId }),
      });
      const data = await res.json();
      setReward(data);
      fetchBoxes();
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">情绪盲盒</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">每日打卡获得盲盒，开启获得猫图收藏</p>
      </div>

      {/* Reward display */}
      {reward && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-purple-300 shadow-lg text-center space-y-3">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">🎉 开盒成功！</p>
          {reward.cat_image ? (
            <>
              <img src={reward.cat_image.image_url} alt="reward" className="w-40 h-40 object-cover rounded-xl mx-auto shadow" />
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${RARITY_STYLE[reward.reward_rarity]?.bg} ${RARITY_STYLE[reward.reward_rarity]?.color}`}>
                {RARITY_STYLE[reward.reward_rarity]?.label || reward.reward_rarity} 猫图
              </div>
              {reward.cat_image.description && (
                <p className="text-sm text-gray-500 italic">"{reward.cat_image.description}"</p>
              )}
              <p className="text-xs text-green-600">已自动加入你的图鉴 ✓</p>
            </>
          ) : (
            <p className="text-gray-500">暂无猫图，稍后再试</p>
          )}
          <button onClick={() => setReward(null)} className="text-sm text-gray-400 hover:text-gray-600">关闭</button>
        </div>
      )}

      {/* Box inventory */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
          <div className="text-5xl">📭</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">暂无盲盒</p>
          <p className="text-sm text-gray-400">每日打卡后自动获得一个盲盒</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {boxes.map((box: any) => (
            <div key={box.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-gray-700 shadow text-center space-y-2">
              <div className="text-4xl">{BOX_EMOJI[box.box_rarity] || '📦'}</div>
              <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm capitalize">{box.box_rarity} 盲盒</p>
              <p className="text-xs text-gray-400">{box.source}</p>
              <button
                onClick={() => openBox(box.id)}
                disabled={opening === box.id}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {opening === box.id ? '开启中...' : '开启'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
