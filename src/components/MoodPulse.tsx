import { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';

interface MoodStats {
  today: { ranking: Array<{ emotion: string; count: number; emoji: string }>; total: number };
  yesterday: { ranking: Array<{ emotion: string; count: number; emoji: string }>; total: number; top: string };
  forecast: { zh: string; en: string };
}

const EMOTION_ZH: Record<string, string> = {
  happy:'开心', calm:'平静', sleepy:'困', curious:'好奇', annoyed:'烦', anxious:'焦虑',
  resigned:'无奈', dramatic:'崩溃', sassy:'傲娇', clingy:'黏人', zoomies:'亢奋', suspicious:'怀疑',
  smug:'得意', confused:'懵', hangry:'饿', sad:'难过', angry:'生气', scared:'害怕',
  disgusted:'恶心', surprised:'惊讶', loved:'被爱', bored:'无聊', ashamed:'羞愧', tired:'累了',
  disappointed:'失望', melancholy:'惆怅',
};

export function MoodPulse() {
  const { lang } = useLang();
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'forecast'>('today');

  useEffect(() => {
    fetch('/api/social/calendar?action=stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-purple-100 dark:border-gray-700 shadow animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const top = stats.today.ranking[0];
  const maxCount = stats.today.ranking[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-gray-700 shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-50 text-base">
              🌍 {lang === 'zh' ? '全站情绪脉搏' : 'Global Mood Pulse'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {lang === 'zh'
                ? `今天共 ${stats.today.total} 人打卡`
                : `${stats.today.total} check-ins today`}
            </p>
          </div>
          {top && (
            <div className="text-right">
              <div className="text-2xl">{top.emoji}</div>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'zh' ? `${top.count}人` : `${top.count}`}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => setTab('today')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${tab === 'today' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {lang === 'zh' ? '📊 今日排行' : '📊 Today'}
          </button>
          <button
            onClick={() => setTab('forecast')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${tab === 'forecast' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {lang === 'zh' ? '🔮 情绪预报' : '🔮 Forecast'}
          </button>
        </div>
      </div>

      {/* Today's ranking */}
      {tab === 'today' && (
        <div className="px-5 pb-4 space-y-2">
          {stats.today.total === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              {lang === 'zh' ? '今天还没有人打卡，来第一个吧！' : 'No check-ins yet today — be the first!'}
            </p>
          ) : (
            stats.today.ranking.map((item, i) => (
              <div key={item.emotion} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4 text-right font-mono">{i + 1}</span>
                <span className="text-lg w-7 text-center">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {lang === 'zh' ? (EMOTION_ZH[item.emotion] || item.emotion) : item.emotion}
                    </span>
                    <span className="text-xs text-gray-400">{item.count}{lang === 'zh' ? '人' : ''}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${i === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-purple-200 dark:bg-purple-700'}`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Forecast */}
      {tab === 'forecast' && (
        <div className="px-5 pb-4 space-y-3">
          {/* Forecast message */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {lang === 'zh' ? stats.forecast.zh : stats.forecast.en}
            </p>
          </div>

          {/* Yesterday's top emotions */}
          {stats.yesterday.total > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">
                {lang === 'zh' ? `昨天 ${stats.yesterday.total} 人的情绪分布：` : `Yesterday's mood distribution (${stats.yesterday.total} people):`}
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.yesterday.ranking.map((item, i) => (
                  <div key={item.emotion}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                      ${i === 0
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                    <span>{item.emoji}</span>
                    <span>{lang === 'zh' ? (EMOTION_ZH[item.emotion] || item.emotion) : item.emotion}</span>
                    <span className="opacity-60">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.yesterday.total === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              {lang === 'zh' ? '昨天还没有数据' : 'No data from yesterday yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
