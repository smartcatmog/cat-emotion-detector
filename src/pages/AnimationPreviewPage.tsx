import React, { useState } from 'react';
import { PhotoAnimationDemo } from '../components/PhotoAnimationDemo';
import { useLang } from '../lib/i18n';

export function AnimationPreviewPage() {
  const { lang } = useLang();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {lang === 'zh' ? '🎬 照片动画化' : '🎬 Photo Animation'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'zh'
            ? '上传你的猫咪照片，选择动画效果'
            : 'Upload your cat photo and choose animation effect'}
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }`}
        >
          <div className="text-4xl mb-3">📸</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '拖拽上传照片' : 'Drag and drop your photo'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {lang === 'zh' ? '或点击下方按钮选择' : 'or click the button below'}
          </p>
          <label className="inline-block px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 cursor-pointer transition-colors">
            {lang === 'zh' ? '选择照片' : 'Choose Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Demo */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8">
        <PhotoAnimationDemo imageUrl={uploadedImage || undefined} />
      </div>

      {/* Change Photo Button */}
      {uploadedImage && (
        <div className="text-center">
          <button
            onClick={() => setUploadedImage(null)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {lang === 'zh' ? '更换照片' : 'Change Photo'}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">🎪</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '跳跃' : 'Bounce'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '欢快的跳跃动作' : 'Playful bouncing'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">🌀</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '旋转' : 'Spin'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '轻微旋转效果' : 'Gentle spinning'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-2">💥</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">
            {lang === 'zh' ? '脉冲' : 'Pulse'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '闪烁脉冲效果' : 'Pulsing glow'}
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
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '保留原照' : 'Original Photo'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '使用你上传的真实照片，保留所有细节'
                  : 'Uses your real photo with all details preserved'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '动画效果' : 'Animation Effects'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '4种动画效果可选：跳跃、旋转、脉冲、倾斜'
                  : '4 animation types: bounce, spin, pulse, tilt'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lang === 'zh' ? '3秒循环' : '3-Second Loop'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'zh' ? '无缝循环播放，配合浮动粒子效果' : 'Seamless loop with floating particles'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
