#!/usr/bin/env node
/**
 * backup-all.js — CATAI 一键备份（定期更新入口）
 * 把「Qoder 数据导出 + F 盘 zip 归档 + git 灾备」串成一条命令，双击 / 定时任务 / 手动均可。
 *
 * 用法：
 *   node _internal/backup-all.js               # 完整备份（含 git 灾备，需要 VPN）
 *   node _internal/backup-all.js --skip-git    # 只做本地备份（导出 + zip），不开 VPN 也能跑
 *   node _internal/backup-all.js --keep=5      # zip 只保留最近 5 份（默认 10）
 *   node _internal/backup-all.js --out=D:/Bak  # 指定 zip 归档目录（默认 F:\QoderBackup，无 F 盘则退回桌面）
 *
 * 流程：
 *   1/3  node export-qoder-data.js    导出全部 Qoder 项目（对话 + 记忆）→ ~/Desktop/QderCN/
 *   2/3  打包 qoder-export-* 为 zip → 归档目录，并轮转保留最近 N 份
 *   3/3  node backup.js               git 灾备到私有仓库（需 VPN；失败仅提示，不阻断本地备份）
 *
 * 配套：backup-all.bat（双击即用）；定时任务注册命令见脚本尾部注释。
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const HOME = process.env.USERPROFILE || process.env.HOME || os.homedir();
// 与 export-qoder-data.js 的默认输出保持一致
const EXPORT_ROOT = path.join(HOME, 'Desktop', 'QderCN');
// 归档目录：优先 F 盘 QoderBackup（用户指定），无 F 盘则退回桌面导出根
const DEF_ARCHIVE = fs.existsSync('F:\\') ? 'F:\\QoderBackup' : EXPORT_ROOT;

// ===== 命令行参数 =====
const args = process.argv.slice(2);
const getArg = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const SKIP_GIT = args.includes('--skip-git');
const KEEP = parseInt(getArg('keep') || '10', 10);
const ARCHIVE_DIR = getArg('out') || DEF_ARCHIVE;

// 本地日期（zip 按天归档，同一天重复运行会覆盖为最新）
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit', encoding: 'utf8' });
}
function runQuiet(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

console.log('════════════════════════════════════════');
console.log(' CATAI 一键备份');
console.log('════════════════════════════════════════\n');

// ── 1/3 导出 Qoder 数据 ──
console.log(`[1/3] 导出 Qoder 全部项目数据（对话 + 记忆）...`);
run(`node _internal/export-qoder-data.js`);

// 只接受安全目录名（字母数字 . _ -），避免异常目录名进入 shell 命令
const exportDirs = fs
  .readdirSync(EXPORT_ROOT)
  .filter((d) => /^qoder-export-[A-Za-z0-9._-]+$/.test(d) && fs.statSync(path.join(EXPORT_ROOT, d)).isDirectory());
if (!exportDirs.length) {
  console.error('❌ 未找到任何 qoder-export-* 导出目录，请检查导出脚本是否成功。');
  process.exit(1);
}

// ── 2/3 打包 zip + 轮转 ──
console.log(`\n[2/3] 打包 ${exportDirs.length} 个导出目录 → zip ...`);
fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
const zipPath = path.join(ARCHIVE_DIR, `qoder-export-${dateStr}.zip`);

if (process.platform === 'win32') {
  const paths = exportDirs.map((d) => `'${path.join(EXPORT_ROOT, d)}'`).join(',');
  run(`powershell -NoProfile -Command "Compress-Archive -Path ${paths} -DestinationPath '${zipPath}' -Force"`);
  // 验证 zip 完整性（.NET 读取条目数）
  try {
    const count = runQuiet(
      `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zipPath}').Entries.Count"`
    );
    const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
    console.log(`  ✅ ${path.basename(zipPath)}（${sizeMB} MB，${count} 个条目）`);
  } catch {
    console.log(`  ⚠ zip 已生成但条目验证失败，请手动确认: ${zipPath}`);
  }
} else {
  console.log('  ⚠ 非 Windows 环境跳过 zip 打包（保留目录形式备份）');
}

// 轮转：只保留最近 KEEP 份
const zips = fs
  .readdirSync(ARCHIVE_DIR)
  .filter((f) => /^qoder-export-\d{4}-\d{2}-\d{2}\.zip$/.test(f))
  .map((f) => ({ f, t: fs.statSync(path.join(ARCHIVE_DIR, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);
for (const s of zips.slice(KEEP)) {
  fs.unlinkSync(path.join(ARCHIVE_DIR, s.f));
  console.log(`  🗑 清理过期备份: ${s.f}`);
}
console.log(`  （归档目录 ${ARCHIVE_DIR} 现有 ${zips.length} 份 zip，保留最近 ${KEEP} 份）`);

// ── 3/3 git 灾备 ──
if (SKIP_GIT) {
  console.log('\n[3/3] 跳过 git 灾备（--skip-git）。开 VPN 后可手动运行: node _internal/backup.js');
} else {
  console.log('\n[3/3] git 灾备 → cataito-internal（私有仓库）...');
  try {
    run('node _internal/backup.js');
  } catch {
    console.log('  ⚠ git 灾备失败（通常需要 VPN）。本地备份已完成，稍后手动运行: node _internal/backup.js');
  }
}

console.log('\n✅ 一键备份完成！');
console.log(`   本地导出: ${EXPORT_ROOT}`);
console.log(`   zip 归档: ${zipPath}`);
console.log(`   定时任务参考（管理员 PowerShell）:`);
console.log(`     schtasks /Create /TN "CATAI一键备份" /TR "C:\\Users\\${require('os').userInfo().username}\\Desktop\\QderCN\\catai\\_internal\\backup-all.bat --scheduled" /SC WEEKLY /D SUN /ST 22:00 /F`);
