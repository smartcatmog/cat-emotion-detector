import html2canvas from 'html2canvas';

export async function downloadNFTCertificate(elementId: string, fileName: string = 'moodcat-nft.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('NFT certificate element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#111827',
      scale: 2,
      logging: false,
      useCORS: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
    });

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
