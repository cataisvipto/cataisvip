// 临时诊断：查 cataito-ranking Actions 运行记录（凭据来自 git credential manager，不打印）
const { execSync } = require('child_process');

function getToken() {
  const out = execSync('git credential fill', {
    input: 'protocol=https\nhost=github.com\nusername=cataito-lab\n\n',
    encoding: 'utf8',
  });
  const m = out.match(/^password=(.+)$/m);
  if (!m) throw new Error('未取到凭据');
  return m[1].trim();
}

async function main() {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };

  // 1. 最近 8 次 workflow 运行
  const runs = await fetch(
    'https://api.github.com/repos/cataito-lab/cataito-ranking/actions/runs?per_page=8',
    { headers }
  ).then((r) => r.json());
  console.log('=== 最近 workflow 运行 ===');
  (runs.workflow_runs || []).forEach((w) =>
    console.log(`${w.run_started_at}  [${w.event}]  ${w.name}  ${w.status}/${w.conclusion}  ${w.html_url}`)
  );

  // 2. workflow 本身状态（是否被 GitHub 禁用）
  const wfs = await fetch(
    'https://api.github.com/repos/cataito-lab/cataito-ranking/actions/workflows',
    { headers }
  ).then((r) => r.json());
  console.log('\n=== workflow 状态 ===');
  (wfs.workflows || []).forEach((w) => console.log(`${w.name}  state=${w.state}  path=${w.path}`));

  // 3. 失败告警 issue
  const issues = await fetch(
    'https://api.github.com/repos/cataito-lab/cataito-ranking/issues?state=open&per_page=5',
    { headers }
  ).then((r) => r.json());
  console.log('\n=== open issues ===');
  if (Array.isArray(issues) && issues.length) {
    issues.forEach((i) => console.log(`#${i.number} ${i.title} (${i.created_at})`));
  } else {
    console.log('（无）');
  }
}
main().catch((e) => {
  console.error('诊断失败：', e.message);
  process.exit(1);
});