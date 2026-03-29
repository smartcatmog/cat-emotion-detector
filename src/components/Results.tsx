import React from 'react';
import { AnalysisResult, EmotionType } from '../types';

const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😸',
  content: '😻',
  playful: '🐱',
  curious: '👀',
  anxious: '😿',
  stressed: '😾',
  angry: '😠',
  sleepy: '😴',
  hungry: '🍖',
  neutral: '😐',
};

interface ResultsProps {
  result: AnalysisResult;
  onAnalyzeAnother: () => void;
  onViewHistory: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  result,
  onAnalyzeAnother,
  onViewHistory,
}) => {
  const primaryEmotion = result.emotions?.[0]?.type || result.summary?.dominantEmotion;
  const emoji = primaryEmotion ? EMOTION_EMOJIS[primaryEmotion] : '😺';
  const confidence = result.emotions?.[0]?.confidence || result.summary?.averageConfidence || 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        {/* Emotion Display */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{emoji}</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 capitalize">
              {primaryEmotion}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${confidence}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(confidence)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-12">
                {Math.round(confidence)}%
              </span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
            What this means
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {result.interpretation}
          </p>
        </div>

        {/* Recommendations */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Recommended actions
          </h3>
          <div className="grid gap-3">
            {result.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="
                  p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                  dark:border-blue-800 rounded-lg
                "
              >
                <p className="text-gray-800 dark:text-gray-200">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* File Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">File name</p>
              <p className="font-medium text-gray-900 dark:text-gray-50 truncate">
                {result.fileName}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">File size</p>
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {(result.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Analysis date</p>
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {new Date(result.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">File type</p>
              <p className="font-medium text-gray-900 dark:text-gray-50 capitalize">
                {result.fileType}
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {result.thumbnailUrl && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Preview</p>
            {result.fileType === 'image' ? (
              <img
                src={result.thumbnailUrl}
                alt="Analysis preview"
                className="w-full h-auto rounded-lg max-h-64 object-cover"
              />
            ) : (
              <video
                src={result.thumbnailUrl}
                controls
                className="w-full h-auto rounded-lg max-h-64"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
          <button
            onClick={onAnalyzeAnother}
            className="
              flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors
            "
          >
            Analyze Another
          </button>
          <button
            onClick={onViewHistory}
            className="
              flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900
              dark:text-gray-50 rounded-lg font-medium hover:bg-gray-300
              dark:hover:bg-gray-600 focus:outline-none focus:ring-2
              focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              transition-colors
            "
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};
