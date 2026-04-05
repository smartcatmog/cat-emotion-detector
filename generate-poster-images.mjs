#!/usr/bin/env node

/**
 * Generate actual poster images using html2canvas
 * Creates PNG files that can be viewed directly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: #f5f5f5;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
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
      border-radius: 0;
      position: relative;
      box-shadow: none;
    }
    .slogan {
      font-size: 12px;
      color: #666;
      text-align: center;
      font-weight: 500;
    }
    .cat-photo {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .cat-emoji {
      width: 70%;
      max-width: 200px;
      height: 200px;
      border-radius: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 100px;
      color: white;
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
      line-height: 1.3;
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
      font-weight: 500;
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
  </style>
</head>
<body>
  <div class="poster">
    <div class="slogan">说不出来的，猫知道</div>
    
    <div class="cat-photo">
      <div class="cat-emoji">🐱</div>
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
</body>
</html>`;
}

// Test cases
const testCases = [
  {
    catId: 'kun_kun_mao',
    bodyState: '身体不舒服',
    need: '休息',
    filename: 'poster-kun-kun',
  },
  {
    catId: 'wei_qu_mao',
    bodyState: '心里堵',
    need: '被理解',
    filename: 'poster-wei-qu',
  },
  {
    catId: 'sa_huan_mao',
    bodyState: '说不出来',
    need: '被陪着',
    filename: 'poster-sa-huan',
  },
  {
    catId: 'beng_jin_mao',
    bodyState: '都有',
    need: '自己待着',
    filename: 'poster-beng-jin',
  },
  {
    catId: 'zhixiang_mao',
    bodyState: '说不上来',
    need: '自己待着',
    filename: 'poster-zhixiang',
  },
];

async function generatePosterImages() {
  console.log('🎨 Generating Poster Images with Puppeteer\n');
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const test of testCases) {
      const cat = catsMap[test.catId];
      if (!cat) {
        console.log(`❌ Cat not found: ${test.catId}`);
        continue;
      }

      const energy = calculateEnergyValue(test.bodyState, test.need, cat.energy);
      const html = generatePosterHTML(cat, test.bodyState, test.need, energy);

      // Create temporary HTML file
      const tempHtmlFile = `${test.filename}-temp.html`;
      fs.writeFileSync(tempHtmlFile, html);

      try {
        const page = await browser.newPage();
        
        // Set viewport to match poster size
        await page.setViewport({
          width: 375,
          height: 600,
          deviceScaleFactor: 2,
        });

        // Load the HTML file
        await page.goto(`file://${path.resolve(tempHtmlFile)}`, {
          waitUntil: 'networkidle0',
        });

        // Take screenshot
        const screenshotPath = `${test.filename}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
        });

        console.log(`✅ Generated: ${screenshotPath}`);
        console.log(`   Cat: ${cat.name}`);
        console.log(`   Energy: ${Math.round(energy)}%`);
        console.log(`   Size: 750×1200px (2x scale)`);
        console.log();

        await page.close();
      } catch (error) {
        console.log(`❌ Failed to generate ${test.filename}: ${error.message}`);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempHtmlFile)) {
          fs.unlinkSync(tempHtmlFile);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n💡 Puppeteer not available. Using alternative method...\n');
    
    // Fallback: just generate HTML files
    console.log('Generating HTML files instead (open in browser to view):\n');
    for (const test of testCases) {
      const cat = catsMap[test.catId];
      if (!cat) continue;

      const energy = calculateEnergyValue(test.bodyState, test.need, cat.energy);
      const html = generatePosterHTML(cat, test.bodyState, test.need, energy);
      const htmlFile = `${test.filename}.html`;
      fs.writeFileSync(htmlFile, html);
      console.log(`✅ ${htmlFile}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('='.repeat(60));
  console.log('\n📂 Poster files generated!\n');
}

generatePosterImages().catch(console.error);
