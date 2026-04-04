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
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top Slogan */}
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          说不出来的，猫知道
        </div>

        {/* Cat Photo */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {catPhoto ? (
            <img
              src={catPhoto}
              alt={catName}
              style={{
                width: '70%',
                maxHeight: '200px',
                borderRadius: '20px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '70%',
                height: '200px',
                borderRadius: '20px',
                backgroundColor: '#ddd',
              }}
            />
          )}
        </div>

        {/* Cat Name */}
        <div style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
          {catName}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '14px', textAlign: 'center', color: '#555', marginTop: '8px' }}>
          {tagline}
        </div>

        {/* Energy Bar */}
        <div style={{ width: '100%', marginTop: '15px' }}>
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
        <div style={{ fontSize: '12px', textAlign: 'center', color: '#666', marginTop: '12px', lineHeight: '1.4' }}>
          {explanation}
        </div>

        {/* Bottom Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            marginTop: '15px',
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
