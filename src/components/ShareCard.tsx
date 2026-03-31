import React, { useState, useRef, useEffect } from 'react';

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
  const CARD_H = 1350; // 4:5 ratio, ideal for Instagram/WeChat

  const drawCard = async (canvas: HTMLCanvasElement, text: string) => {
    const ctx = canvas.getContext('2d')!;
    canvas.width = CARD_W;
    canvas.height = CARD_H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, '#1a1a2e');
    bg.addColorStop(1, '#16213e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Load and draw cat image
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Draw image centered, cropped to square
      const imgSize = CARD_W;
      const imgY = 80;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(40, imgY, CARD_W - 80, imgSize - 80, 32);
      ctx.clip();
      // cover fit
      const scale = Math.max(imgSize / img.width, (imgSize - 80) / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = 40 + ((CARD_W - 80) - drawW) / 2;
      const drawY = imgY + ((imgSize - 80) - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch {
      // fallback: solid color block
      ctx.fillStyle = '#2d2d4e';
      ctx.fillRect(40, 80, CARD_W - 80, CARD_W - 80);
    }

    // Semi-transparent overlay at bottom of image for text
    const overlayY = CARD_W - 80;
    const grad = ctx.createLinearGradient(0, overlayY - 200, 0, overlayY + 80);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(40, overlayY - 200, CARD_W - 80, 280);

    // Emotion label on image
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`${emotionEmoji} ${emotion}`, 80, overlayY + 40);

    // User text area
    const textAreaY = CARD_W + 60;
    if (text.trim()) {
      ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      // Word wrap
      const words = text.split('');
      const maxWidth = CARD_W - 120;
      let line = '';
      let lineY = textAreaY;
      for (const char of words) {
        const testLine = line + char;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line, CARD_W / 2, lineY);
          line = char;
          lineY += 90;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, CARD_W / 2, lineY);
    } else {
      // placeholder style
      ctx.font = '52px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('说点什么...', CARD_W / 2, textAreaY);
    }

    // MoodCat branding at bottom
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('🐱 MoodCat', CARD_W / 2, CARD_H - 60);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendering(true);
    drawCard(canvas, userText).finally(() => setRendering(false));
  }, [userText, imageUrl]);

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
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'));
      const file = new File([blob], `moodcat-${emotion}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${emotionEmoji} ${emotion} — MoodCat`,
          text: userText || `My mood cat is ${emotion} today`,
        });
      } else {
        // fallback: download
        handleDownload();
      }
    } catch (e) {
      handleDownload();
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">分享这只猫 🐱</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Canvas preview */}
        <div className="relative rounded-xl overflow-hidden bg-gray-800">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-xl"
            style={{ aspectRatio: '4/5' }}
          />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* User text input */}
        <input
          type="text"
          value={userText}
          onChange={e => setUserText(e.target.value)}
          placeholder="爷今天拼了 / 今天心情很好 / 就这样吧..."
          maxLength={30}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none placeholder-gray-500 text-sm"
        />

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors text-sm"
          >
            ⬇️ 下载
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {sharing ? '分享中...' : '🔗 分享'}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">下载后可发到微信、Instagram、微博等任意平台</p>
      </div>
    </div>
  );
};
