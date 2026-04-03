import React from 'react';
import { PhotoAnimationDemo } from '../components/PhotoAnimationDemo';
import { useLang } from '../lib/i18n';

export function AnimationPreviewPage() {
  const { lang } = useLang();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '🎬 照片动画化' : '🎬 Photo Animation'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'zh'
            ? '上传猫咪照片 → AI 分析 → 生成卡通动画'
            : 'Upload cat photo → AI analysis → Generate cartoon animation'}
        </p>
      </div>

      {/* Demo */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8">
        <PhotoAnimationDemo />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">📸</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '上传照片' : 'Upload Photo'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '支持 JPG、PNG 格式' : 'Support JPG, PNG'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? 'AI 分析' : 'AI Analysis'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '识别姿态、表情、情绪' : 'Detect pose, expression, emotion'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">✨</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '生成动画' : 'Generate Animation'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '3秒卡通循环动画' : '3-second cartoon loop'}
          </p>
        </div>
      </div>

      {/* Animation Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '动画效果' : 'Animation Effects'}
        </h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-2xl">🐱</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '卡通化' : 'Cartoonization'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '根据原照片特征生成简洁卡通版本'
                  : 'Generate simplified cartoon based on original features'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '动作' : 'Actions'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '跳跃、摇尾巴、眨眼、竖耳朵等自然动作'
                  : 'Jump, tail wag, blink, ear twitch, etc.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '循环' : 'Loop'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh' ? '3秒无缝循环播放' : '3-second seamless loop'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {lang === 'zh'
            ? '✨ 完整功能即将上线 - 上传你的猫咪照片，AI 将为你生成独特的卡通动画'
            : '✨ Coming soon - Upload your cat photo and AI will generate a unique cartoon animation'}
        </p>
      </div>
    </div>
  );
}
