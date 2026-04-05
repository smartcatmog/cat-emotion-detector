#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the API file
const apiContent = readFileSync(join(__dirname, 'api/match-cat.ts'), 'utf-8');

// Extract the SYSTEM_PROMPT
const promptMatch = apiContent.match(/const SYSTEM_PROMPT = `([\s\S]*?)`/);
if (!promptMatch) {
  console.error('Could not find SYSTEM_PROMPT in api/match-cat.ts');
  process.exit(1);
}

const systemPrompt = promptMatch[1];

console.log('✅ 成功读取 SYSTEM_PROMPT');
console.log(`\n系统提示长度: ${systemPrompt.length} 字符`);
console.log('\n系统提示内容预览:');
console.log(systemPrompt.substring(0, 500) + '...\n');

// Test cases
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

console.log('📋 测试用例:');
testCases.forEach((tc) => {
  console.log(`\n测试 ${tc.id}: "${tc.input}"`);
  console.log(`  身体: ${tc.body_state}, 心情: ${tc.mood_state}, 需要: ${tc.need}`);
  console.log(`  期望: ${tc.expected}`);
  if (tc.forbidden.length > 0) {
    console.log(`  禁止: ${tc.forbidden.join(', ')}`);
  }
});

console.log('\n\n⏳ 等待 Vercel 部署完成...');
console.log('部署完成后，请运行: node test-match-cat.mjs');
