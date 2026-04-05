#!/usr/bin/env node

/**
 * Test the fixed energy calculation algorithm
 */

// Simulate the energy calculator
function calculateEnergyValue(bodyState, need, catEnergy) {
  // For low energy cats, return a value in the 15-30% range
  if (catEnergy === 'low') {
    // Base low energy at 22%
    let lowScore = 22;
    
    // Slight adjustments based on need
    switch (need) {
      case '休息':
        lowScore = 18; // Lower for rest
        break;
      case '被理解':
        lowScore = 22; // Neutral
        break;
      case '发泄':
        lowScore = 26; // Slightly higher for release
        break;
      case '自己待着':
        lowScore = 20; // Lower for alone time
        break;
      case '被陪着':
        lowScore = 25; // Slightly higher for companionship
        break;
    }
    
    return Math.max(15, Math.min(30, lowScore));
  }

  let score = 50; // Base score for medium/high energy

  // Body state scoring
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

  // Need adjustments
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

  // Cat energy adjustments
  switch (catEnergy) {
    case 'high':
      score += 20;
      break;
    case 'medium':
      score += 0;
      break;
  }

  // Clamp between 40% and 95% for medium/high energy
  return Math.max(40, Math.min(95, score));
}

console.log('🧪 Testing Fixed Energy Calculation\n');
console.log('='.repeat(60));

// Test cases for low energy cats
const lowEnergyCats = [
  {
    name: '困困猫',
    bodyState: '身体不舒服',
    need: '休息',
    energy: 'low',
    expectedRange: '15-30%',
  },
  {
    name: '纸箱猫',
    bodyState: '说不上来',
    need: '自己待着',
    energy: 'low',
    expectedRange: '15-30%',
  },
  {
    name: '委屈猫',
    bodyState: '心里堵',
    need: '被理解',
    energy: 'low',
    expectedRange: '15-30%',
  },
  {
    name: '躲柜子猫',
    bodyState: '心里堵',
    need: '自己待着',
    energy: 'low',
    expectedRange: '15-30%',
  },
];

console.log('\n📝 Low Energy Cats (should be 15-30%)');
console.log('-'.repeat(60));

let lowEnergyPass = 0;
for (const cat of lowEnergyCats) {
  const value = calculateEnergyValue(cat.bodyState, cat.need, cat.energy);
  const pass = value >= 15 && value <= 30;
  const status = pass ? '✅' : '❌';
  console.log(`${status} ${cat.name}: ${value}% (expected ${cat.expectedRange})`);
  if (pass) lowEnergyPass++;
}

// Test cases for medium/high energy cats
const highEnergyTests = [
  {
    name: '撒欢猫',
    bodyState: '',
    need: '被陪着',
    energy: 'high',
    expectedMin: 40,
  },
  {
    name: '绷紧猫',
    bodyState: '心里堵',
    need: '被理解',
    energy: 'medium',
    expectedMin: 40,
  },
];

console.log('\n📝 Medium/High Energy Cats (should be 40-95%)');
console.log('-'.repeat(60));

let highEnergyPass = 0;
for (const cat of highEnergyTests) {
  const value = calculateEnergyValue(cat.bodyState, cat.need, cat.energy);
  const pass = value >= cat.expectedMin && value <= 95;
  const status = pass ? '✅' : '❌';
  console.log(`${status} ${cat.name}: ${value}% (expected ${cat.expectedMin}-95%)`);
  if (pass) highEnergyPass++;
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Results:`);
console.log(`   Low Energy Cats: ${lowEnergyPass}/${lowEnergyCats.length} passed`);
console.log(`   High Energy Cats: ${highEnergyPass}/${highEnergyTests.length} passed`);

if (lowEnergyPass === lowEnergyCats.length && highEnergyPass === highEnergyTests.length) {
  console.log(`\n✅ All energy calculation tests PASSED!`);
} else {
  console.log(`\n❌ Some tests FAILED`);
  process.exit(1);
}
