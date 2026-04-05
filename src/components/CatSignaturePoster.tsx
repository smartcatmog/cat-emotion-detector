import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { calculateEnergyValue, getBackgroundColor } from '../lib/energyCalculator';

interface CatSignaturePosterProps {
  catName: string;
  catPhoto: string | null;
  tagline: string;
  explanation: string;
  bodyState: string;
  need: string;
  catEnergy: 'high' | 'medium' | 'low';
  triggerType: string;
}

export function CatSignaturePoster({
  catName,
  catPhoto,
  tagline,
  explanation,
  bodyState,
  need,
  catEnergy,
  triggerType,
}: CatSignaturePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userCatPhoto, setUserCatPhoto] = useState<string | null>(null);
  const [userCatName, setUserCatName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const energyValue = calculateEnergyValue(bodyState, need, catEnergy);
  const bgColor = getBackgroundColor(triggerType);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Use user's cat photo if available, otherwise use original
  const displayPhoto = userCatPhoto || catPhoto;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('请上传 JPG 或 PNG 格式的图片');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    // Read and crop image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crop to square
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
          setUserCatPhoto(canvas.toDataURL('image/jpeg'));
          setShowNameInput(true);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;

    try {
      // Hide carousel arrows during screenshot
      const arrowButtons = document.querySelectorAll('[class*="carousel"], [class*="arrow"]');
      const hiddenElements: { element: HTMLElement; display: string }[] = [];
      
      arrowButtons.forEach((btn) => {
        const element = btn as HTMLElement;
        if (element.style) {
          hiddenElements.push({ element, display: element.style.display });
          element.style.display = 'none';
        }
      });

      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Restore carousel arrows
      hiddenElements.forEach(({ element, display }) => {
        element.style.display = display;
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `喵懂了-${catName}-${today}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate poster:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Poster Preview */}
      <div
        ref={posterRef}
        className="mx-auto"
        style={{
          width: '375px',
          height: '600px',
          backgroundColor: bgColor,
          padding: '15px 20px 30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top Slogan */}
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '5px' }}>
          说不出来的，猫知道
        </div>

        {/* Cat Photo - increased to 75% width */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-10px' }}>
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={catName}
              style={{
                width: '75%',
                maxHeight: '220px',
                borderRadius: '20px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '75%',
                height: '220px',
                borderRadius: '20px',
                backgroundColor: '#ddd',
              }}
            />
          )}
        </div>

        {/* Cat Name */}
        <div style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginTop: '12px', marginBottom: '8px' }}>
          {catName}
        </div>

        {/* Tagline - new line between name and energy bar */}
        <div style={{ fontSize: '14px', textAlign: 'center', color: '#888', marginBottom: '12px', lineHeight: '1.4' }}>
          {tagline}
        </div>

        {/* Energy Bar */}
        <div style={{ width: '100%', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
            今日能量值 {Math.round(energyValue)}%
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${energyValue}%`,
                height: '100%',
                backgroundColor: energyValue > 70 ? '#4CAF50' : energyValue > 40 ? '#FFC107' : '#FF6B6B',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Explanation */}
        <div style={{ fontSize: '12px', textAlign: 'center', color: '#666', marginBottom: '12px', lineHeight: '1.4' }}>
          {explanation}
        </div>

        {/* Bottom Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            fontSize: '11px',
            color: '#999',
          }}
        >
          <div>{today}</div>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>喵懂了</div>
        </div>

        {/* User Cat Name Line - shown only if user uploaded a cat */}
        {userCatPhoto && userCatName && (
          <div style={{ fontSize: '9px', color: '#bbb', textAlign: 'center', marginTop: '4px', width: '100%' }}>
            今日猫签 × {userCatName}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold hover:opacity-90 transition-opacity"
        >
          🐱 换上你家猫的脸
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          支持 JPG/PNG，大小限制 5MB
        </p>

        {/* User Cat Name Input */}
        {showNameInput && userCatPhoto && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="你家猫的名字（可选）"
              value={userCatName}
              onChange={(e) => setUserCatName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input type="checkbox" className="mt-0.5" defaultChecked />
              <span>允许喵懂了使用这张照片帮助更多用户</span>
            </label>
          </div>
        )}

        {userCatPhoto && (
          <button
            onClick={() => {
              setUserCatPhoto(null);
              setUserCatName('');
              setShowNameInput(false);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:opacity-90 transition-opacity text-sm"
          >
            ✕ 移除自己的猫
          </button>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={downloadPoster}
        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity"
      >
        📸 保存海报
      </button>
    </div>
  );
}
