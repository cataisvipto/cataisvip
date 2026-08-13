// CATAI 一键灾备脚本：把项目完整备份到 GitHub 私有仓库 cataisvip-internal
// 用法：开 VPN 后运行  node _internal/backup.js
//
// 备份架构（一个私有仓库、两条分支）：
//   main           ← 主仓库完整 git 历史（含未推公开仓库的本地提交，如排行榜）
//   internal-files ← 工作区全量快照（内部文档、_internal/、编辑器等被 .gitignore 忽略的文件）
//
// 安全设计：
//   - GSC OAuth 凭据（gsc-oauth-client.json / gsc-token.json）永久排除，换电脑后重新授权
//   - 快照仓库的 git 目录放在用户主目录（~/.catai-backup.git），不污染项目文件夹
//   - 与公开仓库 origin 完全隔离：脚本只 push 到 backup remote，pre-push 钩子照常拦截公开仓库
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const SNAP_GIT = path.join(os.homedir(), '.catai-backup.git');
const BACKUP_URL = 'https://github.com/cataito-lab/cataito-internal.git';

// 自动检测 Windows 系统代理（VPN 常为系统代理模式，git 默认直连会被墙）
function detectProxy() {
  if (process.env.HTTPS_PROXY || process.env.https_proxy) return null; // 已有环境变量则不覆盖
  try {
    const out = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable',
      { encoding: 'utf8' }
    );
    if (!/0x1\s*$/m.test(out.trim())) return null;
    const srv = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer',
      { encoding: 'utf8' }
    );
    const m = srv.match(/ProxyServer\s+REG_SZ\s+(\S+)/);
    if (!m) return null;
    // 可能是 "host:port" 或 "http=...;https=..." 形式
    let p = m[1];
    if (p.includes('=')) {
      const https = p.split(';').find((s) => s.startsWith('https='));
      const http = p.split(';').find((s) => s.startsWith('http='));
      p = (https || http || '').replace(/^https?=/, '');
    }
    return p ? `http://${p.replace(/^https?:\/\//, '')}` : null;
  } catch {
    return null;
  }
}
const PROXY = detectProxy();
const ENV_BASE = PROXY
  ? { ...process.env, HTTPS_PROXY: PROXY, HTTP_PROXY: PROXY }
  : { ...process.env };
if (PROXY) console.log(`（检测到系统代理，git 将走 ${PROXY}）\n`);

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: ENV_BASE, ...opts });
}
function runSnap(cmd) {
  // 快照仓库：独立 GIT_DIR + 项目根为工作区（git 会自动跳过 .git 目录本身）
  return execSync(cmd, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...ENV_BASE, GIT_DIR: SNAP_GIT, GIT_WORK_TREE: ROOT },
  });
}

console.log('════════════════════════════════════════');
console.log(' CATAI 灾备 → cataisvip-internal（私有）');
console.log('════════════════════════════════════════\n');

// ── 1/3 推送主仓库历史（含本地未上线提交）到私有仓库 main 分支 ──
console.log('[1/3] 推送主仓库 git 历史 → backup/main ...');
run('git push backup main');

// ── 2/3 快照仓库：初始化（若无）+ 排除规则 ──
console.log('\n[2/3] 生成工作区全量快照（含 gitignore 内部文件）...');
if (!fs.existsSync(SNAP_GIT)) {
  execSync(`git init --bare "${SNAP_GIT}"`, { stdio: 'inherit' });
  execSync(`git --git-dir="${SNAP_GIT}" config core.bare false`, { stdio: 'inherit' });
}
execSync(`git --git-dir="${SNAP_GIT}" config user.name "CATAI Backup"`, { stdio: 'inherit' });
execSync(`git --git-dir="${SNAP_GIT}" config user.email "hello@cataito.com"`, { stdio: 'inherit' });
// 排除规则：构建产物 + 敏感凭据（每次覆写，保证规则始终生效）
fs.mkdirSync(path.join(SNAP_GIT, 'info'), { recursive: true });
fs.writeFileSync(
  path.join(SNAP_GIT, 'info', 'exclude'),
  [
    'node_modules/',
    '.next/',
    'tsconfig.tsbuildinfo',
    '# 敏感凭据：即使私有仓库也不上传，换电脑后重新 OAuth / 重新配置',
    '_internal/gsc-oauth-client.json',
    '_internal/gsc-token.json',
    '_internal/console/.token',
    '',
  ].join('\n'),
  'utf8'
);
runSnap('git add -A');
// ⚠ 快照仓库的工作区就是项目根，git 会读取项目 .gitignore → 内部文件会被跳过。
// 这里显式枚举并强制加入（-f）：根目录 *.html/*.md + _internal/ 全部（凭据除外）。
// 用 --pathspec-from-file 避免命令行长度超限与中文文件名转义问题。
const CRED_FILES = new Set(['gsc-oauth-client.json', 'gsc-token.json', '.token']);
const forcedPaths = [];
for (const f of fs.readdirSync(ROOT)) {
  if (/\.(html|md)$/i.test(f)) forcedPaths.push(f);
}
(function walk(rel) {
  for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const r = `${rel}/${e.name}`;
    if (e.isDirectory()) walk(r);
    else if (!CRED_FILES.has(e.name)) forcedPaths.push(r);
  }
})('_internal');
const psFile = path.join(os.tmpdir(), 'catai-backup-pathspec.txt');
fs.writeFileSync(psFile, forcedPaths.join('\n') + '\n', 'utf8');
runSnap(`git add -f --pathspec-from-file="${psFile}"`);
fs.unlinkSync(psFile);
const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
try {
  runSnap(`git commit -m "backup: ${stamp}"`);
} catch {
  console.log('（工作区无变化，跳过快照提交）');
}

// ── 3/3 推送快照 → 私有仓库 internal-files 分支 ──
console.log('\n[3/3] 推送快照 → backup/internal-files ...');
runSnap(`git push ${BACKUP_URL} HEAD:refs/heads/internal-files`);

console.log('\n✅ 灾备完成：主仓库历史(main) + 内部文件快照(internal-files) 均已上云。');
console.log('   凭据文件已按规则排除；恢复方法见 CATAI-项目技术文档「灾备与迁移」。');
