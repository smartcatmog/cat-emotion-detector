import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ShareCardProps {
  imageUrl: string;
  emotion: string;
  emotionEmoji: string;
  petName?: string;
  onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ imageUrl, emotion, emotionEmoji, petName, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userText, setUserText] = useState('');
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);

  const CARD_W = 1080;
  const CARD_H = 1350;

  const loadImage = useCallback(async (): Promise<HTMLImageElement> => {
    // If it's already a data URL (base64), load directly without crossOrigin
    if (imageUrl.startsWith('data:')) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
      });
    }
    // Remote URL: fetch as blob to avoid CORS issues
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(blobUrl); resolve(img); };
        img.onerror = reject;
        img.src = blobUrl;
      });
    } catch {
      // last resort: direct src
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
      });
    }
  }, [imageUrl]);

  const drawCard = useCallback(async (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = CARD_W;
    canvas.height = CARD_H;

    // Dark background
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, '#0f0c29');
    bg.addColorStop(1, '#302b63');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Cat image (square, top area)
    const imgPad = 40;
    const imgSize = CARD_W - imgPad * 2;
    const imgY = 80;
    try {
      const img = await loadImage();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgPad, imgY, imgSize, imgSize, 40);
      ctx.clip();
      const scale = Math.max(imgSize / img.width, imgSize / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = imgPad + (imgSize - dw) / 2;
      const dy = imgY + (imgSize - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Gradient overlay on bottom of image
      const overlayTop = imgY + imgSize - 260;
      const grad = ctx.createLinearGradient(0, overlayTop, 0, imgY + imgSize);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgPad, imgY, imgSize, imgSize, 40);
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(imgPad, overlayTop, imgSize, 260);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#2d2d4e';
      ctx.beginPath();
      ctx.roundRect(imgPad, imgY, imgSize, imgSize, 40);
      ctx.fill();
    }

    // Emotion label (bottom of image)
    const labelY = imgY + imgSize - 40;
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(`${emotionEmoji} ${emotion}`, imgPad + 30, labelY);
    ctx.shadowBlur = 0;

    // User text below image
    const textY = imgY + imgSize + 100;
    if (text.trim()) {
      ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      // Simple word wrap by character
      const maxW = CARD_W - 120;
      let line = '';
      let ly = textY;
      for (const ch of text) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, CARD_W / 2, ly);
          line = ch;
          ly += 100;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, CARD_W / 2, ly);
    }

    // MoodCat branding
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('🐱 MoodCat', CARD_W / 2, CARD_H - 55);
  }, [loadImage, emotion, emotionEmoji]);

  useEffect(() => {
    setRendering(true);
    drawCard(userText).finally(() => setRendering(false));
  }, [drawCard, userText]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `moodcat-${emotion}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSharing(true);
    try {
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
      const file = new File([blob], `moodcat-${emotion}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${emotionEmoji} ${emotion} — MoodCat`, text: userText });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">分享这只猫 🐱</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Canvas preview */}
        <div className="relative rounded-xl overflow-hidden bg-gray-800" style={{ aspectRatio: '4/5' }}>
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* User text input */}
        <input
          type="text"
          value={userText}
          onChange={e => setUserText(e.target.value)}
          placeholder="爷今天拼了 / 今天心情很好..."
          maxLength={20}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-purple-500 outline-none placeholder-gray-500 text-sm"
        />

        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors text-sm">
            ⬇️ 下载
          </button>
          <button onClick={handleShare} disabled={sharing} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 text-sm">
            {sharing ? '分享中...' : '🔗 分享'}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">下载后可发到微信、Instagram、微博等任意平台</p>
      </div>
    </div>
  );
};
