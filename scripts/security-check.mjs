#!/usr/bin/env node
/**
 * CATAI — 收录前置安全检查脚本
 * ==============================
 * 在收录任何 GitHub 仓库前运行，自动发现安全/风险信号并生成报告。
 *
 * 用法：
 *   node scripts/security-check.mjs <owner/repo>
 *   node scripts/security-check.mjs https://github.com/owner/repo
 *   node scripts/security-check.mjs --verbose owner/repo
 *
 * 退出码：
 *   0 — 全部通过（可安全收录）
 *   1 — 有警告（需人工确认后再收录）
 *   2 — 有失败项（建议不收录或深入调查）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

// ============ 配置 ============

const CONFIG = {
  staleDays: 90,           // 超过 N 天未推送视为不活跃
  minStars: 100,           // 最低星数门槛
  maxForkRatio: 0.5,       // forks/stars 超过此值视为异常
};

/** 非产品项目名称模式（教程/合集/课程等） */
const NON_PRODUCT_PATTERNS = [
  /^awesome[-_ ]/i, /-list$/i, /interview/i, /roadmap/i,
  /^free[-_ ]/i, /course/i, /lesson/i, /handbook/i,
  /cheat[-_]?sheet/i, /^papers?[-_ ]/i, /survey/i,
  /cookbook/i, /^learn[-_ ]/i, /^tutorial/i, /^demo[-_ ]/i,
  /^sample[-_ ]/i, /^example[-_ ]/i,
];

// ============ 工具函数 ============

function header(text) {
  console.log(`\n━━━ ${text} ━━━`);
}

function statusIcon(level) {
  return level === 'PASS' ? '✅' : level === 'WARN' ? '⚠️' : '❌';
}

// ============ 安全检查器 ============

class SecurityCheck {
  constructor(repoFullName) {
    this.repo = repoFullName.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    this.results = [];
    this.repoData = null;
  }

  async run() {
    console.log(`🔍 收录前置安全检查: ${this.repo}\n`);

    await this.checkRepoExists();
    if (!this.repoData) {
      this.report();
      return;
    }

    this.checkArchived();
    this.checkLicense();
    this.checkRecentActivity();
    this.checkStars();
    this.checkForkRatio();
    this.checkNamePattern();
    this.checkOwnerType();
    this.checkTopics();
    await this.checkSecurityPolicy();

    this.report();
  }

  addResult(name, level, message) {
    this.results.push({ name, level, message });
    console.log(`  ${statusIcon(level)} ${name}: ${message}`);
  }

  async fetch(url, opts = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'catai-security-check',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    };
    try {
      const res = await fetch(url, { ...opts, headers, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      return null;
    }
  }

  // ---- 检查项 ----

  async checkRepoExists() {
    const res = await this.fetch(`https://api.github.com/repos/${this.repo}`);
    if (!res) {
      this.addResult('REPO_EXISTS', 'FAIL', `仓库 ${this.repo} — 网络请求失败（超时/无响应）`);
      return;
    }
    if (res.status === 404) {
      this.addResult('REPO_EXISTS', 'FAIL', `仓库 ${this.repo} 不存在（HTTP 404）`);
      return;
    }
    if (res.status === 403) {
      this.addResult('REPO_EXISTS', 'WARN', `API 限流（HTTP 403），无法验证仓库状态`);
      return;
    }
    if (!res.ok) {
      this.addResult('REPO_EXISTS', 'WARN', `API 返回 ${res.status}，无法完整验证`);
      return;
    }
    const data = await res.json();
    this.repoData = data;
    this.addResult('REPO_EXISTS', 'PASS', `仓库存在（${data.full_name}）`);
  }

  checkArchived() {
    if (!this.repoData) return;
    if (this.repoData.archived) {
      this.addResult('ARCHIVED', 'FAIL', '仓库已归档（archived），不再维护');
    } else if (this.repoData.disabled) {
      this.addResult('ARCHIVED', 'FAIL', '仓库已被禁用（disabled）');
    } else {
      this.addResult('ARCHIVED', 'PASS', '仓库活跃，未归档');
    }
  }

  checkLicense() {
    if (!this.repoData) return;
    const lic = this.repoData.license;
    if (!lic) {
      this.addResult('LICENSE', 'WARN', '无开源许可证 — 版权与使用权限不明确');
    } else {
      this.addResult('LICENSE', 'PASS', `许可证: ${lic.spdx_id || lic.name}`);
    }
  }

  checkRecentActivity() {
    if (!this.repoData) return;
    const pushedAt = new Date(this.repoData.pushed_at);
    const daysSincePush = (Date.now() - pushedAt.getTime()) / 86400000;
    if (daysSincePush > CONFIG.staleDays) {
      this.addResult('ACTIVITY', 'WARN', `超过 ${CONFIG.staleDays} 天未推送（上次推送: ${this.repoData.pushed_at.slice(0, 10)}，距今 ${Math.round(daysSincePush)} 天）`);
    } else {
      this.addResult('ACTIVITY', 'PASS', `近期活跃（上次推送: ${this.repoData.pushed_at.slice(0, 10)}，距今 ${Math.round(daysSincePush)} 天）`);
    }
  }

  checkStars() {
    if (!this.repoData) return;
    const stars = this.repoData.stargazers_count;
    if (stars < CONFIG.minStars) {
      this.addResult('STARS', 'WARN', `星数过低（${stars.toLocaleString()}★ < ${CONFIG.minStars}）`);
    } else {
      this.addResult('STARS', 'PASS', `星数正常（${stars.toLocaleString()}★）`);
    }
  }

  checkForkRatio() {
    if (!this.repoData) return;
    const ratio = this.repoData.forks_count / Math.max(1, this.repoData.stargazers_count);
    if (ratio > CONFIG.maxForkRatio) {
      this.addResult('FORK_RATIO', 'WARN', `fork/star 比异常（${ratio.toFixed(3)}，阈值 ${CONFIG.maxForkRatio}）— 可能存在刷量`);
    } else {
      this.addResult('FORK_RATIO', 'PASS', `fork/star 比正常（${ratio.toFixed(3)}）`);
    }
  }

  checkNamePattern() {
    if (!this.repoData) return;
    const name = this.repoData.name;
    const matched = NON_PRODUCT_PATTERNS.find(p => p.test(name));
    if (matched) {
      this.addResult('NAME_PATTERN', 'WARN', `仓库名匹配非产品模式（${matched.source}）— 可能是教程/合集而非产品项目`);
    } else {
      this.addResult('NAME_PATTERN', 'PASS', '仓库名无异常模式');
    }
  }

  checkOwnerType() {
    if (!this.repoData) return;
    const type = this.repoData.owner?.type;
    if (type === 'Organization') {
      this.addResult('OWNER', 'PASS', `组织账号（${this.repoData.owner.login}）— 通常更可信`);
    } else {
      this.addResult('OWNER', 'WARN', `个人账号（${this.repoData.owner.login}）— 需额外确认可信度`);
    }
  }

  checkTopics() {
    if (!this.repoData) return;
    const topics = this.repoData.topics || [];
    if (topics.length === 0) {
      this.addResult('TOPICS', 'WARN', '未设置 topics — 有机发现性较差');
    } else {
      this.addResult('TOPICS', 'PASS', `已设置 ${topics.length} 个 topics`);
    }
  }

  async checkSecurityPolicy() {
    if (!this.repoData) return;
    const res = await this.fetch(`https://api.github.com/repos/${this.repo}/contents/SECURITY.md`);
    if (res && res.ok) {
      this.addResult('SECURITY_POLICY', 'PASS', '仓库包含 SECURITY.md（安全披露政策）');
    } else {
      this.addResult('SECURITY_POLICY', 'WARN', '缺少 SECURITY.md — 安全漏洞披露渠道不明确');
    }
  }

  // ---- 报告 ----

  report() {
    const fails = this.results.filter(r => r.level === 'FAIL');
    const warns = this.results.filter(r => r.level === 'WARN');
    const passes = this.results.filter(r => r.level === 'PASS');

    header('检查结果汇总');
    console.log(`  总计: ${this.results.length} 项`);
    console.log(`  ✅ 通过: ${passes.length}`);
    console.log(`  ⚠️  警告: ${warns.length}`);
    console.log(`  ❌ 失败: ${fails.length}`);

    if (fails.length > 0) {
      header('❌ 失败项（建议不收录）');
      fails.forEach(r => console.log(`  [${r.name}] ${r.message}`));
      process.exitCode = 2;
    } else if (warns.length > 0) {
      header('⚠️  警告项（需人工确认）');
      warns.forEach(r => console.log(`  [${r.name}] ${r.message}`));
      if (process.exitCode === 0) process.exitCode = 1;
    } else {
      console.log('\n  ✅ 全部检查通过，可以安全收录！');
    }

    // 输出 JSON 摘要（供自动化使用）
    console.log('\n--- JSON摘要 ---');
    console.log(JSON.stringify({
      repo: this.repo,
      verdict: fails.length > 0 ? 'FAIL' : warns.length > 0 ? 'WARN' : 'PASS',
      summary: { pass: passes.length, warn: warns.length, fail: fails.length },
      repoData: this.repoData ? {
        stars: this.repoData.stargazers_count,
        forks: this.repoData.forks_count,
        license: this.repoData.license?.spdx_id || null,
        language: this.repoData.language,
        archived: this.repoData.archived,
        pushedAt: this.repoData.pushed_at?.slice(0, 10),
        createdAt: this.repoData.created_at?.slice(0, 10),
        openIssues: this.repoData.open_issues_count,
      } : null,
    }, null, 2));
  }
}

// ============ 入口 ============

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const repoArg = args.find(a => !a.startsWith('--'));

if (!repoArg) {
  console.error('用法: node scripts/security-check.mjs <owner/repo>');
  console.error('       node scripts/security-check.mjs https://github.com/owner/repo');
  process.exit(1);
}

const check = new SecurityCheck(repoArg);
await check.run();