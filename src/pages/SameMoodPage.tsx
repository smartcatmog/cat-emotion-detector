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

export function SameMoodPage({ userId, currentEmotion }: { userId: string; currentEmotion?: string }) {
  const [emotion, setEmotion] = useState(currentEmotion || '');
  const [users, setUsers] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socialLink, setSocialLink] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('twitter');
  const [savingLink, setSavingLink] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const PLATFORMS = [
    { id: 'twitter', label: 'X / Twitter', prefix: 'https://x.com/', placeholder: 'username' },
    { id: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/', placeholder: 'username' },
    { id: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@', placeholder: 'username' },
    { id: 'weibo', label: '微博', prefix: 'https://weibo.com/u/', placeholder: '用户名或ID' },
    { id: 'xiaohongshu', label: '小红书', prefix: 'https://www.xiaohongshu.com/user/profile/', placeholder: '用户ID' },
    { id: 'custom', label: '其他链接', prefix: '', placeholder: 'https://...' },
  ];

  const buildLink = () => {
    const platform = PLATFORMS.find(p => p.id === socialPlatform);
    if (!platform || !socialLink.trim()) return '';
    if (socialPlatform === 'custom') return socialLink.trim();
    return `${platform.prefix}${socialLink.trim().replace('@', '')}`;
  };

  const search = (e: string) => {
    if (!e) return;
    setLoading(true);
    fetch(`/api/social/same-mood?user_id=${userId}&emotion_label=${e}`)
      .then(r => r.json())
      .then(d => { setUsers(d.data || []); setCount(d.count || 0); })
      .finally(() => setLoading(false));
  };

  const saveSocialLink = async () => {
    const link = buildLink();
    if (!link) return;
    setSavingLink(true);
    try {
      const res = await fetch('/api/social/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, social_link: link }),
      });
      if (res.ok) {
        setSavedMsg('✅ 已保存！');
        setTimeout(() => { setSavedMsg(''); setShowLinkInput(false); }, 2000);
      }
    } finally {
      setSavingLink(false);
    }
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
        {/* 设置社交链接 */}
        {!showLinkInput ? (
          <button onClick={() => setShowLinkInput(true)} className="text-xs text-purple-400 hover:text-purple-600 underline">
            📱 设置我的社交媒体链接
          </button>
        ) : (
          <div className="max-w-sm mx-auto mt-2 space-y-2">
            {/* 平台选择 */}
            <div className="flex flex-wrap gap-1 justify-center">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setSocialPlatform(p.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${socialPlatform === p.id ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* 用户名输入 */}
            <div className="flex gap-2">
              {socialPlatform !== 'custom' && (
                <span className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                  {PLATFORMS.find(p => p.id === socialPlatform)?.prefix}
                </span>
              )}
              <input type="text" value={socialLink} onChange={e => setSocialLink(e.target.value)}
                placeholder={PLATFORMS.find(p => p.id === socialPlatform)?.placeholder}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none min-w-0" />
              <button onClick={saveSocialLink} disabled={savingLink || !socialLink.trim()}
                className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 disabled:opacity-50 whitespace-nowrap">
                {savingLink ? '...' : '保存'}
              </button>
              <button onClick={() => setShowLinkInput(false)} className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {/* 预览链接 */}
            {socialLink.trim() && (
              <p className="text-xs text-gray-400 text-center">
                链接：<a href={buildLink()} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">{buildLink()}</a>
              </p>
            )}
            {savedMsg && <p className="text-xs text-green-500 text-center">{savedMsg}</p>}
          </div>
        )}
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
              {emoji} {EMOTION_ZH[e]} / {e}
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
                今天有 <span className="text-purple-600 font-bold">{count}</span> 人和你一样感到 {EMOTION_EMOJI[emotion]} {EMOTION_ZH[emotion]} / {emotion}
              </p>

              {users.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                  <div className="text-4xl">{EMOTION_EMOJI[emotion]}</div>
                  <p className="text-gray-500 dark:text-gray-400">你是今天第一个 {EMOTION_ZH[emotion]} / {emotion} 的人</p>
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-50 text-sm truncate">
                            {u.users?.display_name || u.users?.username || '匿名用户'}
                          </p>
                          {u.streak > 1 && (
                            <span className="text-xs text-orange-500 font-semibold whitespace-nowrap">
                              🔥 {u.streak}天
                            </span>
                          )}
                        </div>
                        {u.mood_text && (
                          <p className="text-xs text-gray-400 truncate">"{u.mood_text}"</p>
                        )}
                        {u.users?.social_link && (
                          <a
                            href={u.users.social_link.startsWith('http') ? u.users.social_link : `https://${u.users.social_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-500 hover:text-purple-700 truncate block"
                          >
                            📱 {u.users.social_link.replace(/^https?:\/\//, '')}
                          </a>
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
