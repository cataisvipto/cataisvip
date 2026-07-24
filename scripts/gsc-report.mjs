#!/usr/bin/env node
// @ts-check
/**
 * GSC 数据拉取脚本（零成本 · Google Search Console API）
 *
 * 用法：
 *   1. 把服务账号 JSON 密钥放到 _internal/gsc-key.json（该目录已被 .gitignore 忽略）
 *      或用环境变量指定路径： GSC_KEY_PATH=xxx.json
 *   2. 运行： npm run gsc          （默认近 90 天）
 *      或    node scripts/gsc-report.mjs --days=28
 *      指定资源： node scripts/gsc-report.mjs --site="sc-domain:cataito.com"
 *
 * 输出：
 *   - 终端表格：查询/页面/国家/设备 Top 榜 + 逐日趋势汇总
 *   - JSON 文件：_internal/gsc-data/gsc-report-YYYY-MM-DD.json
 *
 * 依赖： google-auth-library（仅用于服务账号 JWT 认证获取 access token）
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JWT, OAuth2Client } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- 参数解析 ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=?(.*)$/);
    return m ? [m[1], m[2] === '' ? true : m[2]] : [a, true];
  })
);

const DAYS = Number(args.days) || 90;
const ROW_LIMIT = Number(args.limit) || 25;
const SITE_FILTER = typeof args.site === 'string' ? args.site : null;
const INTERNAL = path.join(ROOT, '_internal');
// 服务账号密钥（若组织策略允许才会用到）
const SA_KEY_PATH =
  process.env.GSC_KEY_PATH || args.key || path.join(INTERNAL, 'gsc-key.json');
// OAuth 桌面客户端（组织禁用密钥时的免密钥方案）
const OAUTH_CLIENT_PATH =
  process.env.GSC_OAUTH_CLIENT || path.join(INTERNAL, 'gsc-oauth-client.json');
// OAuth 授权后缓存的 token（含 refresh_token，后续运行免再授权）
const TOKEN_PATH = path.join(INTERNAL, 'gsc-token.json');

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API = 'https://www.googleapis.com/webmasters/v3';

// ---------- 小工具 ----------
const fmtDate = (d) => d.toISOString().slice(0, 10);
const pct = (n) => (n * 100).toFixed(2) + '%';
const round = (n) => Math.round(n * 10) / 10;

function fail(msg) {
  console.error('\n❌ ' + msg + '\n');
  process.exit(1);
}

// 在默认浏览器打开 URL（跨平台）
function openBrowser(url) {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

// OAuth 桌面流程：开临时 loopback 服务器接收授权回调，换取 tokens
function runOAuthFlow(clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    let redirectUri;
    const oAuth2 = new OAuth2Client(clientId, clientSecret);
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, 'http://localhost');
        const code = reqUrl.searchParams.get('code');
        const err = reqUrl.searchParams.get('error');
        if (err) {
          res.end('授权被拒绝：' + err);
          server.close();
          return reject(new Error('用户拒绝授权：' + err));
        }
        if (!code) {
          res.end('等待授权中…');
          return;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(
          '<h2>✅ 授权成功</h2><p>可以关闭此页面，回到终端查看数据。</p>'
        );
        server.close();
        const { tokens } = await oAuth2.getToken({ code, redirect_uri: redirectUri });
        resolve(tokens);
      } catch (e) {
        reject(e);
      }
    });
    server.listen(0, () => {
      const port = server.address().port;
      redirectUri = `http://localhost:${port}`;
      oAuth2.redirectUri = redirectUri;
      const authUrl = oAuth2.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [SCOPE],
        redirect_uri: redirectUri,
      });
      console.log('\n🔑 请在打开的浏览器中完成授权（若未自动打开，手动复制下方链接）：\n' + authUrl + '\n');
      openBrowser(authUrl);
    });
    server.on('error', reject);
  });
}

// 解析认证方式：优先服务账号密钥，否则走 OAuth 桌面流程
async function getAuthClient() {
  // 方式一：服务账号密钥（若存在）
  if (fs.existsSync(SA_KEY_PATH)) {
    let creds;
    try {
      creds = JSON.parse(fs.readFileSync(SA_KEY_PATH, 'utf8'));
    } catch {
      fail(`密钥文件不是合法 JSON：${SA_KEY_PATH}`);
    }
    const client = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: [SCOPE],
    });
    return { client, identity: creds.client_email };
  }

  // 方式二：OAuth 桌面客户端
  if (!fs.existsSync(OAUTH_CLIENT_PATH)) {
    fail(
      `未找到认证凭据。请二选一：\n` +
        `  ① 服务账号密钥放到：${SA_KEY_PATH}\n` +
        `  ② OAuth 桌面客户端 JSON 放到：${OAUTH_CLIENT_PATH}\n` +
        `（组织禁用密钥时请用 ②）`
    );
  }
  const raw = JSON.parse(fs.readFileSync(OAUTH_CLIENT_PATH, 'utf8'));
  const conf = raw.installed || raw.web;
  if (!conf || !conf.client_id) {
    fail('OAuth 客户端文件格式不对，应为“桌面应用(Desktop app)”类型下载的 JSON。');
  }

  const oAuth2 = new OAuth2Client(conf.client_id, conf.client_secret);

  // 已有缓存 token 则直接用
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2.setCredentials(tokens);
    return { client: oAuth2 };
  }

  // 首次：交互式授权
  const tokens = await runOAuthFlow(conf.client_id, conf.client_secret);
  fs.mkdirSync(INTERNAL, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
  console.log('✅ 授权完成，凭据已缓存到 ' + path.relative(ROOT, TOKEN_PATH));
  oAuth2.setCredentials(tokens);
  return { client: oAuth2 };
}

async function main() {
  const { client } = await getAuthClient();

  const { token } = await client.getAccessToken();
  if (!token) fail('获取 access token 失败，请检查凭据与 API 是否已启用。');

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      fail(`API 请求失败 (${res.status})：\n${body}`);
    }
    return res.json();
  };

  // ---------- 1. 列出可用资源 ----------
  const sitesResp = await authFetch(`${API}/sites`);
  const allSites = (sitesResp.siteEntry || []).map((s) => s.siteUrl);
  if (allSites.length === 0) {
    fail(
      '当前凭据没有任何可访问的 Search Console 资源。\n' +
        '请确认：授权时登录的 Google 账号就是拥有 catai 资源的那个账号；\n' +
        '若用服务账号密钥，则需在 Search Console → 设置 → 用户和权限中把服务账号邮箱加为用户。'
    );
  }

  console.log('\n📋 当前凭据可访问的资源：');
  allSites.forEach((s) => console.log('   • ' + s));

  // 选定目标资源
  let site = SITE_FILTER;
  if (!site) {
    const catai = allSites.filter((s) => /catai/i.test(s));
    // 优先主域 cataito.com（代码 BASE_URL 一致）
    const preferred = catai.find((s) => /cataito\.com/i.test(s));
    if (preferred) site = preferred;
    else if (catai.length >= 1)
      site = catai.find((s) => s.startsWith('sc-domain:')) || catai[0];
    else site = allSites[0];
  }
  console.log(`\n🎯 本次分析资源： ${site}\n`);

  // ---------- 2. 时间范围 ----------
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC 数据通常有 ~2 天延迟
  const start = new Date(end);
  start.setDate(start.getDate() - DAYS);
  const startDate = fmtDate(start);
  const endDate = fmtDate(end);
  console.log(`📅 时间范围： ${startDate} ~ ${endDate}（近 ${DAYS} 天）\n`);

  const query = (dimensions, rowLimit = ROW_LIMIT) =>
    authFetch(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    });

  // ---------- 3. 拉取各维度 ----------
  const [totals, byQuery, byPage, byCountry, byDevice, byDate] =
    await Promise.all([
      query([], 1),
      query(['query']),
      query(['page']),
      query(['country']),
      query(['device']),
      query(['date'], 1000),
    ]);

  // ---------- 4. 汇总 ----------
  const sumRows = (rows) =>
    (rows || []).reduce(
      (acc, r) => {
        acc.clicks += r.clicks || 0;
        acc.impressions += r.impressions || 0;
        return acc;
      },
      { clicks: 0, impressions: 0 }
    );

  const t = sumRows(byDate.rows);
  const avgCtr = t.impressions ? t.clicks / t.impressions : 0;
  const totalRow = (totals.rows && totals.rows[0]) || {};

  console.log('══════════════ 总览 ══════════════');
  console.table({
    总点击: t.clicks,
    总展示: t.impressions,
    平均CTR: pct(avgCtr),
    平均排名: totalRow.position ? round(totalRow.position) : 'N/A',
  });

  const toTable = (rows, key) =>
    (rows || []).map((r) => ({
      [key]: r.keys[0],
      点击: r.clicks,
      展示: r.impressions,
      CTR: pct(r.ctr),
      排名: round(r.position),
    }));

  console.log(`\n══════════════ Top ${ROW_LIMIT} 查询词 ══════════════`);
  console.table(toTable(byQuery.rows, '查询词'));

  console.log(`\n══════════════ Top ${ROW_LIMIT} 页面 ══════════════`);
  console.table(toTable(byPage.rows, '页面'));

  console.log('\n══════════════ 国家/地区 ══════════════');
  console.table(toTable((byCountry.rows || []).slice(0, 10), '国家'));

  console.log('\n══════════════ 设备 ══════════════');
  console.table(toTable(byDevice.rows, '设备'));

  // 趋势：按周汇总，便于看走势
  const weekly = {};
  (byDate.rows || []).forEach((r) => {
    const d = new Date(r.keys[0]);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = `${d.getFullYear()}-W${String(
      Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7)
    ).padStart(2, '0')}`;
    weekly[week] = weekly[week] || { 点击: 0, 展示: 0 };
    weekly[week].点击 += r.clicks || 0;
    weekly[week].展示 += r.impressions || 0;
  });
  console.log('\n══════════════ 按周趋势 ══════════════');
  console.table(weekly);

  // ---------- 5. 落地 JSON ----------
  const outDir = path.join(ROOT, '_internal', 'gsc-data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `gsc-report-${endDate}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        site,
        range: { startDate, endDate, days: DAYS },
        totals: { clicks: t.clicks, impressions: t.impressions, ctr: avgCtr, position: totalRow.position || null },
        byQuery: byQuery.rows || [],
        byPage: byPage.rows || [],
        byCountry: byCountry.rows || [],
        byDevice: byDevice.rows || [],
        byDate: byDate.rows || [],
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );
  console.log(`\n💾 已保存原始数据： ${path.relative(ROOT, outFile)}\n`);
}

main().catch((e) => fail(e.stack || String(e)));
