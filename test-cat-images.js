// 测试脚本：验证 API 是否能正确返回图片 URL

const testCases = [
  {
    name: '困困猫',
    input: { mood_text: '今天很累', body_state: '身体不舒服', need: '休息' },
    expectedCatId: 'kun_kun_mao',
    expectedImage: '/cats/困困猫.png'
  },
  {
    name: '躲柜子猫',
    input: { mood_text: '想躲起来', body_state: '', need: '自己待着' },
    expectedCatId: 'duo_guizi_mao',
    expectedImage: '/cats/躲柜子猫.jpg'
  },
  {
    name: '炸毛猫',
    input: { mood_text: '烦躁，炸毛', body_state: '', need: '' },
    expectedCatId: 'zha_mao_mao',
    expectedImage: '/cats/炸毛猫.jpg'
  },
  {
    name: '舔毛猫',
    input: { mood_text: '焦虑', body_state: '', need: '' },
    expectedCatId: 'beng_jin_mao',
    expectedImage: '/cats/绷紧猫.jpg'
  },
  {
    name: '委屈猫',
    input: { mood_text: '被骂了，很委屈', body_state: '', need: '' },
    expectedCatId: 'wei_qu_mao',
    expectedImage: '/cats/委屈猫.jpg'
  }
];

async function runTests() {
  console.log('🧪 开始测试 37 只猫真猫图片集成...\n');
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`测试: ${testCase.name}`);
      console.log(`输入: ${JSON.stringify(testCase.input)}`);

      const response = await fetch('http://localhost:5173/api/social/cat-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input)
      });

      if (!response.ok) {
        console.log(`❌ 失败: HTTP ${response.status}`);
        failed++;
        continue;
      }

      const data = await response.json();
      const catData = data.data;

      console.log(`返回的猫: ${catData.name} (${catData.catId})`);
      console.log(`图片 URL: ${catData.catPhoto}`);

      // 验证
      let testPassed = true;
      if (catData.catId !== testCase.expectedCatId) {
        console.log(`⚠️  猫 ID 不匹配: 期望 ${testCase.expectedCatId}, 得到 ${catData.catId}`);
        testPassed = false;
      }
      if (catData.catPhoto !== testCase.expectedImage) {
        console.log(`⚠️  图片 URL 不匹配: 期望 ${testCase.expectedImage}, 得到 ${catData.catPhoto}`);
        testPassed = false;
      }

      if (testPassed) {
        console.log(`✅ 通过\n`);
        passed++;
      } else {
        console.log(`❌ 失败\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ 错误: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
