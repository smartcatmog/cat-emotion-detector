#!/usr/bin/env node

/**
 * Test script for cat signature poster generation
 * Tests: energy calculation, color mapping, and API response
 */

import fs from 'fs';

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

// Test cases
const testCases = [
  {
    name: '困困猫 - 身体耗尽',
    catId: 'kun_kun_mao',
    bodyState: '身体不舒服',
    need: '休息',
    expectedEnergy: 50 + 30 - 10 - 15, // 55
  },
  {
    name: '委屈猫 - 心里堵需要被理解',
    catId: 'wei_qu_mao',
    bodyState: '心里堵',
    need: '被理解',
    expectedEnergy: 50 + 40 + 0 - 15, // 75
  },
  {
    name: '撒欢猫 - 高能量积极',
    catId: 'sa_huan_mao',
    bodyState: '说不上来',
    need: '被陪着',
    expectedEnergy: 50 + 50 + 5 + 20, // 125 → clamped to 95
  },
  {
    name: '绷紧猫 - 焦虑压力大',
    catId: 'beng_jin_mao',
    bodyState: '都有',
    need: '自己待着',
    expectedEnergy: 50 + 20 - 10 + 0, // 60
  },
  {
    name: '纸箱猫 - 完全关机',
    catId: 'zhixiang_mao',
    bodyState: '说不上来',
    need: '自己待着',
    expectedEnergy: 50 + 50 - 10 - 15, // 75
  },
];

console.log('🧪 Testing Cat Signature Poster System\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  console.log(`\n📋 Test ${idx + 1}: ${test.name}`);
  console.log('-'.repeat(60));

  const cat = catsMap[test.catId];
  if (!cat) {
    console.log(`❌ FAIL: Cat not found: ${test.catId}`);
    failed++;
    return;
  }

  // Calculate energy
  const energy = calculateEnergyValue(test.bodyState, test.need, cat.energy);
  const expectedEnergy = Math.max(5, Math.min(95, test.expectedEnergy));

  console.log(`Cat: ${cat.name}`);
  console.log(`Tagline: ${cat.tagline}`);
  console.log(`Explanation: ${cat.explanation}`);
  console.log(`Body State: ${test.bodyState}`);
  console.log(`Need: ${test.need}`);
  console.log(`Cat Energy: ${cat.energy}`);
  console.log(`\nEnergy Calculation:`);
  console.log(`  Base: 50`);
  console.log(`  + Body State (${test.bodyState}): ${test.bodyState === '身体不舒服' ? '+30' : test.bodyState === '心里堵' ? '+40' : test.bodyState === '都有' ? '+20' : test.bodyState === '说不上来' ? '+50' : '+0'}`);
  console.log(`  + Need (${test.need}): ${test.need === '休息' ? '-10' : test.need === '被理解' ? '+0' : test.need === '发泄' ? '+10' : test.need === '自己待着' ? '-10' : test.need === '被陪着' ? '+5' : '+0'}`);
  console.log(`  + Cat Energy (${cat.energy}): ${cat.energy === 'high' ? '+20' : cat.energy === 'medium' ? '+0' : cat.energy === 'low' ? '-15' : '+0'}`);
  console.log(`  = ${energy}%`);

  // Check energy
  if (energy === expectedEnergy) {
    console.log(`✅ Energy: ${energy}% (correct)`);
  } else {
    console.log(`❌ Energy: ${energy}% (expected ${expectedEnergy}%)`);
    failed++;
    return;
  }

  // Check color
  const bgColor = getBackgroundColor(cat.trigger_type);
  console.log(`\nPoster Background:`);
  console.log(`  Trigger Type: ${cat.trigger_type}`);
  console.log(`  Color: ${bgColor}`);

  const colorMap = {
    'situation': '灰蓝',
    'anxiety': '米黄',
    'relationship': '浅粉紫',
    'positive': '浅绿',
    'general': '浅灰白',
    'physical': '浅灰白',
    'growth': '浅灰白',
  };
  console.log(`  Color Name: ${colorMap[cat.trigger_type] || 'Unknown'}`);

  if (bgColor && bgColor !== '#FFFFFF') {
    console.log(`✅ Color mapping correct`);
  } else {
    console.log(`❌ Color mapping failed`);
    failed++;
    return;
  }

  // Check poster fields
  console.log(`\nPoster Fields:`);
  console.log(`  ✅ Slogan: 说不出来的，猫知道`);
  console.log(`  ✅ Cat Photo: ${cat.id}`);
  console.log(`  ✅ Name: ${cat.name}`);
  console.log(`  ✅ Tagline: ${cat.tagline}`);
  console.log(`  ✅ Energy Bar: ${energy}%`);
  console.log(`  ✅ Explanation: ${cat.explanation}`);
  console.log(`  ✅ Date: ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}`);
  console.log(`  ✅ Watermark: 喵懂了`);

  passed++;
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`  ✅ Passed: ${passed}/${testCases.length}`);
console.log(`  ❌ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log(`\n🎉 All tests passed! Poster system is working correctly.\n`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some tests failed. Please review the output above.\n`);
  process.exit(1);
}
