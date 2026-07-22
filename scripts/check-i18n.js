#!/usr/bin/env node
/**
 * i18n 键完整性检查
 * 遍历 messages/{en,zh,ja,es,fr}.json，确认五个文件的键集合一致。
 * 退出码 0 = 全部一致，1 = 存在差异。
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'zh', 'ja', 'es', 'fr'];
const MESSAGES_DIR = path.resolve(__dirname, '..', 'messages');

/**
 * 递归收集对象所有键路径（用 '.' 连接嵌套层级）
 */
function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    keys.push(fullKey);
    if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys.push(...collectKeys(obj[k], fullKey));
    }
  }
  return keys;
}

let hasError = false;

// 1. 读取所有 locale 文件
const data = {};
for (const locale of LOCALES) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] 文件不存在: messages/${locale}.json`);
    hasError = true;
    continue;
  }
  try {
    data[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`[ERROR] JSON 解析失败: messages/${locale}.json — ${e.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n✘ i18n 检查失败：存在文件缺失或 JSON 语法错误');
  process.exit(1);
}

// 2. 以 en 为基准，收集所有键路径
const enKeys = new Set(collectKeys(data.en));

// 3. 逐一对比其余 locale
for (const locale of LOCALES) {
  if (locale === 'en') continue;
  const localeKeys = new Set(collectKeys(data[locale]));

  const missing = [...enKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !enKeys.has(k));

  if (missing.length > 0) {
    hasError = true;
    console.error(`\n[ERROR] messages/${locale}.json 缺少以下键（共 ${missing.length} 个）:`);
    missing.forEach(k => console.error(`  - ${k}`));
  }
  if (extra.length > 0) {
    hasError = true;
    console.error(`\n[ERROR] messages/${locale}.json 多出以下键（共 ${extra.length} 个）:`);
    extra.forEach(k => console.error(`  + ${k}`));
  }
}

// 4. 同时检查各 locale 顶层分类是否一致
const enTopKeys = Object.keys(data.en).sort();
for (const locale of LOCALES) {
  if (locale === 'en') continue;
  const localeTopKeys = Object.keys(data[locale]).sort();
  const missingTop = enTopKeys.filter(k => !localeTopKeys.includes(k));
  const extraTop = localeTopKeys.filter(k => !enTopKeys.includes(k));
  if (missingTop.length > 0 || extraTop.length > 0) {
    hasError = true;
    console.error(`\n[ERROR] messages/${locale}.json 顶层分类不一致:`);
    if (missingTop.length) console.error(`  缺少: ${missingTop.join(', ')}`);
    if (extraTop.length) console.error(`  多出: ${extraTop.join(', ')}`);
  }
}

if (hasError) {
  console.error('\n✘ i18n 键完整性检查失败');
  process.exit(1);
} else {
  console.log(`✔ i18n 键完整性检查通过（${LOCALES.length} 个语言文件，${enKeys.size} 个键路径）`);
}
