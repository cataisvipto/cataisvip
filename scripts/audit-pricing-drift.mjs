// Internal AI Audit ③ Pricing 漂移探测：抓取官方定价页，比对本站声明的价格是否仍在页面上
// 用法：node scripts/audit-pricing-drift.mjs
//   - 本地若需代理：设置 HTTPS_PROXY 环境变量后运行；CI 海外节点直连
// 仅处理配置了 meta.pricingUrl 的工具（在 _internal/init-audit-meta.js 的 SEED_PRICING_URLS 补种）
// 分级：
//   DRIFT → 本站声明的价格在官方页面找不到 —— 疑似调价，提示人工核对（不自动改数据）
//   SKIP  → 抓取失败 / 页面无价格 token（JS 渲染页）—— 低置信度，不告警
//   OK    → 声明价格全部命中
// warn-only：恒以退出码 0 结束
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const details = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/toolDetails.json'), 'utf8'));

// 与 check-tool-liveness.mjs 一致：undici Agent + 大响应头 + 可选代理
let dispatcher;
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
try {
  const { Agent, ProxyAgent } = await import('undici');
  const opts = { maxHeaderSize: 128 * 1024 };
  dispatcher = proxy ? new ProxyAgent({ uri: proxy, ...opts }) : new Agent(opts);
  if (proxy) console.log(`使用代理: ${proxy}`);
} catch {
  console.log('未找到 undici，使用原生 fetch 直连抓取');
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function fetchText(url, timeout = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      dispatcher,
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
    });
    if (res.status < 200 || res.status >= 400) return { err: `HTTP ${res.status}` };
    return { text: await res.text() };
  } catch (e) {
    return { err: e?.cause?.code || e?.name || String(e).slice(0, 60) };
  } finally {
    clearTimeout(timer);
  }
}

// 价格 token 归一化：$20 / $20.00 → "20"；忽略千分位逗号
const PRICE_RE = /\$\s?([\d,]+(?:\.\d+)?)/g;
const normalize = (raw) => String(parseFloat(raw.replace(/,/g, '')));
const extractPrices = (text) => {
  const set = new Set();
  for (const m of text.matchAll(PRICE_RE)) set.add(normalize(m[1]));
  return set;
};

// 待测清单：有 pricingUrl 且本站 pricing 里声明了具体价格的工具
const targets = [];
for (const [slug, d] of Object.entries(details)) {
  const url = d.meta?.pricingUrl;
  if (!url) continue;
  const declared = new Set();
  for (const tier of Object.values(d.pricing || {})) {
    const en = typeof tier?.en === 'string' ? tier.en : '';
    for (const m of en.matchAll(PRICE_RE)) declared.add(normalize(m[1]));
  }
  targets.push({ slug, url, declared });
}

// 并发池（沿用 liveness 模式）
async function pool(items, worker, size = 6) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await worker(items[idx]);
      }
    })
  );
  return results;
}

const total = Object.keys(details).length;
console.log(`════ Pricing 漂移探测（${targets.length}/${total} 个工具配置了 pricingUrl）════`);

const results = await pool(targets, async (t) => {
  if (!t.declared.size) return { ...t, verdict: 'SKIP', reason: '本站 pricing 无具体价格 token' };
  const r = await fetchText(t.url);
  if (r.err) return { ...t, verdict: 'SKIP', reason: `抓取失败 ${r.err}` };
  const pagePrices = extractPrices(r.text);
  if (!pagePrices.size) return { ...t, verdict: 'SKIP', reason: '页面无价格 token（疑似 JS 渲染）' };
  const missing = [...t.declared].filter((p) => !pagePrices.has(p));
  if (missing.length) return { ...t, verdict: 'DRIFT', missing };
  return { ...t, verdict: 'OK' };
});

const lines = [];
const emit = (s) => {
  console.log(s);
  lines.push(s);
};

const groups = { DRIFT: [], SKIP: [], OK: [] };
for (const r of results) groups[r.verdict].push(r);

emit(`\n结果：OK ${groups.OK.length} · DRIFT ${groups.DRIFT.length} · SKIP ${groups.SKIP.length}`);
if (groups.DRIFT.length) {
  emit(`\n💸 疑似调价（本站声明的价格在官方页面找不到，请人工核对后更新 pricing 并刷新 pricingVerified）:`);
  for (const r of groups.DRIFT) emit(`  - ${r.slug}  缺失: ${r.missing.map((p) => '$' + p).join(', ')}  → ${r.url}`);
}
if (groups.SKIP.length) {
  emit(`\n⏭ 跳过（低置信度，不告警）:`);
  for (const r of groups.SKIP) emit(`  - ${r.slug}  ${r.reason}`);
}
if (groups.OK.length) {
  emit(`\n✅ 价格全部命中: ${groups.OK.map((r) => r.slug).join(', ')}`);
}
if (!targets.length) emit('（无待测工具，请在 _internal/init-audit-meta.js 的 SEED_PRICING_URLS 补种 pricingUrl）');

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['## Pricing 漂移探测', '', '```', ...lines, '```', ''].join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
