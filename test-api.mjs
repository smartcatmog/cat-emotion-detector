#!/usr/bin/env node

/**
 * Test script for cat signature API
 * Tests: API response structure and field validation
 */

import fs from 'fs';

// Load cats data
const catsData = JSON.parse(fs.readFileSync('src/data/cats.json', 'utf8'));
const catsMap = {};
catsData.cats.forEach(cat => {
  catsMap[cat.id] = cat;
});

// Simulate API response
function generateAPIResponse(catId) {
  const cat = catsMap[catId];
  if (!cat) return null;

  return {
    success: true,
    data: {
      catId: cat.id,
      name: cat.name,
      tagline: cat.tagline,
      emoji: '😺',
      explanation: cat.explanation,
      suggestion: cat.suggestion,
      notSuitable: cat.avoid,
      recoveryMethods: cat.recovery_tags,
      neighbor: 'neighbor_id',
      neighborName: 'neighbor_name',
      catPhoto: `https://cat-emotion-detector.vercel.app/cats/${cat.name}.jpg`,
      energy: cat.energy,
      triggerType: cat.trigger_type,
    },
  };
}

// Test cases
const testCases = [
  'kun_kun_mao',
  'wei_qu_mao',
  'sa_huan_mao',
  'beng_jin_mao',
  'zhixiang_mao',
];

console.log('🧪 Testing Cat Signature API Response\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

testCases.forEach((catId, idx) => {
  console.log(`\n📋 Test ${idx + 1}: API Response for ${catId}`);
  console.log('-'.repeat(70));

  const response = generateAPIResponse(catId);
  if (!response) {
    console.log(`❌ FAIL: Cat not found: ${catId}`);
    failed++;
    return;
  }

  const { data } = response;
  const requiredFields = [
    'catId',
    'name',
    'tagline',
    'emoji',
    'explanation',
    'suggestion',
    'notSuitable',
    'recoveryMethods',
    'neighbor',
    'neighborName',
    'catPhoto',
    'energy',
    'triggerType',
  ];

  console.log(`Response Structure:`);
  let allFieldsPresent = true;

  requiredFields.forEach(field => {
    const hasField = field in data;
    const value = data[field];
    const status = hasField ? '✅' : '❌';
    console.log(`  ${status} ${field}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : JSON.stringify(value)}`);
    if (!hasField) allFieldsPresent = false;
  });

  // Validate field types
  console.log(`\nField Type Validation:`);
  const typeChecks = [
    { field: 'catId', type: 'string' },
    { field: 'name', type: 'string' },
    { field: 'tagline', type: 'string' },
    { field: 'emoji', type: 'string' },
    { field: 'explanation', type: 'string' },
    { field: 'suggestion', type: 'string' },
    { field: 'notSuitable', type: 'object' }, // array
    { field: 'recoveryMethods', type: 'object' }, // array
    { field: 'energy', type: 'string' },
    { field: 'triggerType', type: 'string' },
  ];

  let allTypesCorrect = true;
  typeChecks.forEach(({ field, type }) => {
    const actualType = Array.isArray(data[field]) ? 'object' : typeof data[field];
    const isCorrect = actualType === type;
    const status = isCorrect ? '✅' : '❌';
    console.log(`  ${status} ${field}: ${actualType} (expected ${type})`);
    if (!isCorrect) allTypesCorrect = false;
  });

  // Validate energy values
  console.log(`\nEnergy Value Validation:`);
  const validEnergies = ['high', 'medium', 'low'];
  const energyValid = validEnergies.includes(data.energy);
  console.log(`  ${energyValid ? '✅' : '❌'} energy: "${data.energy}" (valid: ${validEnergies.join(', ')})`);

  // Validate trigger_type values
  console.log(`\nTrigger Type Validation:`);
  const validTriggerTypes = ['situation', 'anxiety', 'relationship', 'positive', 'general', 'physical', 'growth'];
  const triggerTypeValid = validTriggerTypes.includes(data.triggerType);
  console.log(`  ${triggerTypeValid ? '✅' : '❌'} triggerType: "${data.triggerType}" (valid: ${validTriggerTypes.join(', ')})`);

  // Validate array fields
  console.log(`\nArray Field Validation:`);
  const notSuitableValid = Array.isArray(data.notSuitable) && data.notSuitable.length > 0;
  const recoveryMethodsValid = Array.isArray(data.recoveryMethods) && data.recoveryMethods.length > 0;
  console.log(`  ${notSuitableValid ? '✅' : '❌'} notSuitable: ${data.notSuitable.length} items`);
  console.log(`  ${recoveryMethodsValid ? '✅' : '❌'} recoveryMethods: ${data.recoveryMethods.length} items`);

  if (allFieldsPresent && allTypesCorrect && energyValid && triggerTypeValid && notSuitableValid && recoveryMethodsValid) {
    console.log(`\n✅ API Response is valid`);
    passed++;
  } else {
    console.log(`\n❌ API Response has issues`);
    failed++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Test Results:`);
console.log(`  ✅ Passed: ${passed}/${testCases.length}`);
console.log(`  ❌ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log(`\n🎉 All API tests passed! Response structure is correct.\n`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some API tests failed. Please review the output above.\n`);
  process.exit(1);
}
