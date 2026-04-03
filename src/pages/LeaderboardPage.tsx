import { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😸', calm: '😌', sleepy: '😴', curious: '🐱', annoyed: '😾',
  anxious: '🙀', resigned: '😑', dramatic: '💀', sassy: '💅', clingy: '🥺',
  zoomies: '⚡', suspicious: '🤨', smug: '😏', confused: '😵', hangry: '🍽️',
  sad: '😢', angry: '😡', scared: '😨', disgusted: '🤢', surprised: '😲',
  loved: '🥰', bored: '😒', ashamed: '😳', tired: '😮‍💨', disappointed: '😞',
  melancholy: '🌧️',
};

const MEDALS = ['🥇', '🥈', '🥉'];

type LeaderboardType = 'popular_cats' | 'contributors' | 'collectors' | 'streaks';
type Period = 'week' | 'month' | 'all';

export function LeaderboardPage() {
  const { lang } = useLang();
  const [type, setType] = useState<LeaderboardType>('popular_cats');
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const url = `/api/social/leaderboard?type=${type}&period=${period}`;
      const res = await fetch(url);
      const d = await res.json();
      setData(d.data || []);
      setLoading(false);
    };
    load();
  }, [type, period]);

  const typeLabels = {
    popular_cats: lang === 'zh' ? '最受欢迎猫咪' : 'Popular Cats',
    contributors: lang === 'zh' ? '情绪贡献榜' : 'Contributors',
    collectors: lang === 'zh' ? '收藏大师榜' : 'Collectors',
    streaks: lang === 'zh' ? '连续打卡榜' : 'Streaks',
  };

  const periodLabels = {
    week: lang === 'zh' ? '周榜' : 'Week',
    month: lang === 'zh' ? '月榜' : 'Month',
    all: lang === 'zh' ? '总榜' : 'All Time',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          🏆 {lang === 'zh' ? '排行榜' : 'Leaderboard'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {lang === 'zh' ? '看看谁是最棒的猫友' : 'See who\'s the best cat lover'}
        </p>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.entries(typeLabels) as [LeaderboardType, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${type === t
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period Selector (only for popular_cats) */}
      {type === 'popular_cats' && (
        <div className="flex gap-2 justify-center">
          {(Object.entries(periodLabels) as [Period, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${period === p
                  ? 'bg-purple-100 border-purple-400 text-purple-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          {lang === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">🏆</div>
          <p className="text-gray-500">
            {lang === 'zh' ? '还没有数据' : 'No data yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 border transition-all
                ${idx < 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="text-3xl font-bold w-12 text-center">
                  {idx < 3 ? MEDALS[idx] : `#${item.rank}`}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {type === 'popular_cats' && (
                    <div className="flex gap-3 items-start">
                      <img
                        src={item.image_url}
                        alt={item.pet_name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{EMOTION_EMOJI[item.emotion_label] || '🐱'}</span>
                          <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                            {item.pet_name || 'Unnamed Cat'}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-pink-600 dark:text-pink-400 mt-1">
                          ❤️ {item.likes_count} {lang === 'zh' ? '点赞' : 'likes'}
                        </p>
                      </div>
                    </div>
                  )}

                  {type === 'contributors' && (
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.user?.display_name?.[0] || item.user?.username?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                          {item.user?.display_name || item.user?.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.upload_count} {lang === 'zh' ? '张猫图' : 'uploads'}
                          {item.top_emotion && ` • ${EMOTION_EMOJI[item.top_emotion]} ${item.top_emotion}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {type === 'collectors' && (
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.user?.display_name?.[0] || item.user?.username?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                          {item.user?.display_name || item.user?.username}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                              style={{ width: `${(item.unlocked_count / item.total_count) * 100}%` }}
                            />
                          </div>
                          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                            {item.unlocked_count}/{item.total_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {type === 'streaks' && (
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.user?.display_name?.[0] || item.user?.username?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                          {item.user?.display_name || item.user?.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          🔥 {item.streak_days} {lang === 'zh' ? '天连续打卡' : 'day streak'}
                          {item.current_emotion && ` • ${EMOTION_EMOJI[item.current_emotion]}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
