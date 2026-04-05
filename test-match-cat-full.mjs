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
    description: '关键词匹配 - 委屈',
  },
  {
    id: 2,
    input: '我不想和这个世界说话',
    body_state: '一般般',
    mood_state: '心里有点堵',
    need: '自己待着',
    expected: '装死猫',
    forbidden: ['晒太阳猫', '躲柜子猫'],
    description: '关键词匹配 - 不想和世界说话',
  },
  {
    id: 3,
    input: '今天状态超好',
    body_state: '精力充沛',
    mood_state: '心情很好',
    need: '被陪着',
    expected: '撒欢猫',
    forbidden: [],
    description: '关键词匹配 - 状态超好',
  },
  {
    id: 4,
    input: '被气到',
    body_state: '一般般',
    mood_state: '烦躁',
    need: '发泄',
    expected: '炸锅猫',
    forbidden: [],
    description: '关键词匹配 - 被气到',
  },
  {
    id: 5,
    input: '睡不着',
    body_state: '一般般',
    mood_state: '说不清楚',
    need: '自己待着',
    expected: '失眠猫',
    forbidden: [],
    description: '关键词匹配 - 睡不着',
  },
  {
    id: 6,
    input: '迷茫',
    body_state: '一般般',
    mood_state: '说不清楚',
    need: '自己待着',
    expected: '迷路猫',
    forbidden: [],
    description: '关键词匹配 - 迷茫',
  },
  {
    id: 7,
    input: '等消息',
    body_state: '一般般',
    mood_state: '心里有点堵',
    need: '自己待着',
    expected: '等门猫',
    forbidden: [],
    description: '关键词匹配 - 等消息',
  },
  {
    id: 8,
    input: '想消失',
    body_state: '一般般',
    mood_state: '低落',
    need: '自己待着',
    expected: '躲柜子猫',
    forbidden: [],
    description: '关键词匹配 - 想消失',
  },
  {
    id: 9,
    input: '烦死了',
    body_state: '一般般',
    mood_state: '烦躁',
    need: '发泄',
    expected: '炸毛猫',
    forbidden: [],
    description: '关键词匹配 - 烦死了',
  },
  {
    id: 10,
    input: '好累',
    body_state: '有点累',
    mood_state: '低落',
    need: '休息',
    expected: '因因猫',
    forbidden: [],
    description: '关键词匹配 - 好累',
  },
  {
    id: 11,
    input: '没人懂我',
    body_state: '一般般',
    mood_state: '低落',
    need: '被理解',
    expected: '委屈猫',
    forbidden: [],
    description: '关键词匹配 - 没人懂我',
  },
  {
    id: 12,
    input: '明天要上班',
    body_state: '一般般',
    mood_state: '低落',
    need: '自己待着',
    expected: '周日晚上猫',
    forbidden: [],
    description: '关键词匹配 - 明天要上班',
  },
  {
    id: 13,
    input: '假期结束',
    body_state: '一般般',
    mood_state: '低落',
    need: '休息',
    expected: '假期结束猫',
    forbidden: [],
    description: '关键词匹配 - 假期结束',
  },
  {
    id: 14,
    input: '要考试',
    body_state: '一般般',
    mood_state: '心里有点堵',
    need: '被理解',
    expected: '考前猫',
    forbidden: [],
    description: '关键词匹配 - 要考试',
  },
  {
    id: 15,
    input: '发呆',
    body_state: '一般般',
    mood_state: '说不清楚',
    need: '自己待着',
    expected: '发呆猫',
    forbidden: [],
    description: '关键词匹配 - 发呆',
  },
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`测试 ${testCase.id}: ${testCase.description}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`输入: "${testCase.input}"`);
  console.log(`身体状态: ${testCase.body_state}`);
  console.log(`心情状态: ${testCase.mood_state}`);
  console.log(`现在需要: ${testCase.need}`);
  console.log(`期望结果: ${testCase.expected}`);
  if (testCase.forbidden.length > 0) {
    console.log(`禁止结果: ${testCase.forbidden.join(', ')}`);
  }

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
      return { passed: false, reason: `HTTP ${response.status}` };
    }

    const result = await response.json();
    const cat = result.data.primary_cat;
    const reason = result.data.match_reason;
    const tags = result.data.emotion_tags;
    const neighbor = result.data.neighbor_cat;

    console.log(`\n返回结果:`);
    console.log(`  主猫: ${cat}`);
    console.log(`  邻近猫: ${neighbor}`);
    console.log(`  情绪标签: ${tags.join(', ')}`);
    console.log(`  匹配原因: ${reason}`);

    // Check if result matches expected
    const isCorrect = cat === testCase.expected;
    const isForbidden = testCase.forbidden.includes(cat);

    if (isCorrect) {
      console.log(`\n✅ 测试通过 - 正确匹配到 ${cat}`);
      return { passed: true, reason: 'Correct match' };
    } else if (isForbidden) {
      console.log(`\n❌ 测试失败 - 匹配到禁止的猫: ${cat}`);
      return { passed: false, reason: `Forbidden cat: ${cat}` };
    } else {
      console.log(`\n⚠️  测试失败 - 期望 ${testCase.expected}，但得到 ${cat}`);
      return { passed: false, reason: `Expected ${testCase.expected}, got ${cat}` };
    }
  } catch (error) {
    console.error(`❌ 请求失败:`, error.message);
    return { passed: false, reason: error.message };
  }
}

async function main() {
  console.log('🐱 MoodCat 猫签匹配 API 完整测试');
  console.log(`API: ${API_URL}`);
  console.log(`总测试数: ${testCases.length}\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({
      id: testCase.id,
      description: testCase.description,
      ...result,
    });
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 测试总结');
  console.log('='.repeat(70));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n总计: ${passed} 通过, ${failed} 失败 (共 ${testCases.length} 个)\n`);

  if (failed > 0) {
    console.log('失败的测试:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  测试 ${r.id}: ${r.description}`);
      console.log(`    原因: ${r.reason}`);
    });
  }

  console.log(`\n${'='.repeat(70)}`);
  if (failed === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log(`⚠️  有 ${failed} 个测试失败`);
  }
  console.log('='.repeat(70));
}

main().catch(console.error);
