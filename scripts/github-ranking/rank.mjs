#!/usr/bin/env node
/**
 * AI Ranking — GitHub AI 项目榜单生成脚本（私有算法，合并至主仓库）
 * ====================================================
 * ⚠️ 本仓库公开。评分权重与因子构成为内部机密，
 *    输出的 ranking.json 只含名次与公开展示字段，不含任何得分。
 *
 * 职责：
 *   1. 按分类通过 GitHub Search API 发现候选仓库（多 topic 查询）
 *   2. 质量过滤（归档 / 清单类 / 不活跃 / fork 比异常）
 *   3. 数据熔断：候选池骤降或榜单缺额时报错退出，不污染已有数据
 *   4. 私有加权评分：总榜在全池归一化，分类榜在各自分类池归一化
 *   5. 输出 src/data/ranking.json（总榜 Top 100 + 八分类榜 Top 30）
 *   6. 每日 star 快照写入 snapshots/YYYY-MM-DD.json（周榜/月榜增量基准）
 *      滚动保留 18 个月（548 天）；每月 1 号的快照永久保留（历史冷归档）
 *
 * 用法（项目根目录）：
 *   node scripts/rank.mjs          # 正式生成（写入 ranking.json + 当日快照）
 *   node scripts/rank.mjs --dry    # 预览模式（只打印，不写任何文件）
 *
 * Token（可选，提升 Search 限额 10→30 次/分）：
 *   - 环境变量 GITHUB_TOKEN（CI 中由 Actions 内置令牌注入）
 *   - 或本地 .env.local 中一行 GITHUB_TOKEN=xxx（已被 .gitignore 忽略）
 *   日志只输出掩码，绝不打印明文。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUTPUT = path.join(ROOT, 'src', 'data', 'ranking.json');
const SNAPSHOT_DIR = path.join(ROOT, 'snapshots');
const SNAPSHOT_KEEP_DAYS = 548; // 18 个月滚动窗口：覆盖同比（13 个月）与季度/年度日粒度趋势，留余量
const DRY_RUN = process.argv.includes('--dry');

/**
 * 算法版本号。任何影响榜单结果的改动（权重 / 过滤黑名单 / 分类查询 / 熔断阈值）
 * 都必须递增此版本，并在 docs/ALGO-CHANGELOG.md 记录动机与前后参数对照。
 */
const ALGO_VERSION = '1.3';

// ============ Token 加载（env 优先，回退 .env.local；只打印掩码） ============

function loadToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try {
    const envFile = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
    const m = envFile.match(/^\s*GITHUB_TOKEN\s*=\s*(\S+)\s*$/m);
    if (m) return m[1];
  } catch { /* 无 .env.local，匿名请求 */ }
  return null;
}

const TOKEN = loadToken();
console.log(TOKEN ? `🔑 token: 已加载 (${TOKEN.slice(0, 4)}***)` : '🔓 token: 未配置，使用匿名限额（10 次/分钟）');
console.log(`⚙️ 算法版本: v${ALGO_VERSION}`);

// ============ 私有配置（机密） ============

/** 分类定义：id → 展示名 + 搜索查询组（每条取 star 前 100） */
const CATEGORIES = {
  llm: {
    name: '大模型',
    queries: ['topic:llm stars:>3000', 'topic:llm-inference stars:>800', 'topic:chatgpt stars:>3000'],
  },
  agents: {
    name: 'AI Agent',
    queries: ['topic:ai-agents stars:>800', 'topic:agents stars:>1500', 'topic:autonomous-agents stars:>500'],
  },
  image: {
    name: '图像生成',
    queries: ['topic:stable-diffusion stars:>1000', 'topic:text-to-image stars:>800', 'topic:image-generation stars:>800'],
  },
  audio: {
    name: '语音/音频',
    queries: ['topic:text-to-speech stars:>500', 'topic:speech-recognition stars:>800', 'topic:speech-synthesis stars:>300'],
  },
  devtools: {
    name: '开发工具',
    queries: ['topic:code-generation stars:>800', 'topic:coding-assistant stars:>300', 'topic:copilot stars:>800'],
  },
  rag: {
    name: 'RAG/数据',
    queries: ['topic:rag stars:>800', 'topic:vector-database stars:>800', 'topic:embeddings stars:>500'],
  },
  // v1.2 新增：探针实测 ≥800★ 过滤后 video 106 / vision 244，远超 30 名额判定线
  video: {
    name: '视频生成',
    queries: ['topic:video-generation stars:>300', 'topic:text-to-video stars:>300'],
  },
  vision: {
    name: '计算机视觉',
    queries: ['topic:computer-vision stars:>3000', 'topic:object-detection stars:>1000', 'topic:ocr stars:>1000'],
  },
};

/** 质量过滤阈值 */
const FILTERS = {
  minStars: 800,
  maxDaysSincePush: 90,
  maxForkRatio: 0.5,
  excludeNamePatterns: [
    /^awesome[-_]/i, /-list$/i, /interview/i, /roadmap/i, /^free[-_]/i,
    /beginner/i, /course/i, /lesson/i, /handbook/i, /cheat[-_]?sheet/i,
    /papers?[-_]/i, /survey/i, /cookbook/i, /tutorial/i, /examples?$/i,
  ],
  excludeTopics: ['awesome', 'awesome-list', 'lists', 'tutorial', 'education', 'courses', 'interview', 'book'],
  // v1.2 补教材拦截：CV 池混入 d2l-zh 等教科书仓库（\bbook\b 不误伤 notebook/cookbook）
  excludeDescPatterns: [/lessons?/i, /curso/i, /教程/, /入门/, /学习路线/, /collection of/i, /curated list/i, /textbook/i, /教科书/, /用于教学/, /\bbook\b/i],
};

/**
 * 私有评分权重（核心机密）。
 * 各因子先在所属榜单的候选池内做 min-max 归一化再加权求和，
 * 池内归一化 + 编辑加权使外部无法用公开指标复现分数。
 */
const WEIGHTS = {
  stars: 0.28,      // log10(stars) — 规模
  velocity: 0.24,   // stars/仓库年龄 — 增长速度
  freshness: 0.24,  // exp 衰减的提交新鲜度 — 活跃度
  forks: 0.13,      // log10(forks) — 生态采用
  community: 0.11,  // forks/stars 比 — 社区参与
};

/** 提交新鲜度半衰期（天） */
const FRESHNESS_HALF_LIFE = 28;

/** 编辑加权（-0.1 ~ +0.1）：'owner/repo': 0.05 */
const EDITORIAL_ADJUST = {};

const TOP_ALL = 100;
const TOP_CATEGORY = 30;

/** 熔断阈值：候选池相比最近快照的最大允许跌幅 */
const MAX_POOL_SHRINK = 0.4;

// ============ GitHub API ============

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 认证后 Search 限额 30 次/分（≥2 秒/次），匿名 10 次/分（≥6 秒/次），各留余量
const QUERY_INTERVAL = TOKEN ? 2500 : 6500;

async function searchRepos(query, attempt = 1) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
    'User-Agent': 'ai-ranking-bot',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    if (attempt <= 3) {
      // 退避策略：优先 retry-after，其次等到 x-ratelimit-reset，兜底 65 秒
      const retryAfter = Number(res.headers.get('retry-after'));
      const reset = Number(res.headers.get('x-ratelimit-reset'));
      let waitMs = 65000;
      if (retryAfter > 0) waitMs = retryAfter * 1000 + 1000;
      else if (reset > 0) waitMs = Math.max(5000, reset * 1000 - Date.now() + 1000);
      console.warn(`  ⏳ 被限流 (${res.status})，等 ${Math.round(waitMs / 1000)} 秒后第 ${attempt} 次重试: ${query}`);
      await sleep(waitMs);
      return searchRepos(query, attempt + 1);
    }
    console.error(`  ✗ 重试耗尽，放弃: ${query}`);
    return [];
  }
  if (!res.ok) {
    console.error(`  ✗ 搜索失败 (${res.status}): ${query}`);
    return [];
  }
  const data = await res.json();
  return data.items || [];
}

// ============ 过滤与评分 ============

function passFilters(repo) {
  if (repo.archived || repo.disabled) return false;
  if (!repo.description) return false;
  if (repo.stargazers_count < FILTERS.minStars) return false;
  const daysSincePush = (Date.now() - new Date(repo.pushed_at)) / 86400000;
  if (daysSincePush > FILTERS.maxDaysSincePush) return false;
  if (repo.forks_count / Math.max(1, repo.stargazers_count) > FILTERS.maxForkRatio) return false;
  if (FILTERS.excludeNamePatterns.some((p) => p.test(repo.name))) return false;
  if (FILTERS.excludeDescPatterns.some((p) => p.test(repo.description))) return false;
  if ((repo.topics || []).some((t) => FILTERS.excludeTopics.includes(t))) return false;
  return true;
}

function rawFactors(repo) {
  const now = Date.now();
  const ageDays = Math.max(1, (now - new Date(repo.created_at)) / 86400000);
  const daysSincePush = Math.max(0, (now - new Date(repo.pushed_at)) / 86400000);
  return {
    stars: Math.log10(repo.stargazers_count + 1),
    velocity: Math.log10(repo.stargazers_count / ageDays + 1),
    freshness: Math.exp((-Math.LN2 * daysSincePush) / FRESHNESS_HALF_LIFE),
    forks: Math.log10(repo.forks_count + 1),
    community: Math.min(0.3, repo.forks_count / Math.max(1, repo.stargazers_count)) / 0.3,
  };
}

/** 在给定候选池内归一化评分并降序排序 */
function rankPool(repos) {
  const factors = repos.map(rawFactors);
  const keys = Object.keys(WEIGHTS);
  const range = {};
  for (const k of keys) {
    const vals = factors.map((f) => f[k]);
    range[k] = { min: Math.min(...vals), max: Math.max(...vals) };
  }
  return repos
    .map((repo, i) => {
      let score = 0;
      for (const k of keys) {
        const { min, max } = range[k];
        score += WEIGHTS[k] * (max > min ? (factors[i][k] - min) / (max - min) : 0);
      }
      score += EDITORIAL_ADJUST[repo.full_name] || 0;
      return { repo, score };
    })
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count);
}

// ============ 数据熔断（sanity check） ============

/**
 * 数据质量熔断：宁可保留昨天的好数据，也不提交今天的坏数据。
 * 触发任一条件即以非零码退出（CI 感知失败并告警），不写任何文件：
 *   1. 候选池相比最近一份快照萎缩超过 MAX_POOL_SHRINK（疑似 API 变更/topic 清洗/大面积限流）
 *   2. 任一榜单候选数量不足以填满目标名额
 */
function sanityCheck(allPool, allCandidates, categoryPools) {
  const problems = [];
  let prevCount = null;
  try {
    const files = fs.readdirSync(SNAPSHOT_DIR)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    if (files.length) {
      const latest = files[files.length - 1];
      prevCount = Object.keys(JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, latest), 'utf8'))).length;
      if (allPool.size < prevCount * (1 - MAX_POOL_SHRINK)) {
        problems.push(`候选池骤降：${prevCount} → ${allPool.size}（跌幅超 ${MAX_POOL_SHRINK * 100}%），疑似 API 异常`);
      }
    }
  } catch { /* 无历史快照，跳过对比 */ }
  if (allCandidates.length < TOP_ALL) {
    problems.push(`总榜候选不足：${allCandidates.length} < ${TOP_ALL}`);
  }
  for (const [id, cat] of Object.entries(CATEGORIES)) {
    if (categoryPools[id].length < TOP_CATEGORY) {
      problems.push(`[${cat.name}] 候选不足：${categoryPools[id].length} < ${TOP_CATEGORY}`);
    }
  }
  if (problems.length) {
    console.error('\n🚨 数据熔断触发，本次不写入任何文件：');
    problems.forEach((p) => console.error(`   - ${p}`));
    process.exit(1);
  }
  console.log(`🛡️ 数据熔断检查通过${prevCount !== null ? `（候选池 ${prevCount} → ${allPool.size}）` : ''}`);
}

// ============ 每日快照（周榜/月榜的增量基准） ============

/**
 * 将全候选池的当前 star 数写入 snapshots/YYYY-MM-DD.json。
 * GitHub API 不提供历史 star 曲线，趋势榜只能靠逐日快照相减得出，
 * 因此快照必须每日持续积累（无法回溯补齐）。
 * 清理规则：滚动保留 18 个月（548 天），支撑同比对比与季度/年度日粒度趋势；
 * 每月 1 号的快照永久保留（历史冷归档，供更长周期的月粒度分析，每份约 50KB）。
 * 不再延长的理由：git 历史保留全部被清理快照（可回溯），超长回溯走 GH Archive（IDEAS L4）。
 */
function writeSnapshot(allPool) {
  const today = new Date().toISOString().slice(0, 10);
  const snap = {};
  for (const repo of allPool.values()) snap[repo.full_name] = repo.stargazers_count;
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SNAPSHOT_DIR, `${today}.json`), JSON.stringify(snap) + '\n', 'utf8');
  // 清理滚动窗口外的过期快照（月初快照永久豁免）
  const cutoff = Date.now() - SNAPSHOT_KEEP_DAYS * 86400000;
  let removed = 0;
  for (const f of fs.readdirSync(SNAPSHOT_DIR)) {
    const m = f.match(/^((\d{4}-\d{2})-(\d{2}))\.json$/);
    if (m && m[3] !== '01' && new Date(m[1]).getTime() < cutoff) {
      fs.unlinkSync(path.join(SNAPSHOT_DIR, f));
      removed++;
    }
  }
  console.log(`📸 快照已写入 snapshots/${today}.json（${Object.keys(snap).length} 个仓库${removed ? `，清理过期 ${removed} 份` : ''}）`);
}

// ============ 输出组装 ============

/** 公开展示字段（绝不含 score / 分项因子） */
function toItem(repo, rank, prevRanks) {
  const prev = prevRanks[repo.full_name];
  return {
    rank,
    fullName: repo.full_name,
    name: repo.name,
    description: repo.description.slice(0, 200),
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || null,
    topics: (repo.topics || []).slice(0, 3),
    avatar: repo.owner?.avatar_url ? `${repo.owner.avatar_url}&s=96` : null,
    change: prev ? prev - rank : null, // 正数=上升，负数=下降，null=新上榜
  };
}

async function main() {
  // 按分类抓取候选池（同一仓库可出现在多个分类）
  const categoryPools = {};
  const allPool = new Map();
  for (const [id, cat] of Object.entries(CATEGORIES)) {
    console.log(`\n🔍 [${cat.name}] 发现候选…`);
    const pool = new Map();
    for (const q of cat.queries) {
      const items = await searchRepos(q);
      console.log(`  ✓ ${q} → ${items.length} 个`);
      for (const it of items) {
        if (!pool.has(it.full_name)) pool.set(it.full_name, it);
        if (!allPool.has(it.full_name)) allPool.set(it.full_name, it);
      }
      await sleep(QUERY_INTERVAL);
    }
    categoryPools[id] = [...pool.values()].filter(passFilters);
    console.log(`  [${cat.name}] 过滤后 ${categoryPools[id].length} 个`);
  }
  const allCandidates = [...allPool.values()].filter(passFilters);
  console.log(`\n共发现 ${allPool.size} 个候选，全池过滤后 ${allCandidates.length} 个`);

  // 熔断检查必须先于任何文件写入（含快照），坏数据不落盘
  sanityCheck(allPool, allCandidates, categoryPools);

  // 读取上一期，按榜单分别计算名次变动
  let prev = { boards: {} };
  try { prev = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); } catch { /* 首次生成 */ }
  const prevRanksOf = (boardId) =>
    Object.fromEntries((prev.boards?.[boardId]?.items || []).map((it) => [it.fullName, it.rank]));

  // 总榜：全池归一化；分类榜：各自池内归一化
  const boards = {
    all: {
      name: '总榜',
      items: rankPool(allCandidates).slice(0, TOP_ALL)
        .map(({ repo }, i) => toItem(repo, i + 1, prevRanksOf('all'))),
    },
  };
  for (const [id, cat] of Object.entries(CATEGORIES)) {
    boards[id] = {
      name: cat.name,
      items: rankPool(categoryPools[id]).slice(0, TOP_CATEGORY)
        .map(({ repo }, i) => toItem(repo, i + 1, prevRanksOf(id))),
    };
  }

  const output = { updatedAt: new Date().toISOString().slice(0, 10), boards };

  if (DRY_RUN) {
    console.log('\n👁️ 预览模式（不写文件），各榜前 5 名：');
    for (const board of Object.values(boards)) {
      console.log(`  【${board.name}】`);
      board.items.slice(0, 5).forEach((it) =>
        console.log(`    #${it.rank} ${it.fullName} ★${it.stars.toLocaleString()}`));
    }
    return;
  }

  writeSnapshot(allPool);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`\n✅ 已生成 ${OUTPUT}`);
  console.log(`   总榜 ${boards.all.items.length} 项，分类榜 ${Object.keys(CATEGORIES).map((id) => `${boards[id].name} ${boards[id].items.length}`).join('、')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
