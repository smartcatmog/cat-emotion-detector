import { useState } from 'react';
import { useLang } from '../lib/i18n';
import { saveCatSignature } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CatIllustration } from '../components/CatIllustrations';
import { CatSignaturePoster } from '../components/CatSignaturePoster';

interface CatSignatureResult {
  catId: string;
  name: string;
  tagline: string;
  emoji: string;
  explanation: string;
  suggestion: string;
  notSuitable: string[];
  recoveryMethods: string[];
  neighbor: string;
  catPhoto: string | null;
  energy: 'high' | 'medium' | 'low';
  triggerType: string;
}

export function CatSignaturePage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [moodInput, setMoodInput] = useState('');
  const [bodyState, setBodyState] = useState('');
  const [need, setNeed] = useState('');
  const [signature, setSignature] = useState<CatSignatureResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const generateSignature = async () => {
    if (!moodInput.trim()) {
      setError(lang === 'zh' ? '请告诉我你的感受' : 'Please tell me how you feel');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);
    setFeedback(null);

    try {
      const response = await fetch('/api/social/cat-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_text: moodInput.trim(),
          body_state: bodyState,
          need,
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'zh' ? '生成失败，请重试' : 'Generation failed');
      }

      const data = await response.json();
      setSignature(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      console.error('Signature generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!user?.id || !signature) {
      setSaveMessage(lang === 'zh' ? '请先登录' : 'Please sign in first');
      return;
    }

    setIsSaving(true);
    try {
      await saveCatSignature(
        user.id,
        signature.catId,
        signature.name,
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

  const handleChangeUnderstanding = async () => {
    if (!signature) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/social/cat-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_text: moodInput.trim(),
          body_state: bodyState,
          need,
          forceNeighbor: signature.neighbor,
        }),
      });

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setSignature(data.data);
      setFeedback(null);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        {/* Mood Input */}
        <label className="block">
          <p className="font-bold text-gray-900 dark:text-gray-50 mb-2">
            {lang === 'zh' ? '今天最压着你的感觉是什么？' : 'What\'s weighing on you today?'}
          </p>
          <textarea
            value={moodInput}
            onChange={(e) => setMoodInput(e.target.value)}
            placeholder={lang === 'zh' ? '用一句话说说，比如：胃疼啊、被骂了很委屈、脑子停不下来' : 'Tell me in one sentence...'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
          />
        </label>

        {/* Body State */}
        <label className="block">
          <p className="font-bold text-gray-900 dark:text-gray-50 mb-2">
            {lang === 'zh' ? '身体状态' : 'Body State'}
          </p>
          <select
            value={bodyState}
            onChange={(e) => setBodyState(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{lang === 'zh' ? '选择...' : 'Select...'}</option>
            <option value="身体不舒服">{lang === 'zh' ? '身体不舒服' : 'Physical discomfort'}</option>
            <option value="心里堵">{lang === 'zh' ? '心里堵' : 'Emotional block'}</option>
            <option value="都有">{lang === 'zh' ? '都有' : 'Both'}</option>
            <option value="说不上来">{lang === 'zh' ? '说不上来' : 'Not sure'}</option>
          </select>
        </label>

        {/* Need */}
        <label className="block">
          <p className="font-bold text-gray-900 dark:text-gray-50 mb-2">
            {lang === 'zh' ? '现在需要' : 'What I need'}
          </p>
          <select
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{lang === 'zh' ? '选择...' : 'Select...'}</option>
            <option value="休息">{lang === 'zh' ? '休息' : 'Rest'}</option>
            <option value="被理解">{lang === 'zh' ? '被理解' : 'Understanding'}</option>
            <option value="发泄">{lang === 'zh' ? '发泄' : 'Release'}</option>
            <option value="自己待着">{lang === 'zh' ? '自己待着' : 'Alone time'}</option>
            <option value="被陪着">{lang === 'zh' ? '被陪着' : 'Companionship'}</option>
          </select>
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

      {/* Result Card */}
      {signature && (
        <div className="space-y-4">
          {/* Cat Display */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-700 text-center space-y-4">
            <div className="flex justify-center">
              {signature.catPhoto ? (
                <img 
                  src={signature.catPhoto} 
                  alt={signature.name}
                  className="w-40 h-40 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <CatIllustration personalityId={signature.catId} className="w-40 h-40" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {signature.name}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {lang === 'zh' ? '【今日猫签】' : '【Today\'s Signature】'}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '【一句解释】' : '【Explanation】'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {signature.explanation}
            </p>
          </div>

          {/* Suggestion */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '【一个轻建议】' : '【Light Suggestion】'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {signature.suggestion}
            </p>
          </div>

          {/* Not Suitable */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '【今天不适合】' : '【Not Suitable Today】'}
            </h3>
            <div className="space-y-2">
              {signature.notSuitable.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '【今天适合的恢复方式】' : '【Recovery Methods】'}
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

          {/* Feedback */}
          {!feedback && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '这张签像你吗？' : 'Does this signature feel right?'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['很像', '还行', '不太像'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFeedback(option)}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Poster */}
          <CatSignaturePoster
            catName={signature.name}
            catPhoto={signature.catPhoto}
            tagline={signature.tagline}
            explanation={signature.explanation}
            bodyState={bodyState}
            need={need}
            catEnergy={signature.energy}
            triggerType={signature.triggerType}
          />

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">
              {lang === 'zh' ? '【下一步】' : '【Next】'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleSaveToArchive}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {lang === 'zh' ? '📚 存进猫档案' : '📚 Save to Archive'}
              </button>

              <button
                onClick={() => {
                  setSignature(null);
                  setMoodInput('');
                  setBodyState('');
                  setNeed('');
                  setFeedback(null);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold hover:opacity-90 transition-opacity"
              >
                {lang === 'zh' ? '🔄 换一种理解方式' : '🔄 Another Perspective'}
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
