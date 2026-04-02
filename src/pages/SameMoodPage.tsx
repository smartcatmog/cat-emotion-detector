import { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';

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

// Platform detection from URL
const PLATFORMS = [
  { id: 'twitter',      label: 'X',          icon: '𝕏',  color: 'bg-black text-white',          prefix: 'https://x.com/',                          placeholder: 'username' },
  { id: 'twitter_old', label: 'Twitter',     icon: '🐦', color: 'bg-sky-400 text-white',         prefix: 'https://twitter.com/',                    placeholder: 'username' },
  { id: 'instagram',   label: 'Instagram',   icon: '📸', color: 'bg-pink-500 text-white',        prefix: 'https://instagram.com/',                  placeholder: 'username' },
  { id: 'tiktok',      label: 'TikTok',      icon: '🎵', color: 'bg-gray-900 text-white',        prefix: 'https://tiktok.com/@',                    placeholder: 'username' },
  { id: 'weibo',       label: '微博',         icon: '🌐', color: 'bg-red-500 text-white',         prefix: 'https://weibo.com/u/',                    placeholder: '用户名或ID' },
  { id: 'xiaohongshu', label: '小红书',       icon: '📕', color: 'bg-red-600 text-white',         prefix: 'https://www.xiaohongshu.com/user/profile/', placeholder: '用户ID' },
  { id: 'custom',      label: '其他',         icon: '🔗', color: 'bg-gray-500 text-white',        prefix: '',                                        placeholder: 'https://...' },
];

// Detect platform from a URL string
function detectPlatform(url: string) {
  if (!url) return null;
  if (url.includes('x.com')) return PLATFORMS[0];
  if (url.includes('twitter.com')) return PLATFORMS[1];
  if (url.includes('instagram.com')) return PLATFORMS[2];
  if (url.includes('tiktok.com')) return PLATFORMS[3];
  if (url.includes('weibo.com')) return PLATFORMS[4];
  if (url.includes('xiaohongshu.com')) return PLATFORMS[5];
  return PLATFORMS[6]; // custom
}

// Validate and normalize a URL
function normalizeUrl(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `https://${s}`;
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

// Social link badge shown on user cards
function SocialBadge({ url, lang }: { url: string; lang: string }) {
  const normalized = normalizeUrl(url);
  if (!isValidUrl(normalized)) return null;
  const platform = detectPlatform(normalized);
  const display = normalized.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return (
    <a
      href={normalized}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mt-1"
      onClick={e => e.stopPropagation()}
    >
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${platform?.color || 'bg-gray-500 text-white'}`}>
        {platform?.icon} {platform?.label}
      </span>
      <span className="text-xs text-gray-400 truncate max-w-[120px]">{display}</span>
    </a>
  );
}

// Quick greeting actions
const GREET_ACTIONS = [
  { id: 'poke',  emoji: '👉', zh: '戳一下',  en: 'Poke' },
  { id: 'hug',   emoji: '🤗', zh: '抱抱',    en: 'Hug' },
  { id: 'cheer', emoji: '💪', zh: '加油',    en: 'Cheer' },
  { id: 'pat',   emoji: '🫶', zh: '拍拍',    en: 'Pat' },
  { id: 'wave',  emoji: '👋', zh: '打招呼',  en: 'Wave' },
];

function GreetButtons({
  toUserId, fromUserId, emotion, lang,
}: {
  toUserId: string; fromUserId: string; emotion: string; lang: string;
}) {
  const [sent, setSent] = useState<string | null>(null);   // action id that was sent
  const [anim, setAnim] = useState<string | null>(null);   // currently animating
  const [blocked, setBlocked] = useState(false);

  const send = async (action: typeof GREET_ACTIONS[0]) => {
    if (blocked || sent) return;
    setAnim(action.id);
    setTimeout(() => setAnim(null), 700);

    const res = await fetch('/api/social/greet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId, action: action.id, emotion_label: emotion }),
    });
    if (res.status === 429) { setBlocked(true); return; }
    if (res.ok) setSent(action.id);
  };

  if (sent) {
    const a = GREET_ACTIONS.find(a => a.id === sent)!;
    return (
      <div className="flex items-center gap-1 text-xs text-green-500 font-medium mt-1">
        {a.emoji} {lang === 'zh' ? `已${a.zh}！` : `${a.en} sent!`}
      </div>
    );
  }

  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {GREET_ACTIONS.map(a => (
        <button
          key={a.id}
          onClick={() => send(a)}
          disabled={blocked}
          title={lang === 'zh' ? a.zh : a.en}
          className={`px-2 py-1 rounded-full text-xs border transition-all select-none
            ${anim === a.id ? 'scale-125 bg-purple-100 border-purple-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50'}
            ${blocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-110'}`}
          style={{ transition: 'transform 0.15s ease, background 0.15s ease' }}
        >
          {a.emoji}
        </button>
      ))}
    </div>
  );
}

// Social link input panel
function SocialLinkInput({
  userId, lang, onClose,
}: {
  userId: string; lang: string; onClose: () => void;
}) {
  const [platform, setPlatform] = useState('twitter');
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const selectedPlatform = PLATFORMS.find(p => p.id === platform)!;

  const buildLink = () => {
    const s = input.trim().replace(/^@/, '');
    if (!s) return '';
    if (platform === 'custom') return normalizeUrl(s);
    return `${selectedPlatform.prefix}${s}`;
  };

  const preview = buildLink();
  const valid = preview ? isValidUrl(preview) : false;

  const save = async () => {
    if (!valid) { setError(lang === 'zh' ? '链接格式不对' : 'Invalid URL'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/social/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, social_link: preview }),
      });
      if (res.ok) {
        setMsg(lang === 'zh' ? '✅ 已保存！' : '✅ Saved!');
        setTimeout(() => { setMsg(''); onClose(); }, 1500);
      } else {
        setError(lang === 'zh' ? '保存失败' : 'Save failed');
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-sm mx-auto mt-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 shadow space-y-3">
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-1">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => { setPlatform(p.id); setInput(''); setError(''); }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
              ${platform === p.id ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-center">
        {platform !== 'custom' && (
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 max-w-[100px] truncate" title={selectedPlatform.prefix}>
            {selectedPlatform.prefix}
          </span>
        )}
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
          placeholder={selectedPlatform.placeholder}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 min-w-0"
        />
        <button onClick={save} disabled={saving || !input.trim()}
          className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 disabled:opacity-50 whitespace-nowrap">
          {saving ? '...' : (lang === 'zh' ? '保存' : 'Save')}
        </button>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="flex items-center gap-2">
          {valid
            ? <a href={preview} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline truncate">{preview}</a>
            : <span className="text-xs text-red-400">{lang === 'zh' ? '链接格式不对' : 'Invalid URL'}</span>
          }
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {msg && <p className="text-xs text-green-500">{msg}</p>}
    </div>
  );
}

export function SameMoodPage({ userId, currentEmotion }: { userId: string; currentEmotion?: string }) {
  const { lang } = useLang();
  const [emotion, setEmotion] = useState(currentEmotion || '');
  const [users, setUsers] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

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
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '同心情广场' : 'Same Mood Plaza'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {lang === 'zh' ? '找到今天和你一样心情的人' : 'Find people who feel the same today'}
        </p>
        {!showLinkInput ? (
          <button onClick={() => setShowLinkInput(true)} className="text-xs text-purple-400 hover:text-purple-600 underline">
            📱 {lang === 'zh' ? '设置我的社交媒体链接' : 'Set my social media link'}
          </button>
        ) : (
          <SocialLinkInput userId={userId} lang={lang} onClose={() => setShowLinkInput(false)} />
        )}
      </div>

      {/* Emotion selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-gray-700 shadow">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {lang === 'zh' ? '选择今天的心情：' : "Pick today's mood:"}
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EMOTION_EMOJI).map(([e, emoji]) => (
            <button key={e} onClick={() => { setEmotion(e); search(e); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${emotion === e
                  ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'
                }`}>
              {emoji} {EMOTION_ZH[e]} / {e}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {emotion && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              {lang === 'zh' ? '搜索中...' : 'Searching...'}
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-gray-500">
                {lang === 'zh'
                  ? <>今天有 <span className="text-purple-600 font-bold">{count}</span> 人和你一样感到 {EMOTION_EMOJI[emotion]} {EMOTION_ZH[emotion]}</>
                  : <>{count} people feel {EMOTION_EMOJI[emotion]} {emotion} today</>
                }
              </p>

              {users.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                  <div className="text-4xl">{EMOTION_EMOJI[emotion]}</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {lang === 'zh' ? `你是今天第一个 ${EMOTION_ZH[emotion]} 的人` : `You're the first ${emotion} person today`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {lang === 'zh' ? '先去打卡，等待同心情的朋友出现' : 'Check in first, then wait for others'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-start gap-3 shadow-sm">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(u.users?.display_name || u.users?.username || '?')[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-50 text-sm truncate">
                            {u.users?.display_name || u.users?.username || '匿名用户'}
                          </p>
                          {u.streak > 1 && (
                            <span className="text-xs text-orange-500 font-semibold whitespace-nowrap">
                              🔥 {u.streak}{lang === 'zh' ? '天' : 'd'}
                            </span>
                          )}
                        </div>

                        {u.mood_text && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">"{u.mood_text}"</p>
                        )}

                        {/* Social link with platform badge */}
                        {u.users?.social_link && (
                          <SocialBadge url={u.users.social_link} lang={lang} />
                        )}

                        {/* Quick greet buttons — only for logged-in users, not self */}
                        {userId && u.user_id !== userId && (
                          <GreetButtons
                            toUserId={u.user_id}
                            fromUserId={userId}
                            emotion={emotion}
                            lang={lang}
                          />
                        )}
                      </div>

                      {/* Cat image thumbnail */}
                      {u.cat_image?.image_url && (
                        <img src={u.cat_image.image_url} alt="cat"
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
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
