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

interface DayRecord { date: string; emotion_label: string; mood_text?: string; }

export function CalendarPage({ userId, onManualCheckin }: { userId: string; onManualCheckin?: (emotion: string) => void }) {
  const { lang } = useLang();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);

  const doCheckin = async (emotion: string) => {
    setCheckinLoading(true);
    try {
      const r = await fetch('/api/social/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, emotion_label: emotion }),
      });
      const d = await r.json();
      if (!r.ok) { setCheckinMsg(lang === 'zh' ? `❌ 打卡失败: ${d.error}` : `❌ Check-in failed: ${d.error}`); return; }
      if (d.lootbox) setCheckinMsg(lang === 'zh' ? '🎉 打卡成功！获得一个盲盒' : '🎉 Checked in! You got a loot box');
      else setCheckinMsg(lang === 'zh' ? '✅ 打卡成功' : '✅ Checked in!');
      // Refresh calendar
      const res = await fetch(`/api/social/calendar?user_id=${userId}&year=${year}&month=${month}`);
      const cal = await res.json();
      setRecords(cal.data || []);
      setStreak(cal.streak || 0);
    } finally {
      setCheckinLoading(false);
      setTimeout(() => setCheckinMsg(null), 3000);
    }
  };

  useEffect(() => {
    setLoading(true);
    setRecords([]); // clear stale data immediately
    fetch(`/api/social/calendar?user_id=${userId}&year=${year}&month=${month}`)
      .then(r => r.json())
      .then(d => { setRecords(d.data || []); setStreak(d.streak || 0); })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [userId, year, month]);

  const recordMap: Record<string, DayRecord> = {};
  records.forEach(r => { recordMap[r.date] = r; });

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '情绪日历' : 'Mood Calendar'}
        </h2>
        {streak > 0 && (
          <p className="text-purple-600 font-semibold">
            🔥 {lang === 'zh' ? `已连续记录 ${streak} 天` : `${streak}-day streak`}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-purple-100 dark:border-gray-700">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">‹</button>
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {lang === 'zh' ? `${year}年${month}月` : `${new Date(year, month-1).toLocaleString('en', {month:'long'})} ${year}`}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['日','一','二','三','四','五','六'].map((d, i) => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">
              {lang === 'zh' ? d : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const record = recordMap[dateStr];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={dateStr}
                  title={record ? `${record.emotion_label}${record.mood_text ? ': ' + record.mood_text : ''}` : ''}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
                    ${isToday ? 'ring-2 ring-purple-400' : ''}
                    ${record ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}
                  `}
                >
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">{day}</span>
                  {record && <span className="text-base leading-none">{EMOTION_EMOJI[record.emotion_label] || '🐱'}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        {lang === 'zh' ? '每次心情匹配后自动打卡记录' : 'Auto check-in after each mood match'}
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-gray-700 shadow space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
          {lang === 'zh' ? '今天还没打卡？选一个心情手动记录：' : "Haven't checked in today? Pick a mood:"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(EMOTION_EMOJI).slice(0, 8).map(([e, emoji]) => (
            <button key={e} onClick={() => doCheckin(e)} disabled={checkinLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all disabled:opacity-50">
              {emoji} {lang === 'zh' ? EMOTION_ZH[e] : e}
            </button>
          ))}
          <button onClick={() => doCheckin('happy')} disabled={checkinLoading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200 transition-all disabled:opacity-50">
            {checkinLoading ? (lang === 'zh' ? '记录中...' : 'Saving...') : (lang === 'zh' ? '更多 →' : 'More →')}
          </button>
        </div>
        {checkinMsg && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">{checkinMsg}</p>
        )}
      </div>
    </div>
  );
}
