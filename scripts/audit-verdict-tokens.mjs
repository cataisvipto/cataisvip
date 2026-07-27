// Internal AI Audit ② Verdict 腐化扫描：识别文案中易过时的 token（模型版本号/年份/价格）
// 用法：node scripts/audit-verdict-tokens.mjs
// 规则：命中 token 且 verdictDate 超过 180 天 → 高风险腐化清单；未超期仅计数不告警
// warn-only：恒以退出码 0 结束
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const details = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/toolDetails.json'), 'utf8'));

const VERDICT_STALE_DAYS = 180;

// 易过时 token 模式（按需扩充；只扫 en 文案，其余语言与 en 同步维护）
const PATTERNS = [
  ['模型版本', /\b(?:GPT|Grok|Llama|Gemini|Qwen|GLM|Kimi|DeepSeek)[-\s]?\d[\d.]*\w*/gi],
  ['模型版本', /\bClaude\s?(?:Opus|Sonnet|Haiku)?\s?\d[\d.]*/gi],
  ['模型版本', /\b(?:DALL[-·]?E|Sora|Veo|Imagen|Midjourney|Flux)\s?[Vv]?\d[\d.]*/gi],
  ['模型版本', /\bo\d(?:-\w+)?\b/g], // OpenAI o1/o3/o4-mini 系列
  ['年份', /\b20\d{2}\b/g],
  ['价格', /\$\d+(?:\.\d+)?/g],
];

const MS_DAY = 86400000;
const now = Date.now();

// 提取一个字段的 en 文案（i18nString 或 i18nStringArray）
const enText = (v) => {
  if (!v || typeof v !== 'object') return '';
  const en = v.en;
  return Array.isArray(en) ? en.join('\n') : typeof en === 'string' ? en : '';
};

const highRisk = []; // 超期且命中 token
let freshHits = 0; // 未超期的命中（仅计数）

for (const [slug, d] of Object.entries(details)) {
  // 扫描范围：verdict 文案 + features + latestUpdate
  const fields = {
    'verdict.headline': enText(d.verdict?.headline),
    'verdict.body': enText(d.verdict?.body),
    features: enText(d.features),
    latestUpdate: enText(d.latestUpdate),
  };
  const hits = [];
  for (const [field, text] of Object.entries(fields)) {
    if (!text) continue;
    const tokens = new Set();
    for (const [, re] of PATTERNS) {
      for (const m of text.match(re) || []) tokens.add(m);
    }
    if (tokens.size) hits.push(`${field}: ${[...tokens].join(', ')}`);
  }
  if (!hits.length) continue;

  const dateStr = d.meta?.verdictDate || d.meta?.lastVerified;
  const days = dateStr ? Math.floor((now - Date.parse(dateStr)) / MS_DAY) : Infinity;
  if (days > VERDICT_STALE_DAYS) highRisk.push({ slug, days, hits });
  else freshHits++;
}

const lines = [];
const emit = (s) => {
  console.log(s);
  lines.push(s);
};

emit(`════ Verdict 腐化扫描（${Object.keys(details).length} 个工具）════`);
emit(`含易过时 token 且在复核期内: ${freshHits} 个（暂无风险，仅登记）`);
if (highRisk.length) {
  highRisk.sort((a, b) => b.days - a.days);
  emit(`\n⚠ 高风险腐化清单（含易过时 token 且超 ${VERDICT_STALE_DAYS} 天未复核）: ${highRisk.length} 个`);
  for (const r of highRisk) {
    emit(`  - ${r.slug}（${r.days === Infinity ? '无复核日期' : `已 ${r.days} 天`}）`);
    for (const h of r.hits) emit(`      ${h}`);
  }
} else {
  emit('✅ 无高风险腐化条目');
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['## Verdict 腐化扫描', '', '```', ...lines, '```', ''].join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
