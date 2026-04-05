#!/usr/bin/env node

/**
 * Generate poster HTML and visual preview
 * Creates actual poster images for testing
 */

import fs from 'fs';
import path from 'path';

// Load cats data
const catsData = JSON.parse(fs.readFileSync('src/data/cats.json', 'utf8'));
const catsMap = {};
catsData.cats.forEach(cat => {
  catsMap[cat.id] = cat;
});

// Energy calculator
function calculateEnergyValue(bodyState, need, catEnergy) {
  let score = 50;

  switch (bodyState) {
    case '身体不舒服':
      score += 30;
      break;
    case '心里堵':
      score += 40;
      break;
    case '都有':
      score += 20;
      break;
    case '说不上来':
      score += 50;
      break;
  }

  switch (need) {
    case '休息':
      score -= 10;
      break;
    case '被理解':
      score += 0;
      break;
    case '发泄':
      score += 10;
      break;
    case '自己待着':
      score -= 10;
      break;
    case '被陪着':
      score += 5;
      break;
  }

  switch (catEnergy) {
    case 'high':
      score += 20;
      break;
    case 'medium':
      score += 0;
      break;
    case 'low':
      score -= 15;
      break;
  }

  return Math.max(5, Math.min(95, score));
}

// Color mapping
function getBackgroundColor(triggerType) {
  const colorMap = {
    'situation': '#E8EEF4',      // 灰蓝
    'anxiety': '#F5F0E8',        // 米黄
    'relationship': '#F5E8F0',   // 浅粉紫
    'positive': '#EFF5F0',       // 浅绿
    'general': '#F2F2F2',        // 浅灰白
    'physical': '#F2F2F2',       // 浅灰白
    'growth': '#F2F2F2',         // 浅灰白
  };
  return colorMap[triggerType] || '#FFFFFF';
}

// Generate poster HTML
function generatePosterHTML(cat, bodyState, need, energy) {
  const bgColor = getBackgroundColor(cat.trigger_type);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const energyPercent = Math.round(energy);
  const energyColor = energyPercent > 70 ? '#4CAF50' : energyPercent > 40 ? '#FFC107' : '#FF6B6B';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>喵懂了 - ${cat.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
    }
    .poster {
      width: 375px;
      height: 600px;
      background-color: ${bgColor};
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      position: relative;
    }
    .slogan {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .cat-photo {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-photo img {
      width: 70%;
      max-height: 200px;
      border-radius: 20px;
      object-fit: cover;
      background: #ddd;
    }
    .cat-name {
      font-size: 28px;
      font-weight: bold;
      text-align: center;
      margin-top: 10px;
      color: #333;
    }
    .tagline {
      font-size: 14px;
      text-align: center;
      color: #555;
      margin-top: 8px;
    }
    .energy-section {
      width: 100%;
      margin-top: 15px;
    }
    .energy-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
      text-align: center;
    }
    .energy-bar {
      width: 100%;
      height: 6px;
      background-color: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }
    .energy-fill {
      height: 100%;
      background-color: ${energyColor};
      width: ${energyPercent}%;
      transition: width 0.3s ease;
    }
    .explanation {
      font-size: 12px;
      text-align: center;
      color: #666;
      margin-top: 12px;
      line-height: 1.4;
    }
    .bottom-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      margin-top: 15px;
      font-size: 11px;
      color: #999;
    }
    .watermark {
      font-weight: bold;
      font-size: 12px;
    }
    .info-box {
      background: white;
      padding: 15px;
      margin-top: 20px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.6;
    }
    .info-box h3 {
      margin-bottom: 10px;
      color: #333;
    }
    .info-box p {
      margin: 5px 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="text-align: center; margin-bottom: 20px; color: #333;">🐱 喵懂了 - 猫签海报预览</h1>
    
    <div class="poster" id="poster">
      <div class="slogan">说不出来的，猫知道</div>
      
      <div class="cat-photo">
        <div style="width: 70%; height: 200px; border-radius: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 80px;">
          🐱
        </div>
      </div>
      
      <div class="cat-name">${cat.name}</div>
      <div class="tagline">${cat.tagline}</div>
      
      <div class="energy-section">
        <div class="energy-label">今日能量值 ${energyPercent}%</div>
        <div class="energy-bar">
          <div class="energy-fill"></div>
        </div>
      </div>
      
      <div class="explanation">${cat.explanation}</div>
      
      <div class="bottom-info">
        <div>${today}</div>
        <div class="watermark">喵懂了</div>
      </div>
    </div>

    <div class="info-box">
      <h3>📊 海报信息</h3>
      <p><strong>猫咪名称:</strong> ${cat.name}</p>
      <p><strong>一句文案:</strong> ${cat.tagline}</p>
      <p><strong>能量值:</strong> ${energyPercent}%</p>
      <p><strong>背景颜色:</strong> ${bgColor}</p>
      <p><strong>情绪类型:</strong> ${cat.trigger_type}</p>
      <p><strong>猫咪能量:</strong> ${cat.energy}</p>
      <p><strong>日期:</strong> ${today}</p>
      <p><strong>尺寸:</strong> 375px × 600px (下载时 750px × 1200px)</p>
    </div>

    <div class="info-box">
      <h3>📝 详细说明</h3>
      <p><strong>解释:</strong> ${cat.explanation}</p>
      <p><strong>建议:</strong> ${cat.suggestion}</p>
    </div>

    <div class="info-box">
      <h3>✅ 能量值计算</h3>
      <p>基础分: 50</p>
      <p>身体状态 (${bodyState}): ${bodyState === '身体不舒服' ? '+30' : bodyState === '心里堵' ? '+40' : bodyState === '都有' ? '+20' : bodyState === '说不上来' ? '+50' : '+0'}</p>
      <p>需要 (${need}): ${need === '休息' ? '-10' : need === '被理解' ? '+0' : need === '发泄' ? '+10' : need === '自己待着' ? '-10' : need === '被陪着' ? '+5' : '+0'}</p>
      <p>猫咪能量 (${cat.energy}): ${cat.energy === 'high' ? '+20' : cat.energy === 'medium' ? '+0' : cat.energy === 'low' ? '-15' : '+0'}</p>
      <p><strong>最终能量值: ${energyPercent}%</strong></p>
    </div>
  </div>
</body>
</html>`;
}

// Test cases
const testCases = [
  {
    catId: 'kun_kun_mao',
    bodyState: '身体不舒服',
    need: '休息',
    filename: 'poster-kun-kun.html',
  },
  {
    catId: 'wei_qu_mao',
    bodyState: '心里堵',
    need: '被理解',
    filename: 'poster-wei-qu.html',
  },
  {
    catId: 'sa_huan_mao',
    bodyState: '说不出来',
    need: '被陪着',
    filename: 'poster-sa-huan.html',
  },
  {
    catId: 'beng_jin_mao',
    bodyState: '都有',
    need: '自己待着',
    filename: 'poster-beng-jin.html',
  },
  {
    catId: 'zhixiang_mao',
    bodyState: '说不出来',
    need: '自己待着',
    filename: 'poster-zhixiang.html',
  },
];

console.log('🎨 Generating Poster HTML Files\n');
console.log('='.repeat(60));

testCases.forEach((test, idx) => {
  const cat = catsMap[test.catId];
  if (!cat) {
    console.log(`❌ Cat not found: ${test.catId}`);
    return;
  }

  const energy = calculateEnergyValue(test.bodyState, test.need, cat.energy);
  const html = generatePosterHTML(cat, test.bodyState, test.need, energy);

  fs.writeFileSync(test.filename, html);
  console.log(`✅ Generated: ${test.filename}`);
  console.log(`   Cat: ${cat.name}`);
  console.log(`   Energy: ${Math.round(energy)}%`);
  console.log(`   URL: file://${path.resolve(test.filename)}`);
  console.log();
});

console.log('='.repeat(60));
console.log('\n📂 Poster files generated! Open them in your browser to preview.\n');
console.log('Generated files:');
testCases.forEach(test => {
  console.log(`  • ${test.filename}`);
});
console.log();
