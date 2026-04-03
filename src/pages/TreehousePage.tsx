import { useState, useEffect } from 'react';import { useLang } from '../lib/i18n';

const EMOTION_EMOJI: Record<string, string> = {
  happy:'😸',calm:'😌',sleepy:'😴',curious:'🐱',annoyed:'😾',anxious:'🙀',
  resigned:'😑',dramatic:'💀',sassy:'💅',clingy:'🥺',zoomies:'⚡',suspicious:'🤨',
  smug:'😏',confused:'😵',hangry:'🍽️',sad:'😢',angry:'😡',scared:'😨',
  disgusted:'🤢',surprised:'😲',loved:'🥰',bored:'😒',ashamed:'😳',tired:'😮‍💨',
  disappointed:'😞',melancholy:'🌧️',
};
const EMOTION_ZH: Record<string, string> = {
  happy:'开心',calm:'平静',sleepy:'困',curious:'好奇',annoyed:'烦',anxious:'焦虑',
  resigned:'无奈',dramatic:'崩溃',sassy:'傲娇',clingy:'黏人',zoomies:'亢奋',suspicious:'怀疑',
  smug:'得意',confused:'懵',hangry:'饿',sad:'难过',angry:'生气',scared:'害怕',
  disgusted:'恶心',surprised:'惊讶',loved:'被爱',bored:'无聊',ashamed:'羞愧',tired:'累了',
  disappointed:'失望',melancholy:'惆怅',
};

function PostCard({ post, userId, lang }: { post: any; userId?: string; lang: string }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyAnon, setReplyAnon] = useState(true);
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [catImage, setCatImage] = useState<string | null>(null);

  // Load a matching cat image for the post's emotion
  useEffect(() => {
    if (post.emotion_label) {
      fetch('/api/mood-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: post.emotion_label }),
      }).then(r => r.json()).then(d => {
        const cats = d.data?.cats || [];
        if (cats.length > 0) setCatImage(cats[0].image_url);
      }).catch(() => {});
    }
  }, [post.emotion_label]);

  const loadReplies = async () => {
    const res = await fetch(`/api/social/same-mood?action=treehouse-reply&post_id=${post.id}`);
    const d = await res.json();
    setReplies(d.data || []);
  };

  const toggleReplies = () => {
    if (!showReplies) loadReplies();
    setShowReplies(v => !v);
  };

  const sendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/social/same-mood?action=treehouse-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, user_id: userId || null, content: replyText.trim(), is_anonymous: replyAnon }),
      });
      const d = await res.json();
      if (res.ok && d.data) {
        setReplies(prev => [...prev, { ...d.data, author: replyAnon ? null : { display_name: '你' } }]);
        setReplyText('');
        setShowReplies(true);
      }
    } finally { setSending(false); }
  };

  const like = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((n: number) => n + 1);
    await fetch('/api/social/same-mood?action=treehouse-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    });
  };

  const authorName = post.is_anonymous
    ? (lang === 'zh' ? '匿名猫友' : 'Anonymous')
    : (post.author?.display_name || post.author?.username || (lang === 'zh' ? '猫友' : 'User'));

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === 'zh' ? '刚刚' : 'just now';
    if (mins < 60) return lang === 'zh' ? `${mins}分钟前` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === 'zh' ? `${hrs}小时前` : `${hrs}h ago`;
    return lang === 'zh' ? `${Math.floor(hrs/24)}天前` : `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Author + emotion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
              ${post.is_anonymous ? 'bg-gray-400' : 'bg-gradient-to-br from-purple-400 to-pink-400'}`}>
              {post.is_anonymous ? '?' : authorName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{authorName}</p>
              <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {post.emotion_label && (
            <span className="text-lg" title={lang === 'zh' ? EMOTION_ZH[post.emotion_label] : post.emotion_label}>
              {EMOTION_EMOJI[post.emotion_label] || '🐱'}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{post.content}</p>

        {/* Matched cat image */}
        {catImage && (
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2.5">
            <img src={catImage} alt="mood cat" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {lang === 'zh' ? '🐱 这只猫懂你的感受' : '🐱 This cat understands'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1">
          <button onClick={like} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
            {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : (lang === 'zh' ? '共鸣' : 'Relate')}
          </button>
          <button onClick={toggleReplies} className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-500 transition-colors">
            💬 {post.reply_count > 0 ? post.reply_count : ''} {lang === 'zh' ? '回复' : 'Reply'}
          </button>
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="border-t border-gray-50 dark:border-gray-700 px-4 py-3 space-y-3 bg-gray-50/50 dark:bg-gray-700/20">
          {replies.map(r => (
            <div key={r.id} className="flex gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                ${r.is_anonymous ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-400 to-cyan-400'}`}>
                {r.is_anonymous ? '?' : (r.author?.display_name || r.author?.username || '?')[0]}
              </div>
              <div className="flex-1 bg-white dark:bg-gray-700 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  {r.is_anonymous ? (lang === 'zh' ? '匿名' : 'Anonymous') : (r.author?.display_name || r.author?.username || (lang === 'zh' ? '猫友' : 'User'))}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{r.content}</p>
              </div>
            </div>
          ))}

          {/* Reply input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendReply(); }}
                placeholder={lang === 'zh' ? '说点什么...' : 'Say something...'}
                maxLength={300}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <button onClick={sendReply} disabled={sending || !replyText.trim()}
                className="px-3 py-2 bg-purple-500 text-white rounded-xl text-xs font-medium hover:bg-purple-600 disabled:opacity-40">
                {sending ? '...' : (lang === 'zh' ? '发' : 'Send')}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={replyAnon} onChange={e => setReplyAnon(e.target.checked)}
                className="rounded" />
              {lang === 'zh' ? '匿名回复' : 'Reply anonymously'}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function TreehousePage({ userId }: { userId?: string }) {
  const { lang } = useLang();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isAnon, setIsAnon] = useState(true);
  const [posting, setPosting] = useState(false);
  const [filterEmotion, setFilterEmotion] = useState('');
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [matchedCat, setMatchedCat] = useState<any>(null); // cat matched after posting

  const load = async (emotionFilter = filterEmotion) => {
    setLoading(true);
    const url = `/api/social/same-mood?action=treehouse${emotionFilter ? `&emotion=${emotionFilter}` : ''}`;
    const res = await fetch(url);
    const d = await res.json();
    setPosts(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    setMatchedCat(null);
    try {
      const res = await fetch('/api/social/same-mood?action=treehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId || null, content: content.trim(), emotion_label: emotion || null, is_anonymous: isAnon }),
      });
      const d = await res.json();
      if (res.ok && d.data) {
        setPosts(prev => [{ ...d.data, reply_count: 0, author: isAnon ? null : { display_name: '你' } }, ...prev]);
        setContent('');

        // Fetch a matching cat for the emotion
        if (emotion) {
          const catRes = await fetch('/api/mood-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood_text: emotion }),
          });
          const catData = await catRes.json();
          const cats = catData.data?.cats || [];
          if (cats.length > 0) setMatchedCat(cats[Math.floor(Math.random() * Math.min(cats.length, 3))]);
        }
        setEmotion('');
      }
    } finally { setPosting(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          🌳 {lang === 'zh' ? '情绪树洞' : 'Mood Tree Hole'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {lang === 'zh' ? '说出来，就轻松了一点' : 'Say it out loud — it helps'}
        </p>
      </div>

      {/* Post composer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 shadow p-4 space-y-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={lang === 'zh' ? '今天想说点什么？可以是烦恼、开心、或者什么都行...' : "What's on your mind today? Vent, celebrate, or just say hi..."}
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 resize-none focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Emotion tag */}
          <button onClick={() => setShowEmotionPicker(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-300 transition-all">
            {emotion ? `${EMOTION_EMOJI[emotion]} ${lang === 'zh' ? EMOTION_ZH[emotion] : emotion}` : (lang === 'zh' ? '+ 添加情绪' : '+ Add mood')}
          </button>
          {/* Anonymous toggle */}
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-auto">
            <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} className="rounded" />
            {lang === 'zh' ? '匿名发布' : 'Post anonymously'}
          </label>
          <button onClick={post} disabled={posting || !content.trim()}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity">
            {posting ? '...' : (lang === 'zh' ? '发布' : 'Post')}
          </button>
        </div>
        {showEmotionPicker && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(EMOTION_EMOJI).map(([e, emoji]) => (
              <button key={e} onClick={() => { setEmotion(emotion === e ? '' : e); setShowEmotionPicker(false); }}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all
                  ${emotion === e ? 'bg-purple-100 border-purple-400 text-purple-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>
                {emoji} {lang === 'zh' ? EMOTION_ZH[e] : e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Matched cat after posting */}
      {matchedCat && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 p-4 flex gap-4 items-center">
          <img src={matchedCat.image_url} alt="matched cat" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-md" />
          <div>
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">
              🐱 {lang === 'zh' ? '这只猫懂你' : 'This cat gets you'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {matchedCat.description || (lang === 'zh' ? '它也有同样的感受' : 'It feels the same way')}
            </p>
            <button onClick={() => setMatchedCat(null)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
              {lang === 'zh' ? '关闭' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => { setFilterEmotion(''); load(''); }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
            ${!filterEmotion ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
          {lang === 'zh' ? '全部' : 'All'}
        </button>
        {Object.entries(EMOTION_EMOJI).slice(0, 10).map(([e, emoji]) => (
          <button key={e} onClick={() => { setFilterEmotion(e); load(e); }}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${filterEmotion === e ? 'bg-purple-100 border-purple-400 text-purple-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>
            {emoji} {lang === 'zh' ? EMOTION_ZH[e] : e}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">🌳</div>
          <p className="text-gray-500">{lang === 'zh' ? '还没有人说话，来第一个吧' : 'No posts yet — be the first!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => <PostCard key={p.id} post={p} userId={userId} lang={lang} />)}
        </div>
      )}
    </div>
  );
}
