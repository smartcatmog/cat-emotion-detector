import React, { useState } from 'react';
import { useLang } from '../lib/i18n';

// Mock data for MVP - simulating a week of mood tracking
const MOCK_WEEK_DATA = [
  { day: 'Mon', date: '3/24', personality: 'spiky', emoji: '😾' },
  { day: 'Tue', date: '3/25', personality: 'hiding', emoji: '🙈' },
  { day: 'Wed', date: '3/26', personality: 'sleepy', emoji: '😴' },
  { day: 'Thu', date: '3/27', personality: 'clingy', emoji: '🥺' },
  { day: 'Fri', date: '3/28', personality: 'curious', emoji: '🐱' },
  { day: 'Sat', date: '3/29', personality: 'sunny', emoji: '😸' },
  { day: 'Sun', date: '3/30', personality: 'sunny', emoji: '😸' },
];

const PERSONALITY_NAMES: Record<string, string> = {
  spiky: '炸毛猫',
  hiding: '躲柜子猫',
  sleepy: '困困猫',
  clingy: '粘人猫',
  curious: '好奇猫',
  sunny: '晒太阳猫',
  aloof: '高冷观察猫',
  frantic: '暴冲猫',
  sad: '委屈猫',
};

const PERSONALITY_COLORS: Record<string, string> = {
  spiky: 'bg-red-100 dark:bg-red-900/30 border-red-300',
  hiding: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
  sleepy: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
  clingy: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300',
  curious: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300',
  sunny: 'bg-green-100 dark:bg-green-900/30 border-green-300',
  aloof: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300',
  frantic: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
  sad: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300',
};

export function CatPersonalityPage() {
  const { lang } = useLang();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Calculate week summary
  const personalityCounts = MOCK_WEEK_DATA.reduce((acc, day) => {
    acc[day.personality] = (acc[day.personality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(personalityCounts).sort((a, b) => b[1] - a[1])[0];
  const recoveryPath = MOCK_WEEK_DATA.map(d => d.personality);

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

      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '这周的你' : 'Your Week'}
        </h2>
        
        <div className="grid grid-cols-7 gap-2">
          {MOCK_WEEK_DATA.map((day, idx) => (
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
            <span className="text-4xl">{MOCK_WEEK_DATA[selectedDay].emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {PERSONALITY_NAMES[MOCK_WEEK_DATA[selectedDay].personality]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {MOCK_WEEK_DATA[selectedDay].day}, {MOCK_WEEK_DATA[selectedDay].date}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {lang === 'zh'
                ? '这一天你的状态是：需要空间、让神经系统放松'
                : 'Your state: Need space, let nervous system relax'}
            </p>
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
              {lang === 'zh' ? '查看完整猫系签' : 'View Full Cat Signature'}
            </button>
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
              {MOCK_WEEK_DATA.find(d => d.personality === mostCommon[0])?.emoji}
            </span>
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-50">
                {PERSONALITY_NAMES[mostCommon[0]]} ({mostCommon[1]} 天)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '你这周经历了不少压力和疲惫'
                  : 'You experienced stress and fatigue this week'}
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
              : 'Typical mid-week pressure accumulation, recovery starts on weekends'}
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
          <div className="flex items-center gap-3">
            <span className="text-2xl">😾</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">周一：炸毛猫</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">高压、烦躁</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-2xl text-green-500">↓</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🙈</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">周二-周三：躲柜子猫 → 困困猫</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">逃避、休息（2天）</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-2xl text-green-500">↓</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🥺</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">周四：粘人猫</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">需要陪伴、确认</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-2xl text-green-500">↓</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🐱</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">周五：好奇猫</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">状态回升、愿意探索</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-2xl text-green-500">↓</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">😸</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">周末：晒太阳猫</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">平静、恢复、享受</p>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-700 mt-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
            {lang === 'zh' ? '💡 关键发现' : '💡 Key Insight'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {lang === 'zh'
              ? '你从"炸毛"到"晒太阳"用了 5 天。你的恢复方式是：先逃离 → 再休息 → 然后需要陪伴 → 最后才能探索。这是你的节奏，很健康。'
              : 'You went from "spiky" to "sunny" in 5 days. Your recovery pattern: escape → rest → need support → explore. This is your rhythm, and it\'s healthy.'}
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center space-y-3">
        <p className="font-bold text-lg">
          {lang === 'zh' ? '今天你是哪只猫？' : 'Which cat are you today?'}
        </p>
        <button className="w-full px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
          {lang === 'zh' ? '生成今日猫系签' : 'Generate Today\'s Cat Signature'}
        </button>
      </div>
    </div>
  );
}
