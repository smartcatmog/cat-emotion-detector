import React, { useState } from 'react';
import { useLang } from '../lib/i18n';

interface CatSignature {
  personality: string;
  emoji: string;
  subtitle: string;
  explanation: string;
  advice: string;
  notSuitableFor: string[];
  recoveryMethods: string[];
}

// Mock signature for MVP
const MOCK_SIGNATURE: CatSignature = {
  personality: '躲柜子猫',
  emoji: '🙈',
  subtitle: '今天的你，不想解释太多，只想先躲一会儿',
  explanation: '你不是不想面对，只是今天的能量不够支撑你继续装没事。你表面还在撑，但身体和心已经在往后退了。这不是懒，也不是矫情，是你的系统在请求降噪。',
  advice: '今天先别解决所有问题，只关掉一个让你分心的窗口。允许自己晚一点回复，不用立刻把所有人安顿好。找一个安静角落待 10 分钟，让自己先从"被看见"里退出来。',
  notSuitableFor: [
    '今天不适合硬撑着社交',
    '今天不适合逼自己做重大决定',
    '今天不适合跟耗你的人解释太多',
  ],
  recoveryMethods: ['独处', '睡眠', '安静', '逃离'],
};

export function CatSignaturePage() {
  const { lang } = useLang();
  const [showFullCard, setShowFullCard] = useState(true);
  const [selectedExit, setSelectedExit] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '✨ 今日猫系签' : '✨ Today\'s Cat Signature'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'zh' ? '看看今天哪只猫在懂你' : 'See which cat understands you today'}
        </p>
      </div>

      {/* Main Signature Card */}
      {showFullCard && (
        <div className="space-y-4">
          {/* Part 1: Cat Personality Result */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-700 text-center space-y-4">
            <div className="text-6xl">{MOCK_SIGNATURE.emoji}</div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {MOCK_SIGNATURE.personality}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {MOCK_SIGNATURE.subtitle}
              </p>
            </div>
          </div>

          {/* Part 2: Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '💭 被读懂的感觉' : '💭 Being Understood'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {MOCK_SIGNATURE.explanation}
            </p>
          </div>

          {/* Part 3: Light Advice */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '🌱 一个轻建议' : '🌱 A Light Suggestion'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {MOCK_SIGNATURE.advice}
            </p>
          </div>

          {/* Part 4: Not Suitable For */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '✗ 今天不适合' : '✗ Not Suitable Today'}
            </h3>
            <div className="space-y-2">
              {MOCK_SIGNATURE.notSuitableFor.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Part 5: Exit Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">
              {lang === 'zh' ? '📤 接下来呢？' : '📤 What\'s Next?'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedExit('treehouse')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedExit === 'treehouse'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-50">
                  {lang === 'zh' ? '🌳 写进树洞' : '🌳 Share in Treehouse'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'zh' ? '把这个签分享给同频的人' : 'Share with people on the same wavelength'}
                </p>
              </button>

              <button
                onClick={() => setSelectedExit('archive')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedExit === 'archive'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-50">
                  {lang === 'zh' ? '📚 存进猫档案' : '📚 Save to Archive'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'zh' ? '积累你的情绪记录，看见自己的模式' : 'Build your emotional record and see patterns'}
                </p>
              </button>

              <button
                onClick={() => setSelectedExit('again')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedExit === 'again'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-50">
                  {lang === 'zh' ? '🎲 再抽一张' : '🎲 Draw Again'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'zh' ? '也许有更温柔的猫在等你' : 'Maybe a gentler cat is waiting'}
                </p>
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          {selectedExit && (
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
              {lang === 'zh'
                ? selectedExit === 'treehouse'
                  ? '发布到树洞'
                  : selectedExit === 'archive'
                  ? '保存到档案'
                  : '再抽一张'
                : selectedExit === 'treehouse'
                ? 'Share to Treehouse'
                : selectedExit === 'archive'
                ? 'Save to Archive'
                : 'Draw Again'}
            </button>
          )}
        </div>
      )}

      {/* Recovery Methods Reference */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '💚 你的恢复方式' : '💚 Your Recovery Methods'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {MOCK_SIGNATURE.recoveryMethods.map((method) => (
            <span
              key={method}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-700"
            >
              {method}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {lang === 'zh'
            ? '系统已记录你的恢复模式。下次当你处于类似状态时，会优先推荐这些方式。'
            : 'System has recorded your recovery pattern. Next time, these methods will be recommended first.'}
        </p>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-700 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          {lang === 'zh' ? '💡 小贴士' : '💡 Tip'}
        </p>
        <p>
          {lang === 'zh'
            ? '每天抽一张签，系统会越来越懂你。你的猫档案会记录你的情绪节奏，帮你看见自己的恢复规律。'
            : 'Draw a signature every day. The system will understand you better. Your archive will show your emotional rhythm and recovery patterns.'}
        </p>
      </div>
    </div>
  );
}
