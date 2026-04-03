import React, { useState } from 'react';
import { useLang } from '../lib/i18n';
import { saveCatSignature } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CatIllustration } from '../components/CatIllustrations';

interface CatSignature {
  personality: string;
  emoji: string;
  subtitle: string;
  explanation: string;
  advice: string;
  softSuggestions: string[];
  recoveryMethods: string[];
}

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
      const { personalityId: pId, personality, emoji, explanation, advice, softSuggestions, recoveryMethods } = data.data;

      setPersonalityId(pId);
      setSignature({
        personality,
        emoji,
        subtitle: `今天的你，${personality}`,
        explanation: explanation || '你的感受是真实的。',
        advice: advice || '照顾好自己。',
        softSuggestions: softSuggestions || [],
        recoveryMethods: recoveryMethods || [],
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
        {}
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

      {/* Input Section - Always Visible */}
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

      {/* Generated Signature Card */}
      {signature && (
        <div className="space-y-4">
          {/* Part 1: Cat Personality Result */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-700 text-center space-y-4">
            <div className="flex justify-center">
              <CatIllustration personalityId={personalityId || 'sleepy'} className="w-40 h-40" />
            </div>
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

          {/* Part 4: Soft Suggestions */}
          {signature.softSuggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '💭 温柔的陪伴建议' : '💭 Gentle Suggestions'}
              </h3>
              <div className="space-y-2">
                {signature.softSuggestions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
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
                  {lang === 'zh' ? '🔄 换一种理解方式' : '🔄 Another Perspective'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'zh' ? '看另一只猫怎么说，或者给我一个更轻一点的版本' : 'See another cat\'s perspective'}
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

          {/* Recovery Methods Reference */}
          {signature.recoveryMethods.length > 0 && (
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
      )}
    </div>
  );
}
