#!/usr/bin/env node
/**
 * CATAI — 快照本地归档备份（三重存储的第 2 层）
 * ============================================
 * ⚠️ 位于 _internal/，不入公开仓库。仅本机运行。
 *
 * 作用：把 catai-ranking 的每日星数快照同步一份到本地冷备目录，并检测断档缺口。
 *   ① 云端主副本：catai-ranking 仓库 snapshots/（GitHub Actions 每日写）
 *   ② 本地冷备：  _internal/snapshots-archive/          ← 本脚本维护
 *   ③ 私有灾备：  cataito-internal（backup.js，含本目录）
 *
 * 流程：git pull 榜单仓库最新 → 复制 snapshots/*.json 到本地归档 → 检测日期连续性 → 报缺口。
 *
 * 用法：node _internal/console/snapshot-backup.js
 *   （由控制台“同步快照到本地归档”按钮调用，也可注册 Windows 计划任务每日自动跑）
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RANKING_REPO = 'c:/Users/83510/Desktop/QderCN/ai-ranking';
const SNAP_SRC = path.join(RANKING_REPO, 'snapshots');
const ARCHIVE = path.resolve(__dirname, '..', 'snapshots-archive');

// 复用 backup.js 的系统代理探测（VPN 常为系统代理模式）
function detectProxy() {
  if (process.env.HTTPS_PROXY || process.env.https_proxy) return null;
  try {
    const en = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable', { encoding: 'utf8' });
    if (!/0x1\s*$/m.test(en.trim())) return null;
    const srv = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer', { encoding: 'utf8' });
    const m = srv.match(/ProxyServer\s+REG_SZ\s+(\S+)/);
    if (!m) return null;
    let p = m[1];
    if (p.includes('=')) { const parts = p.split(';'); p = (parts.find((s) => s.startsWith('https=')) || parts.find((s) => s.startsWith('http=')) || '').replace(/^https?=/, ''); }
    return p ? `http://${p.replace(/^https?:\/\//, '')}` : null;
  } catch { return null; }
}

function log(s) { console.log(s); }

// ── 1/3 拉取榜单仓库最新快照 ──
log('[1/3] 拉取 catai-ranking 最新快照…');
const PROXY = detectProxy();
const env = PROXY ? { ...process.env, HTTPS_PROXY: PROXY, HTTP_PROXY: PROXY } : { ...process.env };
if (PROXY) log(`      （检测到系统代理，git 走 ${PROXY}）`);
let pulled = true;
try {
  execSync('git fetch origin --quiet', { cwd: RANKING_REPO, env, stdio: 'pipe', timeout: 60000 });
  execSync('git checkout -q main && git merge -q --ff-only origin/main', { cwd: RANKING_REPO, env, stdio: 'pipe', timeout: 30000 });
} catch (e) {
  pulled = false;
  log(`      ⚠ 拉取失败（可能需开 VPN），改用本地已有快照继续归档。\n      ${String(e).split('\n')[0]}`);
}

// ── 2/3 复制到本地归档 ──
log('[2/3] 归档到 ' + ARCHIVE + ' …');
fs.mkdirSync(ARCHIVE, { recursive: true });
if (!fs.existsSync(SNAP_SRC)) { log('      ❌ 榜单仓库 snapshots/ 不存在，终止。'); process.exit(1); }
let copied = 0;
const srcFiles = fs.readdirSync(SNAP_SRC).filter((f) => f.endsWith('.json'));
for (const f of srcFiles) {
  const src = path.join(SNAP_SRC, f);
  const dst = path.join(ARCHIVE, f);
  // 仅当目标不存在或源更新时才复制（幂等）
  if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
    fs.copyFileSync(src, dst); copied++;
  }
}
log(`      本地归档共 ${fs.readdirSync(ARCHIVE).filter((f) => f.endsWith('.json')).length} 份，本次新增/更新 ${copied} 份。`);

// ── 3/3 断档检测：从最早快照到今天，逐日检查缺哪天 ──
log('[3/3] 断档检测…');
const dates = fs.readdirSync(ARCHIVE).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')).sort();
if (!dates.length) { log('      无快照可检测。'); process.exit(0); }
const first = new Date(dates[0] + 'T00:00:00Z');
const todayUTC = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
const have = new Set(dates);
const gaps = [];
for (let d = new Date(first); d < todayUTC; d.setUTCDate(d.getUTCDate() + 1)) {
  const key = d.toISOString().slice(0, 10);
  if (!have.has(key)) gaps.push(key);
}
const today = todayUTC.toISOString().slice(0, 10);
const todayOk = have.has(today);

log('════════════════════════════════════════');
log(` 覆盖区间: ${dates[0]} → ${dates[dates.length - 1]}（共 ${dates.length} 天）`);
log(` 今日(${today})快照: ${todayOk ? '✅ 已生成' : '⏳ 尚未生成'}`);
if (gaps.length) {
  log(` ⚠ 历史断档 ${gaps.length} 天: ${gaps.join(', ')}`);
  log('   （历史星数不可回补，这些日期的增量精度已受损）');
} else {
  log(' ✅ 历史无断档，逐日连续。');
}
log('════════════════════════════════════════');
if (!pulled) log('提醒：本次未能联网拉取，结果基于本地已有快照。开 VPN 后重跑可获取最新。');
