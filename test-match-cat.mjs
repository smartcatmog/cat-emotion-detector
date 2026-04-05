#!/usr/bin/env node

const API_URL = 'https://cat-emotion-detector.vercel.app/api/match-cat';

const testCases = [
  {
    id: 1,
    input: '委屈',
    body_state: '有点累',
    mood_state: '低落',
    need: '自己待着',
    expected: '委屈猫',
    forbidden: [],
  },
  {
    id: 2,
    input: '我不想和这个世界说话',
    body_state: '一般般',
    mood_state: '心里有点堵',
    need: '自己待着',
    expected: '装死猫',
    forbidden: ['晒太阳猫', '躲柜子猫'],
  },
  {
    id: 3,
    input: '今天状态超好',
    body_state: '精力充沛',
    mood_state: '心情很好',
    need: '被陪着',
    expected: '撒欢猫',
    forbidden: [],
  },
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试 ${testCase.id}: ${testCase.input}`);
  console.log(`身体状态: ${testCase.body_state}`);
  console.log(`心情状态: ${testCase.mood_state}`);
  console.log(`现在需要: ${testCase.need}`);
  console.log(`期望结果: ${testCase.expected}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mood_text: testCase.input,
        body_state: testCase.body_state,
        need: testCase.need,
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      const error = await response.json();
      console.error('Error:', error);
      return false;
    }

    const result = await response.json();
    const cat = result.data.primary_cat;
    const reason = result.data.match_reason;
    const tags = result.data.emotion_tags;

    console.log(`\n返回结果:`);
    console.log(`  主猫: ${cat}`);
    console.log(`  邻近猫: ${result.data.neighbor_cat}`);
    console.log(`  情绪标签: ${tags.join(', ')}`);
    console.log(`  匹配原因: ${reason}`);

    // Check if result matches expected
    const isCorrect = cat === testCase.expected;
    const isForbidden = testCase.forbidden.includes(cat);

    if (isCorrect) {
      console.log(`\n✅ 测试通过 - 正确匹配到 ${cat}`);
      return true;
    } else if (isForbidden) {
      console.log(`\n❌ 测试失败 - 匹配到禁止的猫: ${cat}`);
      return false;
    } else {
      console.log(`\n⚠️  测试失败 - 期望 ${testCase.expected}，但得到 ${cat}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 请求失败:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🐱 MoodCat 猫签匹配 API 测试');
  console.log(`API: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试总结: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(60));
}

main().catch(console.error);
