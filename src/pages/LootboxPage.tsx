import { useState, useEffect } from 'react';

const RARITY_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  common:    { label: '普通 Common',   color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  rare:      { label: '稀有 Rare',     color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  epic:      { label: '史诗 Epic',     color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200' },
  legendary: { label: '传说 Legendary',color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
};

const BOX_EMOJI: Record<string, string> = {
  common: '📦', silver: '🥈', gold: '🥇', rainbow: '🌈',
};

export function LootboxPage({ userId }: { userId?: string }) {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [openedBoxes, setOpenedBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [reward, setReward] = useState<any>(null);
  const [guestBoxCount, setGuestBoxCount] = useState(3); // 游客模式默认3个盲盒

  const fetchBoxes = () => {
    if (!userId) {
      // 游客模式：生成虚拟盲盒
      setBoxes([
        { id: 'guest-1', box_rarity: 'common', source: '体验盲盒', is_guest: true },
        { id: 'guest-2', box_rarity: 'silver', source: '体验盲盒', is_guest: true },
        { id: 'guest-3', box_rarity: 'gold', source: '体验盲盒', is_guest: true },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/social/lootbox?user_id=${userId}`)
      .then(r => r.json())
      .then(d => {
        setBoxes(d.data || []);
        setOpenedBoxes(d.opened || []);
      })
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBoxes(); }, [userId]);

  const openBox = async (boxId: string) => {
    setOpening(boxId);
    setReward(null);
    
    const box = boxes.find(b => b.id === boxId);
    
    // 游客模式：随机获取一张猫图
    if (!userId || box?.is_guest) {
      try {
        const res = await fetch('/api/social/lootbox?guest=true');
        const data = await res.json();
        if (res.ok && data.cat_image) {
          setReward({
            ...data,
            is_guest: true,
          });
          // 移除已开启的盲盒
          setBoxes(prev => prev.filter(b => b.id !== boxId));
          setGuestBoxCount(prev => prev - 1);
        }
      } catch (err) {
        console.error('Guest lootbox error:', err);
      } finally {
        setOpening(null);
      }
      return;
    }

    // 登录用户模式
    try {
      const res = await fetch('/api/social/lootbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, box_id: boxId }),
      });
      const data = await res.json();
      if (res.ok) {
        setReward(data);
        // Move box from unopened to opened locally
        if (box) {
          setBoxes(prev => prev.filter(b => b.id !== boxId));
          setOpenedBoxes(prev => [{ ...box, is_opened: true }, ...prev]);
        }
      }
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">情绪盲盒 Loot Box</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">每次打卡获得一个盲盒 · 永久收藏</p>
      </div>

      {/* Reward display */}
      {reward && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-purple-300 shadow-lg text-center space-y-3">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">🎉 开盒成功！</p>
          {reward.cat_image ? (
            <>
              <img src={reward.cat_image.image_url} alt="reward" className="w-40 h-40 object-cover rounded-xl mx-auto shadow" />
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${RARITY_STYLE[reward.reward_rarity]?.bg} ${RARITY_STYLE[reward.reward_rarity]?.color} ${RARITY_STYLE[reward.reward_rarity]?.border}`}>
                {RARITY_STYLE[reward.reward_rarity]?.label || reward.reward_rarity}
              </div>
              {reward.cat_image.description && (
                <p className="text-sm text-gray-500 italic">"{reward.cat_image.description}"</p>
              )}
              {reward.is_guest ? (
                <p className="text-xs text-yellow-600">👻 游客模式 · 登录后可永久收藏</p>
              ) : (
                <p className="text-xs text-green-600">已自动加入你的图鉴 ✓</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">暂无猫图，稍后再试</p>
          )}
          <button onClick={() => setReward(null)} className="text-sm text-gray-400 hover:text-gray-600">关闭</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* Unopened boxes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              未开启 Unopened · {boxes.length} 个
            </h3>
            {boxes.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                <div className="text-4xl">📭</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {userId ? '暂无盲盒，打卡后自动获得' : '体验盲盒已用完，登录后可获得更多'}
                </p>
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
                      {opening === box.id ? '开启中...' : '开启 Open'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opened history */}
          {openedBoxes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                已开启历史 History · {openedBoxes.length} 个
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {openedBoxes.map((box: any) => (
                  <div key={box.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center space-y-1 opacity-70">
                    <div className="text-2xl">{BOX_EMOJI[box.box_rarity] || '📦'}</div>
                    <p className="text-xs text-gray-500 capitalize">{box.box_rarity}</p>
                    <p className="text-[10px] text-gray-400">{new Date(box.opened_at || box.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
