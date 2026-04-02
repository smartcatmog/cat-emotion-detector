import React, { useState, useRef } from 'react';
import { useLang } from '../lib/i18n';

const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

interface UploadProps {
  onFileSelect: (file: File, preview: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onFileSelect }) => {
  const { lang } = useLang();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isImage = SUPPORTED_IMAGE_FORMATS.includes(file.type);
    const isVideo = SUPPORTED_VIDEO_FORMATS.includes(file.type);
    if (!isImage && !isVideo) return { valid: false, error: lang === 'zh' ? '不支持的格式，请上传 JPEG、PNG、WebP 或 GIF 图片' : 'Unsupported format. Please upload JPEG, PNG, WebP, or GIF.' };
    if (isImage && file.size > MAX_IMAGE_SIZE) return { valid: false, error: lang === 'zh' ? `图片超过 50MB 限制（当前 ${(file.size/1024/1024).toFixed(2)}MB）` : `Image exceeds 50MB. Your file is ${(file.size/1024/1024).toFixed(2)}MB.` };
    if (isVideo && file.size > MAX_VIDEO_SIZE) return { valid: false, error: lang === 'zh' ? `视频超过 500MB 限制（当前 ${(file.size/1024/1024).toFixed(2)}MB）` : `Video exceeds 500MB. Your file is ${(file.size/1024/1024).toFixed(2)}MB.` };
    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) { setError(validation.error || 'Invalid file'); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => onFileSelect(file, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files?.length) handleFileSelect(e.currentTarget.files[0]);
  };
  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        role="button" tabIndex={0} aria-label="Upload file area"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <input ref={fileInputRef} type="file" onChange={handleFileInputChange}
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo"
          className="hidden" aria-hidden="true" />
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {lang === 'zh' ? '拖拽文件到这里' : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'zh' ? '或点击从设备选择' : 'or click to select from your device'}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>{lang === 'zh' ? '图片：' : 'Images:'}</strong> JPEG, PNG, WebP, GIF (max 50MB)</p>
            <p><strong>{lang === 'zh' ? '视频：' : 'Videos:'}</strong> MP4, WebM, MOV, AVI (max 500MB)</p>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
            {lang === 'zh' ? '选择文件' : 'Select File'}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
};
