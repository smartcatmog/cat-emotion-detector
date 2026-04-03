import React, { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';
import { saveCatSignature, getThisWeekSignatures } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface CatSignature {
  personality: string;
  emoji: string;
  subtitle: string;
  explanation: string;
  advice: string;
  notSuitableFor: string[];
  recoveryMethods: string[];
}

// Cat personality content library
const CAT_CONTENT: Record<string, CatSignature> = {
  clingy: {
    personality: '粘人猫',
    emoji: '🥺',
    subtitle: '今天的你，需要被接住、渴望陪伴',
    explanation: '你不是太依赖，只是今天的能量需要被看见。你在等一个确认：我在这里，你不是一个人。这种需要很正常，是你的系统在寻求连接。',
    advice: '今天不用独自承受。找一个信任的人，告诉他们你现在的感受。不需要解决问题，只需要被听见。一个拥抱、一条消息、一通电话都可以。',
    notSuitableFor: ['今天不适合独自处理重要决定', '今天不适合强行独立', '今天不适合被冷落'],
    recoveryMethods: ['陪伴', '倾诉', '被理解', '拥抱'],
  },
  spiky: {
    personality: '炸毛猫',
    emoji: '😾',
    subtitle: '今天的你，烦躁、防御、容易应激',
    explanation: '你不是坏脾气，只是今天的神经系统超载了。每一个小事都像被放大了十倍。这不是你的错，是你的系统在过度保护你。',
    advice: '今天给自己一个"隔离区"。关掉不必要的通知，远离容易激怒你的人和事。如果可能，找一个安静的地方，让自己的神经系统慢下来。',
    notSuitableFor: ['今天不适合做重要决定', '今天不适合处理冲突', '今天不适合被催促'],
    recoveryMethods: ['独处', '运动', '冷静', '深呼吸'],
  },
  hiding: {
    personality: '躲柜子猫',
    emoji: '🙈',
    subtitle: '今天的你，疲惫、逃避、想关机',
    explanation: '你不是不想面对，只是今天的能量不够支撑你继续装没事。你表面还在撑，但身体和心已经在往后退了。这不是懒，也不是矫情，是你的系统在请求降噪。',
    advice: '今天先别解决所有问题，只关掉一个让你分心的窗口。允许自己晚一点回复，不用立刻把所有人安顿好。找一个安静角落待 10 分钟，让自己先从"被看见"里退出来。',
    notSuitableFor: ['今天不适合硬撑着社交', '今天不适合逼自己做重大决定', '今天不适合跟耗你的人解释太多'],
    recoveryMethods: ['独处', '睡眠', '安静', '逃离'],
  },
  aloof: {
    personality: '高冷观察猫',
    emoji: '😼',
    subtitle: '今天的你，冷静、抽离、想自己待着',
    explanation: '你不是冷漠，只是今天需要用理性来保护自己。你在观察、在思考、在给自己空间。这是你的智慧，不是距离。',
    advice: '今天就让自己保持这种清醒。不用强行融入，不用假装热情。你的冷静是一种力量，让它发挥作用。',
    notSuitableFor: ['今天不适合被强行参与', '今天不适合被要求热情', '今天不适合被打扰思考'],
    recoveryMethods: ['思考', '观察', '独处', '阅读'],
  },
  sleepy: {
    personality: '困困猫',
    emoji: '😴',
    subtitle: '今天的你，能量低、提不起劲',
    explanation: '你不是懒，只是今天的电池没电了。你的身体在告诉你：我需要休息。这是一个信号，不是失败。',
    advice: '今天就让自己慢下来。不用赶进度，不用证明自己。睡眠、休息、做一些舒服的事。你的能量会回来的。',
    notSuitableFor: ['今天不适合高强度工作', '今天不适合做决定', '今天不适合被催促'],
    recoveryMethods: ['睡眠', '休息', '放松', '舒适'],
  },
  frantic: {
    personality: '暴冲猫',
    emoji: '⚡',
    subtitle: '今天的你，躁、急、停不下来',
    explanation: '你不是坏，只是今天的能量太多了，无处释放。你在急，但急不出结果。这时候需要的是方向，不是更多的冲。',
    advice: '今天把能量导向一个具体的事。不要同时做十件事，选一件，全力以赴。或者找一个出口：运动、创意、任何能让你的能量流动的事。',
    notSuitableFor: ['今天不适合做细致工作', '今天不适合被限制', '今天不适合被要求冷静'],
    recoveryMethods: ['运动', '释放', '行动', '创意'],
  },
  sad: {
    personality: '委屈猫',
    emoji: '😢',
    subtitle: '今天的你，失落、被忽视、心里堵',
    explanation: '你不是太敏感，只是今天的失望积累了。你在等一个道歉、一个解释、一个确认。你的感受是真实的，值得被看见。',
    advice: '今天允许自己难受。不用立刻放下，不用假装没事。哭一场、写下来、或者告诉一个信任的人。你的感受需要被承认。',
    notSuitableFor: ['今天不适合被忽视', '今天不适合被要求坚强', '今天不适合被说教'],
    recoveryMethods: ['倾诉', '哭泣', '被理解', '陪伴'],
  },
  curious: {
    personality: '好奇猫',
    emoji: '🐱',
    subtitle: '今天的你，状态回升、愿意探索',
    explanation: '你开始有力气了。你不再只是防守，开始想要去看看、去尝试。这是恢复的信号，是你的系统在说：我们可以继续了。',
    advice: '今天就跟着这个好奇心走。去尝试一个新的东西、见一个有趣的人、或者做一件一直想做的小事。这个能量很珍贵。',
    notSuitableFor: [],
    recoveryMethods: ['探索', '尝试', '学习', '连接'],
  },
  sunny: {
    personality: '晒太阳猫',
    emoji: '😸',
    subtitle: '今天的你，平静、恢复、慢慢变好',
    explanation: '你真的好了。不是假装，不是压抑，是真的从里到外都放松了。你可以享受当下，可以感受温暖。这是你应得的。',
    advice: '今天就好好享受这个状态。不用赶着做什么，不用证明什么。让自己晒晒太阳，感受这份平静。这个时刻很珍贵。',
    notSuitableFor: [],
    recoveryMethods: ['享受', '放松', '陪伴', '感受'],
  },
};

export function CatSignaturePage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [moodInput, setMoodInput] = useState('');
  const [signature, setSignature] = useState<CatSignature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExit, setSelectedExit] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [personalityId, setPersonalityId] = useState<string | null>(null);

  const generateSignature = async () => {
    if (!moodInput.trim()) {
      setError(lang === 'zh' ? '请告诉我你的感受' : 'Please tell me how you feel');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      const response = await fetch('/api/social/cat-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(lang === 'zh' ? '生成失败，请重试' : 'Generation failed');
      }

      const data = await response.json();
      const { personalityId: pId, personality, emoji } = data.data;

      setPersonalityId(pId);
      setSignature({
        personality,
        emoji,
        subtitle: CAT_CONTENT[pId]?.subtitle || '今天的你',
        explanation: CAT_CONTENT[pId]?.explanation || '',
        advice: CAT_CONTENT[pId]?.advice || '',
        notSuitableFor: CAT_CONTENT[pId]?.notSuitableFor || [],
        recoveryMethods: CAT_CONTENT[pId]?.recoveryMethods || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      console.error('Signature generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!user?.id || !signature || !personalityId) {
      setSaveMessage(lang === 'zh' ? '请先登录' : 'Please sign in first');
      return;
    }

    setIsSaving(true);
    try {
      await saveCatSignature(
        user.id,
        personalityId,
        signature.personality,
        signature.emoji,
        moodInput,
        {} // emotion vector would come from API
      );
      setSaveMessage(lang === 'zh' ? '✓ 已保存到猫档案' : '✓ Saved to archive');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      setSaveMessage(lang === 'zh' ? '保存失败，请重试' : 'Save failed');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* Input Section */}
      {!signature && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <label className="block">
            <p className="font-bold text-gray-900 dark:text-gray-50 mb-2">
              {lang === 'zh' ? '今天最压着你的感觉是什么？' : 'What\'s weighing on you today?'}
            </p>
            <textarea
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              placeholder={lang === 'zh' ? '用一句话说说，猫会替你翻译' : 'Tell me in one sentence...'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </label>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <button
            onClick={generateSignature}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading
              ? (lang === 'zh' ? '生成中...' : 'Generating...')
              : (lang === 'zh' ? '生成我的今日猫签' : 'Generate My Signature')}
          </button>
        </div>
      )}

      {/* Main Signature Card */}
      {signature && (
        <div className="space-y-4">
          {/* Part 1: Cat Personality Result */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-700 text-center space-y-4">
            <div className="text-6xl">{signature.emoji}</div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {signature.personality}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {signature.subtitle}
              </p>
            </div>
          </div>

          {/* Part 2: Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '💭 被读懂的感觉' : '💭 Being Understood'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {signature.explanation}
            </p>
          </div>

          {/* Part 3: Light Advice */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '🌱 一个轻建议' : '🌱 A Light Suggestion'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {signature.advice}
            </p>
          </div>

          {/* Part 4: Not Suitable For */}
          {signature.notSuitableFor.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '✗ 今天不适合' : '✗ Not Suitable Today'}
              </h3>
              <div className="space-y-2">
                {signature.notSuitableFor.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-red-500 font-bold mt-0.5">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                onClick={() => {
                  setSelectedExit('archive');
                  handleSaveToArchive();
                }}
                disabled={isSaving}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedExit === 'archive'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-50">
                  {lang === 'zh' ? '📚 存进猫档案' : '📚 Save to Archive'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'zh' ? '积累你的情绪记录，看见自己的模式' : 'Build your emotional record'}
                </p>
              </button>

              <button
                onClick={() => {
                  setSignature(null);
                  setMoodInput('');
                  setSelectedExit(null);
                }}
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
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {lang === 'zh'
                ? selectedExit === 'treehouse'
                  ? '发布到树洞'
                  : selectedExit === 'archive'
                  ? isSaving ? '保存中...' : '保存到档案'
                  : '再抽一张'
                : selectedExit === 'treehouse'
                ? 'Share to Treehouse'
                : selectedExit === 'archive'
                ? isSaving ? 'Saving...' : 'Save to Archive'
                : 'Draw Again'}
            </button>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">
              {saveMessage}
            </div>
          )}
        </div>
      )}

      {/* Recovery Methods Reference */}
      {signature && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-50">
            {lang === 'zh' ? '💚 你的恢复方式' : '💚 Your Recovery Methods'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {signature.recoveryMethods.map((method) => (
              <span
                key={method}
                className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-700"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
