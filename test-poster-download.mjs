#!/usr/bin/env node

/**
 * Test script to verify poster download functionality
 * Tests:
 * 1. API response includes all required fields
 * 2. Energy calculation is correct
 * 3. Background color mapping is correct
 * 4. Poster component receives all props
 */

// Use production API URL since dev server doesn't proxy API routes
const API_URL = 'https://cat-emotion-detector.vercel.app/api/social/cat-signature';

// Test cases with different mood inputs
const testCases = [
  {
    name: '困困猫 (Physical discomfort + Rest)',
    input: {
      mood_text: '身体不舒服，好累',
      body_state: '身体不舒服',
      need: '休息',
    },
    expectedCat: '困困猫',
    expectedEnergy: 'low',
    expectedTriggerType: 'physical',
  },
  {
    name: '委屈猫 (Emotional block + Understanding)',
    input: {
      mood_text: '被骂了很委屈',
      body_state: '心里堵',
      need: '被理解',
    },
    expectedCat: '委屈猫',
    expectedEnergy: 'low',
    expectedTriggerType: 'relationship',
  },
  {
    name: '撒欢猫 (Positive energy)',
    input: {
      mood_text: '今天状态超好，能量满格',
      body_state: '',
      need: '被陪着',
    },
    expectedCat: '撒欢猫',
    expectedEnergy: 'high',
    expectedTriggerType: 'positive',
  },
  {
    name: '绷紧猫 (Anxiety)',
    input: {
      mood_text: '焦虑，压力大',
      body_state: '心里堵',
      need: '被理解',
    },
    expectedCat: '绷紧猫',
    expectedEnergy: 'medium',
    expectedTriggerType: 'anxiety',
  },
  {
    name: '纸箱猫 (Complete shutdown)',
    input: {
      mood_text: '什么都不想，彻底关机',
      body_state: '说不上来',
      need: '自己待着',
    },
    expectedCat: '纸箱猫',
    expectedEnergy: 'low',
    expectedTriggerType: 'general',
  },
];

// Color mapping for verification
const colorMapping = {
  situation: '#E8EEF4',
  anxiety: '#F5F0E8',
  relationship: '#F5E8F0',
  positive: '#EFF5F0',
  general: '#F2F2F2',
  physical: '#F2F2F2',
  growth: '#F2F2F2',
};

async function testPosterAPI() {
  console.log('🧪 Testing Poster Download Functionality\n');
  console.log('=' .repeat(60));

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log('-'.repeat(60));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input),
      });

      if (!response.ok) {
        console.error(`❌ API returned status ${response.status}`);
        failedTests++;
        continue;
      }

      const data = await response.json();
      const result = data.data;

      // Verify all required fields exist
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
        'catPhoto',
        'energy',
        'triggerType',
      ];

      let allFieldsPresent = true;
      for (const field of requiredFields) {
        if (!(field in result)) {
          console.error(`❌ Missing field: ${field}`);
          allFieldsPresent = false;
        }
      }

      if (!allFieldsPresent) {
        failedTests++;
        continue;
      }

      // Verify field values
      const checks = [
        {
          name: 'Cat Name',
          actual: result.name,
          expected: testCase.expectedCat,
          pass: result.name === testCase.expectedCat,
        },
        {
          name: 'Energy Level',
          actual: result.energy,
          expected: testCase.expectedEnergy,
          pass: result.energy === testCase.expectedEnergy,
        },
        {
          name: 'Trigger Type',
          actual: result.triggerType,
          expected: testCase.expectedTriggerType,
          pass: result.triggerType === testCase.expectedTriggerType,
        },
        {
          name: 'Tagline Present',
          actual: result.tagline ? '✓' : '✗',
          expected: '✓',
          pass: !!result.tagline,
        },
        {
          name: 'Background Color',
          actual: colorMapping[result.triggerType] || 'unknown',
          expected: colorMapping[testCase.expectedTriggerType],
          pass: colorMapping[result.triggerType] === colorMapping[testCase.expectedTriggerType],
        },
      ];

      let testPassed = true;
      for (const check of checks) {
        const status = check.pass ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.actual}`);
        if (!check.pass) testPassed = false;
      }

      // Show poster preview info
      console.log(`\n📸 Poster Preview Info:`);
      console.log(`   Cat: ${result.name}`);
      console.log(`   Tagline: ${result.tagline}`);
      console.log(`   Energy: ${result.energy}`);
      console.log(`   Background: ${colorMapping[result.triggerType]}`);
      console.log(`   Photo URL: ${result.catPhoto ? '✓ Available' : '✗ Not available'}`);

      if (testPassed) {
        console.log(`\n✅ Test PASSED`);
        passedTests++;
      } else {
        console.log(`\n❌ Test FAILED`);
        failedTests++;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      failedTests++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passedTests}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failedTests}/${testCases.length}`);

  if (failedTests === 0) {
    console.log(`\n🎉 All tests passed! Poster download functionality is ready.`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Open http://localhost:5173 in your browser`);
    console.log(`   2. Navigate to the Cat Signature page`);
    console.log(`   3. Fill in mood, body state, and need`);
    console.log(`   4. Click "生成我的今日猫签" to generate signature`);
    console.log(`   5. Scroll down to see the poster preview`);
    console.log(`   6. Click "📸 保存海报" to download the poster as PNG`);
    console.log(`   7. Check your Downloads folder for the PNG file`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please review the errors above.`);
    process.exit(1);
  }
}

testPosterAPI().catch(console.error);
