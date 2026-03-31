import { useState, useEffect } from 'react';

const EMOTION_EMOJI: Record<string, string> = {
  happy:'😸',calm:'😌',sleepy:'😴',curious:'🐱',annoyed:'😾',anxious:'🙀',
  resigned:'😑',dramatic:'💀',sassy:'💅',clingy:'🥺',zoomies:'⚡',suspicious:'🤨',
  smug:'😏',confused:'😵',hangry:'🍽️',sad:'😢',angry:'😡',scared:'😨',
  disgusted:'🤢',surprised:'😲',loved:'🥰',bored:'😒',ashamed:'😳',tired:'😮‍💨',
  disappointed:'😞',melancholy:'🌧️',
};

interface DayRecord { date: string; emotion_label: string; mood_text?: string; }

export function CalendarPage({ userId }: { userId: string }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/social/calendar?user_id=${userId}&year=${year}&month=${month}`)
      .then(r => r.json())
      .then(d => { setRecords(d.data || []); setStreak(d.streak || 0); })
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">情绪日历</h2>
        {streak > 0 && (
          <p className="text-purple-600 font-semibold">🔥 已连续记录 {streak} 天</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-purple-100 dark:border-gray-700">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">‹</button>
          <span className="font-semibold text-gray-900 dark:text-gray-50">{year}年{month}月</span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
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

      <p className="text-center text-xs text-gray-400">每次心情匹配后自动打卡记录</p>
    </div>
  );
}
