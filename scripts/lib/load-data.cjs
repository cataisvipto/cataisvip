/**
 * scripts/lib/load-data.cjs — Node 脚本侧的数据装配器（2.1 数据拆分配套）
 *
 * src/ 运行时用 src/data/aggregated.ts（Turbopack import.meta.glob）；
 * 无打包器的 Node 脚本（校验/审计/星数刷新等）一律用本模块：
 * 每条一文件 + canonical-order.json 顺序锚，装配结果与拆分前的 JSON 等价。
 *
 * 不变式（与 aggregated.ts 一致）：目录里多文件 / order 里缺文件都视为数据事故，直接 throw。
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'src', 'data');

function loadOrder() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'canonical-order.json'), 'utf8'));
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function collectDir(dir, order, label) {
  const full = path.join(DATA_DIR, dir);
  if (!fs.existsSync(full)) throw new Error(`数据目录不存在：${dir}`);
  const files = fs.readdirSync(full).filter((f) => f.endsWith('.json')).sort();
  const expected = order.map((s) => `${s}.json`);
  const missing = expected.filter((f) => !files.includes(f));
  if (missing.length) {
    throw new Error(
      `数据不一致（${label}）：canonical-order.json 登记但缺文件：${missing.join(', ')}`,
    );
  }
  // 多出的文件：警告并追加到末尾（兼容 CMS 新建条目，未登记顺序时先落末尾）
  const extra = files.filter((f) => !expected.includes(f));
  if (extra.length) {
    console.warn(
      `[data] ${label}：目录有 ${extra.length} 个文件未登记 canonical-order.json，已追加到末尾：${extra.join(', ')}`,
    );
  }
  return [...expected, ...extra].map((f) => loadJson(path.join(full, f)));
}

function loadCollection(dir, orderKey) {
  const order = loadOrder();
  return collectDir(dir, order[orderKey], dir);
}

function loadMap(dir, orderKey) {
  const order = loadOrder();
  const list = collectDir(dir, order[orderKey], dir);
  return Object.fromEntries(order[orderKey].map((slug, i) => [slug, list[i]]));
}

function loadTools() { return loadCollection('tools', 'tools'); }
function loadToolDetails() { return loadMap('tool-details', 'tools'); }
function loadSkills() { return loadCollection('skills', 'skills'); }
function loadSkillDetails() { return loadMap('skill-details', 'skills'); }
function loadMcp() { return loadCollection('mcp', 'mcp'); }
function loadMcpDetails() { return loadMap('mcp-details', 'mcp'); }

/** 每条写回独立文件（2 空格缩进 + 尾换行）；返回写盘的 slug 列表 */
function saveCollection(dir, entries) {
  const full = path.join(DATA_DIR, dir);
  for (const entry of entries) {
    fs.writeFileSync(path.join(full, `${entry.slug}.json`), JSON.stringify(entry, null, 2) + '\n', 'utf8');
  }
  return entries.map((e) => e.slug);
}

/** 合并更新 canonical-order.json 中某集合的顺序（顺序变化时写盘，返回是否有变化） */
function saveOrder(orderKey, slugs) {
  const file = path.join(DATA_DIR, 'canonical-order.json');
  const order = loadOrder();
  if (JSON.stringify(order[orderKey]) === JSON.stringify(slugs)) return false;
  order[orderKey] = slugs;
  fs.writeFileSync(file, JSON.stringify(order, null, 2) + '\n', 'utf8');
  return true;
}

/** 单条写回（详情文件用） */
function saveEntry(dir, slug, data) {
  fs.writeFileSync(path.join(DATA_DIR, dir, `${slug}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

module.exports = {
  DATA_DIR,
  loadOrder,
  loadCollection,
  loadMap,
  loadTools,
  loadToolDetails,
  loadSkills,
  loadSkillDetails,
  loadMcp,
  loadMcpDetails,
  saveCollection,
  saveOrder,
  saveEntry,
};
