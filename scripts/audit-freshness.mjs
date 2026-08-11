// Internal AI Audit ① 信息过期检测：按 meta 审计时间戳判定各板块是否超过复核阈值
// 用法：node scripts/audit-freshness.mjs
// 覆盖三类实体：工具（toolDetails.json）/ Skills（skillDetails.json）/ MCP（mcpDetails.json）
// 阈值（天）：基础信息 180 / verdict 180 / pricing 90，可按需调整下方常量
// warn-only：只输出待复核清单，恒以退出码 0 结束（过期是运营任务，不阻断 CI）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const COLLECTIONS = [
  { file: 'src/data/toolDetails.json', label: '工具', hasVerdict: true },
  { file: 'src/data/skillDetails.json', label: 'Skills', hasVerdict: true },
  { file: 'src/data/mcpDetails.json', label: 'MCP', hasVerdict: true },
];

const THRESHOLDS = {
  lastVerified: 180, // 基础信息（features/useCases/pros/cons/latestUpdate）
  verdictDate: 180, // Verdict 编辑推荐
  pricingVerified: 90, // 定价（变动最频繁，阈值最短）
};

const MS_DAY = 86400000;
const now = Date.now();
const daysSince = (dateStr) => Math.floor((now - Date.parse(dateStr)) / MS_DAY);

const lines = [];
const emit = (s) => {
  console.log(s);
  lines.push(s);
};

const LABELS = {
  lastVerified: '📋 基础信息待复核（>180 天）',
  verdictDate: '📝 Verdict 待复核（>180 天）',
  pricingVerified: '💰 Pricing 待核价（>90 天）',
};

let grandFresh = { done: 0, total: 0 };
let grandNoMeta = 0;

for (const { file, label } of COLLECTIONS) {
  const details = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const slugs = Object.keys(details);

  // 分组收集：{ field: [{slug, days, overdue}] }
  const stale = { lastVerified: [], verdictDate: [], pricingVerified: [] };
  const noMeta = [];

  for (const slug of slugs) {
    const d = details[slug];
    if (!d.meta) {
      noMeta.push(slug);
      continue;
    }
    for (const [field, limit] of Object.entries(THRESHOLDS)) {
      if (field === 'verdictDate' && !d.verdict) continue; // 无 verdict 的条目不参与
      const dateStr = d.meta[field];
      if (!dateStr) {
        stale[field].push({ slug, days: Infinity, overdue: Infinity }); // 缺日期 = 最高优先级
        continue;
      }
      const days = daysSince(dateStr);
      if (days > limit) stale[field].push({ slug, days, overdue: days - limit });
    }
  }

  emit(`════ 信息过期检测 · ${label}（${slugs.length} 个）════`);
  if (noMeta.length) {
    grandNoMeta += noMeta.length;
    emit(`\n❗ 缺 meta 字段（最高优先级，需运行 _internal/init-audit-meta-skills-mcp.js 补齐）: ${noMeta.join(', ')}`);
  }

  let totalStale = 0;
  for (const [field, list] of Object.entries(stale)) {
    if (!list.length) continue;
    totalStale += list.length;
    list.sort((a, b) => b.overdue - a.overdue);
    emit(`\n${LABELS[field]}: ${list.length} 个`);
    for (const it of list) {
      emit(it.days === Infinity ? `  - ${it.slug}  （缺日期字段）` : `  - ${it.slug}  已 ${it.days} 天未复核（超期 ${it.overdue} 天）`);
    }
  }

  // 总体新鲜度 = 未过期检查项 / 全部检查项
  const totalChecks = slugs.reduce((n, s) => n + (details[s].verdict ? 3 : 2), 0);
  const freshness = totalChecks ? (((totalChecks - totalStale) / totalChecks) * 100).toFixed(1) : '100.0';
  grandFresh.done += totalChecks - totalStale;
  grandFresh.total += totalChecks;
  emit(`\n${label}新鲜度: ${freshness}%（${totalChecks - totalStale}/${totalChecks} 项检查未过期）`);
  if (!totalStale && !noMeta.length) emit(`✅ ${label}全部信息均在复核周期内`);
  emit('');
}

const grandPct = grandFresh.total ? ((grandFresh.done / grandFresh.total) * 100).toFixed(1) : '100.0';
emit(`═ 总体新鲜度: ${grandPct}%（${grandFresh.done}/${grandFresh.total} 项检查未过期）`);
if (!grandFresh.total || (grandFresh.done === grandFresh.total && !grandNoMeta)) emit('✅ 全部条目信息均在复核周期内');

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['## 信息过期检测', '', '```', ...lines, '```', ''].join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}