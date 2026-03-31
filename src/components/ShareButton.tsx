import React, { useState, useRef, useEffect } from 'react';

interface ShareButtonProps {
  text: string;       // 分享文案
  url?: string;       // 分享链接，默认当前页
  imageUrl?: string;  // 猫咪图片（用于提示）
  compact?: boolean;  // 紧凑模式（用于卡片）
}

const PLATFORMS = [
  {
    id: 'x',
    label: 'X / Twitter',
    emoji: '🐦',
    color: 'hover:bg-black hover:text-white',
    getUrl: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    emoji: '📘',
    color: 'hover:bg-blue-600 hover:text-white',
    getUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'weibo',
    label: '微博',
    emoji: '🔴',
    color: 'hover:bg-red-500 hover:text-white',
    getUrl: (text: string, url: string) =>
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: 'copy',
    label: '复制链接',
    emoji: '🔗',
    color: 'hover:bg-gray-200 dark:hover:bg-gray-600',
    getUrl: (_: string, url: string) => url,
  },
  {
    id: 'wechat',
    label: '微信',
    emoji: '💚',
    color: 'hover:bg-green-500 hover:text-white',
    getUrl: null, // 微信不支持直接跳转，显示二维码提示
  },
  {
    id: 'instagram',
    label: 'Instagram',
    emoji: '📸',
    color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white',
    getUrl: null, // Instagram 不支持直接分享，复制链接
  },
];

export const ShareButton: React.FC<ShareButtonProps> = ({ text, url, compact = false }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wechatHint, setWechatHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const shareUrl = url || window.location.href;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePlatform = async (platform: typeof PLATFORMS[0]) => {
    if (platform.id === 'copy' || platform.id === 'instagram') {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (platform.id === 'instagram') {
        alert('链接已复制！打开 Instagram 粘贴到 Story 或 Bio 吧 📸');
      }
      setOpen(false);
      return;
    }
    if (platform.id === 'wechat') {
      setWechatHint(true);
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
    if (platform.getUrl) {
      window.open(platform.getUrl(text, shareUrl), '_blank', 'noopener,noreferrer,width=600,height=500');
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center gap-1.5 font-medium transition-all rounded-xl
          ${compact
            ? 'py-2 px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm flex-1'
            : 'py-3 px-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-200 dark:shadow-none text-sm'
          }`}
      >
        {copied ? '✅ Copied!' : '🔗 Share'}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 w-52 z-50 space-y-1">
          <p className="text-xs text-gray-400 px-2 pb-1 font-medium">Share this cat 🐱</p>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePlatform(p)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all ${p.color}`}
            >
              <span className="text-base">{p.emoji}</span>
              <span>{p.label}</span>
              {p.id === 'copy' && copied && <span className="ml-auto text-green-500 text-xs">✓</span>}
              {(p.id === 'wechat' || p.id === 'instagram') && (
                <span className="ml-auto text-gray-300 text-xs">复制链接</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 微信提示 */}
      {wechatHint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setWechatHint(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">💚</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-50">分享到微信</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">链接已复制到剪贴板，打开微信粘贴给朋友或发到朋友圈吧！</p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-xs text-gray-500 break-all">{shareUrl}</div>
            <button onClick={() => setWechatHint(false)} className="w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
              好的 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
