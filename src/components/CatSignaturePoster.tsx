import { useRef } from 'react';
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

  const energyValue = calculateEnergyValue(bodyState, need, catEnergy);
  const bgColor = getBackgroundColor(triggerType);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

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
          {catPhoto ? (
            <img
              src={catPhoto}
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
