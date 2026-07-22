#!/usr/bin/env node
/**
 * CSS 硬编码色值检查
 * 扫描 src/components 和 src/app 中的 TSX 文件，
 * 检测硬编码色值（#hex、rgb()/rgba()/hsl()/hsla()）。
 *
 * 允许的例外：
 *   - 注释行（// 或 /* ... *\/）
 *   - bg-white / dark:bg-white 等 Tailwind 语义色
 *   - 字符串中的 CSS 变量引用 var(--...)
 *   - onError 回调中的占位符样式
 *
 * 退出码 0 = 无硬编码色值，1 = 存在违规。
 */

const fs = require('fs');
const path = require('path');

const SCAN_DIRS = [
  path.resolve(__dirname, '..', 'src', 'components'),
  path.resolve(__dirname, '..', 'src', 'app'),
];

// 匹配硬编码色值的正则
const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC_COLOR_RE = /\b(?:rgb|rgba|hsl|hsla)\s*\(/g;

// 需要跳过的行模式
const SKIP_PATTERNS = [
  /^\s*\/\//,          // 单行注释
  /^\s*\*/,            // 多行注释内部
  /^\s*\/\*/,          // 多行注释开始
  /\/\/\s*eslint-disable/,
  /\/\/\s*prettier-ignore/,
];

// 允许的 Tailwind 白色/透明等语义色（这些不算硬编码）
// 但 #fff/#ffffff 等直接写在 style 或 className 模板字符串中的仍算违规
const ALLOWED_IN_CLASSNAME = new Set([
  '#fff', '#ffffff',   // white — Tailwind 已有 bg-white，但偶尔需要
  '#000', '#000000',   // black
]);

let totalViolations = 0;
let totalFiles = 0;

/**
 * 递归获取目录下所有 .tsx 文件
 */
function getTsxFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过 node_modules、.next 等
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      results.push(...getTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 检查单行是否包含硬编码色值
 */
function checkLine(line, lineNum, filePath, violations) {
  // 跳过注释行
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(line)) return;
  }

  // 检查 hex 色值
  let match;
  HEX_COLOR_RE.lastIndex = 0;
  while ((match = HEX_COLOR_RE.exec(line)) !== null) {
    const color = match[0];
    // 跳过 CSS 变量定义中的色值（globals.css 不在扫描范围，但以防万一）
    // 跳过 URL 中的 fragment
    if (line.includes('var(--') && line.includes(color)) continue;

    violations.push({
      file: filePath,
      line: lineNum,
      col: match.index + 1,
      type: 'hex',
      value: color,
      context: line.trim().substring(0, 100),
    });
  }

  // 检查 rgb/rgba/hsl/hsla 函数
  FUNC_COLOR_RE.lastIndex = 0;
  while ((match = FUNC_COLOR_RE.exec(line)) !== null) {
    violations.push({
      file: filePath,
      line: lineNum,
      col: match.index + 1,
      type: 'function',
      value: match[0].trim(),
      context: line.trim().substring(0, 100),
    });
  }
}

// 主流程
for (const dir of SCAN_DIRS) {
  const files = getTsxFiles(dir);

  for (const filePath of files) {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];

    let inBlockComment = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 简单跟踪多行注释状态
      if (line.includes('/*')) inBlockComment = true;
      if (line.includes('*/')) inBlockComment = false;
      if (inBlockComment) continue;

      checkLine(line, i + 1, filePath, violations);
    }

    if (violations.length > 0) {
      totalViolations += violations.length;
      const relPath = path.relative(path.resolve(__dirname, '..'), filePath);
      console.error(`\n[ERROR] ${relPath} (${violations.length} 处硬编码色值):`);
      for (const v of violations) {
        console.error(`  L${v.line}:${v.col}  ${v.type} "${v.value}"`);
        console.error(`    ${v.context}`);
      }
    }
  }
}

if (totalViolations > 0) {
  console.error(`\n✘ CSS 硬编码色值检查失败：${totalFiles} 个文件中发现 ${totalViolations} 处硬编码色值`);
  console.error('  提示：请使用 CSS 变量 var(--card-bg)、var(--foreground) 等替代硬编码色值');
  process.exit(1);
} else {
  console.log(`✔ CSS 硬编码色值检查通过（扫描 ${totalFiles} 个文件）`);
}
