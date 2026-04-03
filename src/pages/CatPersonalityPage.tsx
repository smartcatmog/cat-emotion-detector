import React, { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../hooks/useAuth';
import { getThisWeekSignatures } from '../lib/supabase';

const PERSONALITY_NAMES: Record<string, string> = {
  clingy: '粘人猫',
  spiky: '炸毛猫',
  hiding: '躲柜子猫',
  aloof: '高冷观察猫',
  sleepy: '困困猫',
  frantic: '暴冲猫',
  sad: '委屈猫',
  curious: '好奇猫',
  sunny: '晒太阳猫',
};

const PERSONALITY_EMOJIS: Record<string, string> = {
  clingy: '🥺',
  spiky: '😾',
  hiding: '🙈',
  aloof: '😼',
  sleepy: '😴',
  frantic: '⚡',
  sad: '😢',
  curious: '🐱',
  sunny: '😸',
};

const PERSONALITY_COLORS: Record<string, string> = {
  clingy: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300',
  spiky: 'bg-red-100 dark:bg-red-900/30 border-red-300',
  hiding: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
  aloof: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300',
  sleepy: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
  frantic: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
  sad: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300',
  curious: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300',
  sunny: 'bg-green-100 dark:bg-green-900/30 border-green-300',
};

export function CatPersonalityPage({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { lang } = useLang();
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const loadWeekData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const signatures = await getThisWeekSignatures(user.id);
        
        // Format signatures into week view (last 7 days)
        const today = new Date();
        const weekDays = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthDate = date.getDate();
          
          const signature = signatures.find(s => 
            s.created_at.split('T')[0] === dateStr
          );
          
          weekDays.push({
            day: dayNames[date.getDay()],
            date: `${date.getMonth() + 1}/${monthDate}`,
            personality: signature?.personality_id || 'sleepy',
            emoji: PERSONALITY_EMOJIS[signature?.personality_id || 'sleepy'] || '😴',
            fullData: signature,
          });
        }
        
        setWeekData(weekDays);
      } catch (error) {
        console.error('Error loading week data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeekData();
  }, [user?.id]);

  // Calculate week summary
  const personalityCounts = weekData.reduce((acc, day) => {
    acc[day.personality] = (acc[day.personality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonEntry = Object.entries(personalityCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  const mostCommon: [string, number] = mostCommonEntry ? [mostCommonEntry[0], mostCommonEntry[1] as number] : ['sleepy', 0];
  const recoveryPath = weekData.map(d => d.personality);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '📅 我的猫人格周记' : '📅 My Cat Personality Week'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'zh' ? '看看这周你经历了什么' : 'See your emotional journey this week'}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          {lang === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : !user ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-700 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            {lang === 'zh' ? '请登录查看你的猫人格周记' : 'Sign in to see your cat personality week'}
          </p>
        </div>
      ) : weekData.every(d => !d.fullData) ? (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-700 text-center space-y-4">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {lang === 'zh' ? '还没有猫签记录呢' : 'No cat signatures yet'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'zh' 
              ? '生成你的第一张猫系签，开始记录你的情绪旅程吧' 
              : 'Generate your first cat signature to start your emotional journey'}
          </p>
          <button 
            onClick={() => onNavigate?.('cat-signature')}
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
            {lang === 'zh' ? '✨ 生成今日猫系签' : '✨ Generate Cat Signature'}
          </button>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '这周的你' : 'Your Week'}
            </h2>
            
            <div className="grid grid-cols-7 gap-2">
              {weekData.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selectedDay === idx
                      ? `${PERSONALITY_COLORS[day.personality]} border-current`
                      : `${PERSONALITY_COLORS[day.personality]} border-transparent hover:border-current`
                  }`}
                >
                  <span className="text-2xl">{day.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{day.day}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{day.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Detail */}
          {selectedDay !== null && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-700 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{weekData[selectedDay].emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                    {PERSONALITY_NAMES[weekData[selectedDay].personality]}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weekData[selectedDay].day}, {weekData[selectedDay].date}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  {lang === 'zh'
                    ? '这一天你的状态是：需要空间、让神经系统放松'
                    : 'Your state: Need space, let nervous system relax'}
                </p>
                {weekData[selectedDay].fullData && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {lang === 'zh' ? '心情：' : 'Mood: '}{weekData[selectedDay].fullData.mood_input}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Week Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '本周总结' : 'Weekly Summary'}
            </h2>

            {/* Most Common */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {lang === 'zh' ? '这周最常出现的是：' : 'Most common this week:'}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {PERSONALITY_EMOJIS[mostCommon[0]]}
                </span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-50">
                    {PERSONALITY_NAMES[mostCommon[0]]} ({(mostCommon[1] as number)} {lang === 'zh' ? '天' : 'days'})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === 'zh'
                      ? '你这周经历了不少压力和变化'
                      : 'You experienced changes this week'}
                  </p>
                </div>
              </div>
            </div>

            {/* High Pressure Time */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-100 dark:border-red-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {lang === 'zh' ? '高压时段集中在：' : 'High pressure time:'}
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '周一到周四（工作日中段）' : 'Monday to Thursday (mid-week)'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {lang === 'zh'
                  ? '这是典型的周中压力积累，周末开始恢复'
                  : 'Typical mid-week pressure, recovery starts on weekends'}
              </p>
            </div>

            {/* Recovery Method */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {lang === 'zh' ? '让你恢复的方式是：' : 'Your recovery method:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {['独处', '睡眠', '陪伴'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1 bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 rounded-full text-xs font-medium"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recovery Journey */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '情绪恢复线' : 'Recovery Journey'}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'zh'
                ? '你并不是一直在下坠。看看你是如何从压力中恢复的：'
                : "You're not always falling. See how you recovered from stress:"}
            </p>

            {/* Recovery Timeline */}
            <div className="space-y-3">
              {weekData.map((day, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{day.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-50">
                        {day.day}：{PERSONALITY_NAMES[day.personality]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {day.date}
                      </p>
                    </div>
                  </div>
                  {idx < weekData.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="text-2xl text-green-500">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key Insight */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-700 mt-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {lang === 'zh' ? '💡 关键发现' : '💡 Key Insight'}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {lang === 'zh'
                  ? '你的情绪节奏很清晰。系统会记录你的恢复模式，帮你更好地理解自己。'
                  : 'Your emotional rhythm is clear. The system will help you understand your recovery patterns better.'}
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center space-y-3">
            <p className="font-bold text-lg">
              {lang === 'zh' ? '今天你是哪只猫？' : 'Which cat are you today?'}
            </p>
            <button 
              onClick={() => onNavigate?.('cat-signature')}
              className="w-full px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              {lang === 'zh' ? '生成今日猫系签' : 'Generate Today\'s Cat Signature'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
