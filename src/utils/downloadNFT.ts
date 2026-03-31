import html2canvas from 'html2canvas';

export async function downloadNFTCertificate(elementId: string, fileName: string = 'moodcat-nft.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('NFT certificate element not found');
    return;
  }

  try {
    // 使用 html2canvas 将元素转换为图片
    const canvas = await html2canvas(element, {
      backgroundColor: '#1a1a2e', // 深色背景
      scale: 2, // 2倍分辨率，更清晰
      logging: false,
      useCORS: true, // 允许跨域图片
    });

    // 转换为 blob 并下载
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Failed to download NFT certificate:', error);
    alert('下载失败，请右键点击证书图片选择"图片另存为"');
  }
}
