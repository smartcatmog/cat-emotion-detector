import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { saveFeedback } from '../lib/supabase';

const EMOTION_OPTIONS = ['Relaxed', 'Content', 'Curious', 'Alert', 'Fearful', 'Irritated', 'Angry', 'Sleepy', 'Hungry'];

interface ResultsProps {
  result: AnalysisResult;
  onAnalyzeAnother: () => void;
  onViewHistory: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, onAnalyzeAnother, onViewHistory }) => {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'wrong' | 'done'>('idle');
  const [selectedCorrect, setSelectedCorrect] = useState<string>('');

  const primaryEmotion = result.emotions?.[0]?.type || '';
  const confidence = result.emotions?.[0]?.confidence || 0;

  const handleAccurate = async () => {
    await saveFeedback(result.id, true).catch(console.error);
    setFeedbackState('done');
  };

  const handleInaccurate = () => {
    setFeedbackState('wrong');
  };

  const handleSubmitCorrection = async () => {
    await saveFeedback(result.id, false, selectedCorrect).catch(console.error);
    setFeedbackState('done');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">

        {/* 情绪展示 */}
        <div className="text-center space-y-4">
          <div className="text-6xl">😺</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {primaryEmotion}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-12">
                {Math.round(confidence)}%
              </span>
            </div>
          </div>
        </div>

        {/* 分析结果 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Analysis</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.interpretation}</p>
        </div>

        {/* 建议 */}
        {result.recommendations.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recommendations</h3>
            <div className="grid gap-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 图片预览 */}
        {result.thumbnailUrl && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <img src={result.thumbnailUrl} alt="分析图片" className="w-full h-auto rounded-lg max-h-64 object-cover" />
          </div>
        )}

        {/* 用户反馈 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {feedbackState === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Was this analysis accurate?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAccurate}
                  className="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  ✅ Accurate
                </button>
                <button
                  onClick={handleInaccurate}
                  className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  ❌ Not accurate
                </button>
              </div>
            </div>
          )}

          {feedbackState === 'wrong' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                What do you think your cat is actually feeling?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EMOTION_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setSelectedCorrect(e)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCorrect === e
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitCorrection}
                disabled={!selectedCorrect}
                className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-40"
              >
                Submit Feedback
              </button>
            </div>
          )}

          {feedbackState === 'done' && (
            <p className="text-center text-sm text-green-600 dark:text-green-400">
              Thanks for your feedback — it helps us get better 🐱
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
          <button
            onClick={onAnalyzeAnother}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Analyze Another
          </button>
          <button
            onClick={onViewHistory}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            History
          </button>
        </div>
      </div>
    </div>
  );
};
