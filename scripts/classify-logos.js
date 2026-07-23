#!/usr/bin/env node
/**
 * classify-logos.js — 用 sharp 分析 public/logos/tools 下每个 logo 的像素特征，
 * 自动为 tools.json 写入 logoTheme 字段，供 LogoTile 组件做三态自适应渲染：
 *
 *   - light（默认，省略字段）：深色/彩色透明字形 → 白底 + 留白 + contain
 *   - dark：浅色/白色透明字形（白底会隐形）→ 深底 #0d1117 + 留白 + contain
 *   - fill：自带不透明背景的方形图标 → 无留白 + cover 铺满圆角框
 *
 * 判定：
 *   1. 四角不透明且透明像素占比 <10% → 自带背景 → fill
 *   2. 非透明字形的平均亮度 > 190（接近白/浅色）→ dark
 *   3. 其余 → light（清除字段）
 *
 * FORCE_LIGHT：用户明确要求保持白底的边界 logo（亮青/亮黄等在白底仍可辨识）。
 * .ico/.svg 无法用 sharp 逐像素分析，默认 light。
 * 幂等：可重复运行。
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const TOOLS_FILE = path.join(ROOT, 'src/data/tools.json');
const DIR = path.join(ROOT, 'public/logos/tools');

// 用户指定保持白底（自动检测可能误判为 dark）
const FORCE_LIGHT = new Set(['jimeng-ai', 'hugging-face']);

async function classify(file) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) return 'light'; // ico/svg 默认 light
  const { data, info } = await sharp(path.join(DIR, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const total = w * h;

  // 四角不透明计数
  const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
  let cornerOpaque = 0;
  for (const [x, y] of corners) {
    if (data[(y * w + x) * ch + 3] > 200) cornerOpaque++;
  }

  let trans = 0, markN = 0, lumSum = 0;
  for (let i = 0; i < total; i++) {
    const a = data[i * ch + 3];
    if (a < 32) trans++;
    if (a < 128) continue;
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    lumSum += 0.299 * r + 0.587 * g + 0.114 * b;
    markN++;
  }
  const transRatio = trans / total;
  const markLum = markN ? lumSum / markN : 0;

  if (transRatio < 0.10 && cornerOpaque >= 3) return 'fill';
  if (markLum > 190) return 'dark';
  return 'light';
}

async function main() {
  const tools = JSON.parse(fs.readFileSync(TOOLS_FILE, 'utf8'));
  const summary = { light: [], dark: [], fill: [] };

  for (const tool of tools) {
    const file = tool.logo.replace(/^\/logos\/tools\//, '');
    let theme = 'light';
    try {
      theme = await classify(file);
    } catch (e) {
      console.log(`WARN ${tool.slug}: ${e.message} → light`);
    }
    if (FORCE_LIGHT.has(tool.slug)) theme = 'light';

    if (theme === 'light') delete tool.logoTheme;
    else tool.logoTheme = theme;
    summary[theme].push(tool.slug);
  }

  fs.writeFileSync(TOOLS_FILE, JSON.stringify(tools, null, 2) + '\n');
  console.log(`dark (${summary.dark.length}): ${summary.dark.join(', ')}`);
  console.log(`fill (${summary.fill.length}): ${summary.fill.join(', ')}`);
  console.log(`light (${summary.light.length})`);
}

main();
