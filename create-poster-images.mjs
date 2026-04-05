#!/usr/bin/env node

/**
 * Create poster images using canvas
 * Generates actual PNG files
 */

import fs from 'fs';
import { createCanvas } from 'canvas';

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
    'situation': '#E8EEF4',
    'anxiety': '#F5F0E8',
    'relationship': '#F5E8F0',
    'positive': '#EFF5F0',
    'general': '#F2F2F2',
    'physical': '#F2F2F2',
    'growth': '#F2F2F2',
  };
  return colorMap[triggerType] || '#FFFFFF';
}

// Draw poster on canvas
function drawPoster(ctx, cat, bodyState, need, energy, width, height) {
  const bgColor = getBackgroundColor(cat.trigger_type);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const energyPercent = Math.round(energy);
  const energyColor = energyPercent > 70 ? '#4CAF50' : energyPercent > 40 ? '#FFC107' : '#FF6B6B';

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Padding
  const padding = 30;
  const contentWidth = width - padding * 2;

  // Slogan
  ctx.fillStyle = '#666';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('说不出来的，猫知道', width / 2, padding + 15);

  // Cat emoji (as placeholder)
  ctx.font = 'bold 80px Arial';
  ctx.fillText('🐱', width / 2, padding + 120);

  // Cat name
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cat.name, width / 2, padding + 160);

  // Tagline
  ctx.fillStyle = '#555';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  const taglineY = padding + 190;
  const taglineWords = cat.tagline.split('');
  let currentY = taglineY;
  let line = '';
  for (let i = 0; i < taglineWords.length; i++) {
    line += taglineWords[i];
    if (line.length > 15 || i === taglineWords.length - 1) {
      ctx.fillText(line, width / 2, currentY);
      currentY += 18;
      line = '';
    }
  }

  // Energy label
  ctx.fillStyle = '#666';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`今日能量值 ${energyPercent}%`, width / 2, currentY + 20);

  // Energy bar background
  const barY = currentY + 35;
  const barWidth = contentWidth * 0.8;
  const barX = (width - barWidth) / 2;
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(barX, barY, barWidth, 6);

  // Energy bar fill
  ctx.fillStyle = energyColor;
  ctx.fillRect(barX, barY, (barWidth * energyPercent) / 100, 6);

  // Explanation
  ctx.fillStyle = '#666';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  const explanationY = barY + 30;
  const explanationWords = cat.explanation.split('');
  let explanationLine = '';
  let explanationCurrentY = explanationY;
  for (let i = 0; i < explanationWords.length; i++) {
    explanationLine += explanationWords[i];
    if (explanationLine.length > 20 || i === explanationWords.length - 1) {
      ctx.fillText(explanationLine, width / 2, explanationCurrentY);
      explanationCurrentY += 16;
      explanationLine = '';
    }
  }

  // Bottom info
  ctx.fillStyle = '#999';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(today, padding, height - 15);

  ctx.textAlign = 'right';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('喵懂了', width - padding, height - 15);
}

// Test cases
const testCases = [
  {
    catId: 'kun_kun_mao',
    bodyState: '身体不舒服',
    need: '休息',
    filename: 'poster-kun-kun.png',
  },
  {
    catId: 'wei_qu_mao',
    bodyState: '心里堵',
    need: '被理解',
    filename: 'poster-wei-qu.png',
  },
  {
    catId: 'sa_huan_mao',
    bodyState: '说不出来',
    need: '被陪着',
    filename: 'poster-sa-huan.png',
  },
  {
    catId: 'beng_jin_mao',
    bodyState: '都有',
    need: '自己待着',
    filename: 'poster-beng-jin.png',
  },
  {
    catId: 'zhixiang_mao',
    bodyState: '说不上来',
    need: '自己待着',
    filename: 'poster-zhixiang.png',
  },
];

console.log('🎨 Creating Poster Images\n');
console.log('='.repeat(60));

// Poster dimensions (750x1200 at 2x scale = 375x600 canvas)
const posterWidth = 375;
const posterHeight = 600;

testCases.forEach((test, idx) => {
  const cat = catsMap[test.catId];
  if (!cat) {
    console.log(`❌ Cat not found: ${test.catId}`);
    return;
  }

  try {
    const energy = calculateEnergyValue(test.bodyState, test.need, cat.energy);
    
    // Create canvas
    const canvas = createCanvas(posterWidth, posterHeight);
    const ctx = canvas.getContext('2d');

    // Draw poster
    drawPoster(ctx, cat, test.bodyState, test.need, energy, posterWidth, posterHeight);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(test.filename, buffer);

    console.log(`✅ Generated: ${test.filename}`);
    console.log(`   Cat: ${cat.name}`);
    console.log(`   Energy: ${Math.round(energy)}%`);
    console.log(`   Size: ${posterWidth}×${posterHeight}px`);
    console.log();
  } catch (error) {
    console.log(`❌ Failed to generate ${test.filename}: ${error.message}`);
  }
});

console.log('='.repeat(60));
console.log('\n📂 Poster images generated!\n');
console.log('Generated files:');
testCases.forEach(test => {
  console.log(`  • ${test.filename}`);
});
console.log();
