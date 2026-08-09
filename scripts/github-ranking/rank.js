#!/usr/bin/env node
/**
 * CATAI — GitHub AI 项目排行榜算法脚本
 * ============================================
 * 本文件位于 scripts/github-ranking/（公开仓库），由 GitHub Actions
 * 每日定时运行（.github/workflows/refresh-ranking.yml）。
 *
 * 职责：
 *   1. 通过 GitHub Search API 自动发现 AI 相关仓库（多 topic 联合搜索）
 *   2. 读取目录数据（tools.json / skills.json / mcp.json）自动收录有 GitHub repo 的条目
 *   3. 质量过滤（排除归档 / awesome 清单 / 低星 / 长期不更新的仓库）
 *   4. 用加权算法计算综合得分并排序
 *   5. 只输出"结果 JSON"（名次 + 公开展示字段）到 src/data/githubRanking.json
 *      —— 不输出得分、不输出任何分项因子，前端无法反推算法
 *
 * 用法（项目根目录）：
 *   node scripts/github-ranking/rank.js          # 正式生成（写入 src/data/githubRanking.json）
 *   node scripts/github-ranking/rank.js --dry     # 预览模式（只写 last-run.json，不动线上数据文件）
 *   可选：设置环境变量 GITHUB_TOKEN 提升 API 限额（匿名搜索 10 次/分钟已够用）
 *
 * 配套文件（本目录，随仓库公开）：
 *   overrides.json  — 运营面板维护的拉黑名单 + 编辑加权（由 panel.js 读写）
 *   last-run.json   — 最近一次计算的完整候选池快照（含内部得分，仅供面板展示）
 */

const fs = require('fs');
const path = require('path');

// ============ 私有配置（机密，绝不外泄） ============

/** 候选发现：多 topic 搜索查询（每条取 star 数前 100） */
const SEARCH_QUERIES = [
  'topic:llm stars:>2000',
  'topic:ai-agents stars:>800',
  'topic:agents stars:>1500',
  'topic:generative-ai stars:>1000',
  'topic:rag stars:>800',
  'topic:chatgpt stars:>2000',
  'topic:stable-diffusion stars:>1500',
  'topic:llm-inference stars:>800',
];

/** 质量过滤阈值 */
const FILTERS = {
  minStars: 1500,          // 入榜最低 star
  maxDaysSincePush: 90,    // 超过 90 天未提交视为不活跃，剔除
  maxForkRatio: 0.5,       // forks/stars 过高是刷量/薅羊毛脚本仓的典型信号，剔除
  excludeNamePatterns: [
    /^awesome[-_]/i, /-list$/i, /interview/i, /roadmap/i, /^free[-_]/i,
    // 教程/课程/资料合集类仓库：不是产品项目，不入榜
    /beginner/i, /course/i, /lesson/i, /handbook/i, /cheat[-_]?sheet/i, /papers?[-_]/i, /survey/i, /cookbook/i,
  ],
  excludeTopics: ['awesome', 'awesome-list', 'lists', 'tutorial', 'education', 'courses'],
  excludeDescPatterns: [/lessons?/i, /curso/i, /教程/, /入门/],
};

/**
 * 私有评分权重（核心机密）
 * 各因子先在候选池内做 min-max 归一化，再加权求和 —— 池内归一化意味着
 * 即使拿到全部公开指标，也无法脱离完整候选池复现分数。
 */
const WEIGHTS = {
  stars: 0.30,      // log10(stars) — 规模
  velocity: 0.26,   // stars / 仓库年龄（天） — 增长速度
  freshness: 0.22,  // exp 衰减的提交新鲜度 — 活跃度
  forks: 0.12,      // log10(forks) — 生态采用
  community: 0.10,  // forks/stars 比 — 社区参与深度
};

/** 提交新鲜度半衰期（天） */
const FRESHNESS_HALF_LIFE = 21;

/**
 * 编辑加权（非公开维度）：对特定仓库人工加/减分（-0.1 ~ +0.1）。
 * 这一维度让纯公开数据回归拟合天然不可能成立。
 */
const EDITORIAL_ADJUST = {
  // 'owner/repo': 0.05,
};

const TOP_N = 50;
const OUTPUT = path.join(__dirname, '..', '..', 'src', 'data', 'githubRanking.json');
const OVERRIDES_PATH = path.join(__dirname, 'overrides.json');
const LAST_RUN_PATH = path.join(__dirname, 'last-run.json');
const DRY_RUN = process.argv.includes('--dry');

/** 运营面板维护的覆盖配置：{ blocklist: string[], adjust: { 'owner/repo': ±0.1 } } */
function loadOverrides() {
  try {
    const o = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
    return { blocklist: o.blocklist || [], adjust: o.adjust || {} };
  } catch {
    return { blocklist: [], adjust: {} };
  }
}
const overrides = loadOverrides();

// ============ 实现 ============

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchRepos(query, attempt = 1) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
  const headers = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'catai-ranking' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    // 匿名搜索限额 10 次/分钟，被限流时等 65 秒重试（最多 3 次）
    if (attempt <= 3) {
      console.warn(`  ⏳ 被限流 (${res.status})，等 65 秒后第 ${attempt} 次重试: ${query}`);
      await sleep(65000);
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

function passFilters(repo) {
  if (overrides.blocklist.includes(repo.full_name)) return false;
  if (repo.archived || repo.disabled) return false;
  if (!repo.description) return false;
  if (repo.stargazers_count < FILTERS.minStars) return false;
  const daysSincePush = (Date.now() - new Date(repo.pushed_at)) / 86400000;
  if (daysSincePush > FILTERS.maxDaysSincePush) return false;
  if (repo.forks_count / Math.max(1, repo.stargazers_count) > FILTERS.maxForkRatio) return false;
  if (FILTERS.excludeNamePatterns.some((p) => p.test(repo.name))) return false;
  if (FILTERS.excludeDescPatterns.some((p) => p.test(repo.description))) return false;
  const topics = repo.topics || [];
  if (topics.some((t) => FILTERS.excludeTopics.includes(t))) return false;
  return true;
}

/** 计算原始因子（归一化前） */
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

/** 池内 min-max 归一化 + 加权求和 */
function scoreAll(repos) {
  const factors = repos.map(rawFactors);
  const keys = Object.keys(WEIGHTS);
  const range = {};
  for (const k of keys) {
    const vals = factors.map((f) => f[k]);
    range[k] = { min: Math.min(...vals), max: Math.max(...vals) };
  }
  return repos.map((repo, i) => {
    let score = 0;
    for (const k of keys) {
      const { min, max } = range[k];
      const norm = max > min ? (factors[i][k] - min) / (max - min) : 0;
      score += WEIGHTS[k] * norm;
    }
    score += (EDITORIAL_ADJUST[repo.full_name] || 0) + (overrides.adjust[repo.full_name] || 0);
    return { repo, score };
  });
}

async function main() {
  console.log('🔍 发现候选仓库…');
  const seen = new Map();
  for (const q of SEARCH_QUERIES) {
    const items = await searchRepos(q);
    console.log(`  ✓ ${q} → ${items.length} 个`);
    for (const it of items) if (!seen.has(it.full_name)) seen.set(it.full_name, it);
        await sleep(6500); // 匿名搜索限额 10 次/分钟 → 至少 6 秒/次，留足余量
  }
  // ── 从目录自动收录：读取 tools.json / skills.json / mcp.json 中所有有 GitHub repo 的条目 ──
    const catalogFiles = [
      path.join(__dirname, '..', '..', 'src', 'data', 'tools.json'),
      path.join(__dirname, '..', '..', 'src', 'data', 'skills.json'),
      path.join(__dirname, '..', '..', 'src', 'data', 'mcp.json'),
    ];
    for (const f of catalogFiles) {
      try {
        const entries = JSON.parse(fs.readFileSync(f, 'utf8'));
        const arr = Array.isArray(entries) ? entries : [];
        for (const e of arr) {
          const repo = e.repo || '';
          if (!repo.includes('/') || seen.has(repo)) continue;
          // 向 GitHub API 拉取该 repo 的完整信息
          const url = `https://api.github.com/repos/${repo}`;
          const headers = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'catai-ranking' };
          if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) {
              const data = await res.json();
              seen.set(data.full_name, data);
              console.log(`  目录自动收录: ${repo} ★${data.stargazers_count.toLocaleString()}`);
            } else {
              console.warn(`  目录收录跳过: ${repo} — HTTP ${res.status}`);
            }
          } catch (e) {
            console.warn(`  目录收录跳过: ${repo} — ${e.message?.slice(0, 60) || e.name}`);
          }
          await sleep(1500); // 限流保护
        }
      } catch {
        // 文件不存在或格式异常，跳过
      }
    }
    console.log(`共发现 ${seen.size} 个候选仓库（含目录自动收录）`);

    const candidates = [...seen.values()].filter(passFilters);
  console.log(`质量过滤后剩余 ${candidates.length} 个`);

  const scored = scoreAll(candidates)
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count);
  const ranked = scored.slice(0, TOP_N);

  // 内部快照（含得分）：仅供本地运营面板展示，绝不发布
  const lastRun = {
    generatedAt: new Date().toISOString(),
    dry: DRY_RUN,
    seenCount: seen.size,
    candidateCount: candidates.length,
    blocklist: overrides.blocklist,
    adjust: overrides.adjust,
    candidates: scored.slice(0, 120).map(({ repo, score }, idx) => ({
      pos: idx + 1,
      inTop: idx < TOP_N,
      fullName: repo.full_name,
      score: Math.round(score * 10000) / 10000,
      description: (repo.description || '').slice(0, 200),
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || null,
      topics: (repo.topics || []).slice(0, 3),
      avatar: repo.owner?.avatar_url ? `${repo.owner.avatar_url}&s=96` : null,
      ownerType: repo.owner?.type || null,
      createdAt: repo.created_at.slice(0, 10),
      pushedAt: repo.pushed_at.slice(0, 10),
      forkRatio: Math.round((repo.forks_count / Math.max(1, repo.stargazers_count)) * 1000) / 1000,
    })),
  };
  fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(lastRun, null, 2) + '\n', 'utf8');

  if (DRY_RUN) {
    console.log(`\n👁️ 预览模式：已写入 ${LAST_RUN_PATH}，未修改线上数据文件`);
    console.log('预览前 10 名：');
    ranked.slice(0, 10).forEach(({ repo }, i) => console.log(`  #${i + 1} ${repo.full_name} ★${repo.stargazers_count.toLocaleString()}`));
    return;
  }

  // 读取上一期榜单，计算名次变动（对外仅暴露 Δ名次，与算法无关）
  let prevRanks = {};
  try {
    const prev = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
    prevRanks = Object.fromEntries(prev.items.map((it) => [it.fullName, it.rank]));
  } catch { /* 首次生成，无上期数据 */ }

  // ⚠️ 输出只含名次 + 公开展示字段，绝不包含 score / 分项因子
  const items = ranked.map(({ repo }, idx) => {
    const rank = idx + 1;
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
  });

  const output = { updatedAt: new Date().toISOString().slice(0, 10), items };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`\n✅ 已生成 ${OUTPUT}（Top ${items.length}）`);
  console.log('前 10 名：');
  items.slice(0, 10).forEach((it) => console.log(`  #${it.rank} ${it.fullName} ★${it.stars.toLocaleString()}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
