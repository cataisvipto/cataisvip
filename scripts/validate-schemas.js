#!/usr/bin/env node
/**
 * JSON Schema 结构自动化校验
 * 使用 ajv 对 src/data/ 下的 JSON 数据文件执行 schema 校验。
 * 退出码 0 = 全部通过，1 = 存在错误。
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data');
const SCHEMA_DIR = path.resolve(__dirname, 'schemas');

const ajv = new Ajv({ allErrors: true, verbose: true });

const TASKS = [
  { data: 'tools.json',       schema: 'tools.schema.json' },
  { data: 'toolDetails.json', schema: 'toolDetails.schema.json' },
  { data: 'skills.json',      schema: 'skills.schema.json' },
  { data: 'blogPosts.json',   schema: 'blogPosts.schema.json' },
];

/** 加载并编译 schema */
function loadSchema(filename) {
  const filePath = path.join(SCHEMA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`[FATAL] Schema 文件不存在: ${filename}`);
    process.exit(1);
  }
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return ajv.compile(schema);
  } catch (e) {
    console.error(`[FATAL] Schema 解析失败: ${filename} — ${e.message}`);
    process.exit(1);
  }
}

/** 加载 JSON 数据文件 */
function loadData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`[FATAL] 数据文件解析失败: ${filename} — ${e.message}`);
    process.exit(1);
  }
}

let totalErrors = 0;

console.log('🔍 JSON Schema 结构校验开始\n');

for (const task of TASKS) {
  const validate = loadSchema(task.schema);
  const data = loadData(task.data);

  const valid = validate(data);
  if (valid) {
    console.log(`  ✔ ${task.data} — Schema 校验通过`);
  } else {
    totalErrors++;
    console.error(`\n  ✘ ${task.data} — Schema 校验失败（共 ${validate.errors.length} 个错误）:`);
    // 按 instancePath 分组去重显示
    const seen = new Set();
    for (const err of validate.errors) {
      const key = `${err.instancePath}:${err.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const fieldPath = err.instancePath || '(root)';
      const extra = err.params ? JSON.stringify(err.params) : '';
      console.error(`     ${fieldPath} — ${err.message} ${extra}`);
    }
    console.error('');
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (totalErrors > 0) {
  console.error(`✘ Schema 校验失败：${totalErrors} 个文件未通过`);
  process.exit(1);
} else {
  console.log(`✔ Schema 校验全部通过（${TASKS.length} 个文件）`);
  process.exit(0);
}
