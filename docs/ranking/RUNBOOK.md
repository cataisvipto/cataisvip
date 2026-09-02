# RUNBOOK — 运维消防手册

> 本仓库为 Private，本文档仅供内部使用。遇到问题先查这里，再翻代码。

## 系统概览

| 项 | 说明 |
|---|---|
| 数据源 | GitHub Search API（公开数据，版本头 `2026-03-10`） |
| 核心脚本 | `scripts/github-ranking/rank.mjs`（私有算法，勿泄露权重与查询配置） |
| 算法版本 | 脚本顶部 `ALGO_VERSION`，演进史见 `docs/ALGO-CHANGELOG.md` |
| 定时任务 | `.github/workflows/refresh-ranking.yml`（workflow 名 `Update Ranking`），双 cron 兜底：UTC 00:37 主跑 + 02:53 备份（北京 08:37 / 10:53），每次生成数据 + 当日快照 + 推送 `pages-data` 活数据源 |
| 榜单输出 | `src/data/ranking.json`（静态壳快照，客户端水合后会被活数据覆盖） |
| 活数据源 | `pages-data` 分支 → GitHub Pages → `https://cataito-lab.github.io/cataito/ranking.json`；前端 `RankingClient.tsx` 客户端拉取覆盖渲染（见第 8 章） |
| 快照数据 | `snapshots/YYYY-MM-DD.json`，滚动 18 个月（548 天）；**每月 1 号永久保留**（冷归档） |
| 熔断机制 | 候选池骤降 >40% 或任一榜单缺额 → 脚本报错退出，不写任何文件 |
| 失败告警 | Actions 失败自动开 issue + GitHub 邮件通知 |

## 日常操作

```bash
node scripts/rank.mjs          # 正式生成（榜单 + 当日快照）
node scripts/rank.mjs --dry    # 预览，不写任何文件
npm run dev                    # 本地预览网站
npm run build                  # 交付前必须构建通过
```

正常情况下**无需人工干预**：Actions 每天自动抓取、提交、推送。

## 变更纪律（强制）

任何影响榜单结果的改动——评分权重、过滤/黑名单规则、分类查询、熔断阈值——必须走完四步，缺一不可：

1. 递增 `rank.mjs` 顶部 `ALGO_VERSION`
2. 在 `docs/ALGO-CHANGELOG.md` 最上方追加条目（日期/变更/动机/前后对照/预期影响），历史条目只增不删
3. `--dry` 验证 + 对比前后榜单前 20 名
4. 单独提交，message 前缀 `algo:`

## 应急预案

### 定时任务失败（收到 issue / 邮件）
1. 打开 issue 里的日志链接，看是「熔断触发」还是「API 报错」
2. **熔断触发**（候选池骤降/榜单缺额）：先人工确认 GitHub 上对应 topic 是否真的异常。是数据源问题 → 调整 `CATEGORIES` 查询或阈值；是误报 → 调大 `MAX_POOL_SHRINK`
3. 修复后在 Actions 页手动 `Run workflow` 补跑。**当天补跑成功则快照不断档**；跨天了则该日永久缺失，趋势计算跳过该日即可

### 快照断档
- 快照**无法回溯补齐**。断 1 天：周榜/月榜计算时用最近可用快照替代，误差可接受
- 注意：GitHub 会禁用 60 天无 commit 活动仓库的 scheduled workflow。本仓库每日快照必然产生 commit，正常不会触发；若长期熔断失败则可能中招，恢复后去 Actions 页重新 enable

### 换电脑 / 硬盘损坏
1. 新机装 Node 20 + git，`git clone` 本仓库（私有，需登录），`npm install`
2. 在 GitHub 上 **Revoke 旧 PAT**，新发 fine-grained 只读 PAT（90 天过期）
3. 手动新建 `.env.local`：`GITHUB_TOKEN=xxx`（仅本地调试用，日常靠 Actions）
4. ⚠️ 绝不通过网盘/聊天工具传输 `.env.local`

### Token 泄露（哪怕只是怀疑）
GitHub → Settings → Developer settings → Personal access tokens → **立即 Revoke** → 重新生成。本项目 token 仅只读公开数据，最坏影响是额度被盗用，但仍须立即轮换。

## 定期维护

| 周期 | 动作 |
|---|---|
| 每 90 天 | PAT 到期，重新生成并更新 `.env.local` |
| 每季度 | `git bundle create ai-ranking-backup.bundle --all` 存移动硬盘（异地冷备） |
| 每季度 | 检查 Dependabot alerts，`npm audit` 处理高危依赖漏洞 |
| 每次改算法 | 按上方「变更纪律」四步走 |
| 榜单质量下降时 | 调整 `FILTERS` 阈值 / `EDITORIAL_ADJUST` 编辑加权 |

## GitHub 侧一次性配置清单（建仓后勾掉）

- [ ] 仓库设为 **Private**
- [ ] 账号开启 **2FA**，recovery codes 离线保存（丢失可能永久锁死账号）
- [ ] Settings → Security：开启 Dependabot alerts + security updates
- [ ] Settings → Notifications：确认 Actions 失败邮件通知开启
- [ ] 首次推送后手动 `Run workflow` 验证 Actions 全链路

## 关键参数速查（均在 `scripts/rank.mjs` 顶部）

| 参数 | 当前值 | 含义 |
|---|---|---|
| `ALGO_VERSION` | 1.1 | 算法版本（对应 ALGO-CHANGELOG） |
| `CATEGORIES` | 6 类 ×3 查询 | 分类与发现查询 |
| `FILTERS.minStars` | 800 | 入榜最低 star |
| `WEIGHTS` | 五因子 | 私有评分权重（机密） |
| `FRESHNESS_HALF_LIFE` | 28 天 | 活跃度半衰期 |
| `MAX_POOL_SHRINK` | 0.4 | 熔断：候选池最大允许跌幅 |
| `SNAPSHOT_KEEP_DAYS` | 548 天（18 个月） | 快照滚动窗口（月初豁免） |
| `TOP_ALL` / `TOP_CATEGORY` | 100 / 30 | 榜单名额 |

## 路线图备忘

- ~8/2（快照满 7 天）：上线**周榜** Tab（7 日 star 增量为主 + 增速率为辅）
- ~8/25（满 30 天）：上线**月榜** Tab
- 权重待真实快照数据回测后确定；算法类待办见 ALGO-CHANGELOG 的 Backlog
- 产品/数据/运营类点子库：`docs/IDEAS.md`（互动中的好点子当场入库，只改状态不删除）

## 已知故障案例

### 2026-07-27：定时任务未执行（无失败记录、无 issue 告警）
- **现象**：北京时间 08:00 后远端无新提交，Actions 页只有历史运行，无当天记录，也无失败 issue（因为任务根本没启动，failure 告警不会触发）。
- **原因**：cron 定在 `0 0 * * *`（UTC 整点零分）。GitHub 官方文档明确：高负载时段 schedule 事件可能延迟或直接丢弃，UTC 00:00 是全球最拥挤时刻，新仓库/低活跃仓库优先被牺牲。
- **修复**：cron 改为 `37 0 * * *` 错峰（北京 08:37）。
- **断档补救**：发现当天没跑，立即手动触发 workflow_dispatch 补跑（Actions 页 Run workflow，或 API `POST /repos/{owner}/{repo}/actions/workflows/update-ranking.yml/dispatches`）。当天补跑快照仍按当天日期落盘，不算断档；隔天才发现则该日快照永久缺失。
- **巡检习惯**：每天早上看一眼仓库 Commits 是否有当日 `chore: update ranking` 提交。

### 2026-07-28：错峰后单 cron 仍被丢弃
- **现象**：7-27 已将 cron 从 UTC 00:00 错峰到 00:37，但 7-28 早上远端仍无当日提交，Actions 无 schedule 记录、无告警。
- **原因**：单一 cron 时刻对低活跃私有仓库仍不够可靠——GitHub 的 schedule 本就是"尽力而为"，高负载时优先牺牲此类仓库，换个错峰时刻只是降低概率、并不能根治。
- **修复**：改为**双 cron 兜底**（00:37 主跑 + 02:53 备份），两次都被丢的概率远低于单次；当日补跑快照覆盖写、无变化不提交，重复运行无副作用。
- **断档补救**：仍同上——发现当天没跑立即 `workflow_dispatch` 补跑，当日落盘不算断档。

### 2026-09-02：活数据源 publish-pages 连续失败，排名前端停在旧日
- **现象**：Aaron 发现 cataito.com 排名页今天没更新。查链路：`rank` job 一直成功、`src/data/ranking.json` 快照每日正常推送 main；但活数据源 `cataito-lab.github.io/cataito/ranking.json` 停在 `updatedAt: 2026-09-01`。CF Pages 上最近 3 个 `chore(data): 自动刷新排行榜` 提交均显示 "No deployment available"。
- **定位**：`refresh-ranking.yml` 拆两 job——`rank`（生成数据 + push main）与 `publish-pages`（发活数据到 `pages-data` 分支）。#51/#50 两次 schedule + #48/#49 两次手动重跑，**`rank` 全绿、只有 `publish-pages` 失败**，annotation 指向 `git push --force origin HEAD:pages-data`，exit code 1。`pages-data` 分支上只有 Aaron 昨天 1 个 commit、无任何 `github-actions[bot]` 提交，直接证实 bot 的 push 从未成功。
- **根因**：GitHub **branch ruleset / branch protection 禁止 `GITHUB_TOKEN`（github-actions[bot]）对 `pages-data` 做 force push**。即使 workflow 已声明 `permissions: contents: write`，ruleset 拦的是"rewrite history"这个动作本身，`permissions` 不生效。`git push --force` 在无共同祖先时必然触发 force 语义，被拦。
- **为何 #47 成功**：那是 Aaron **用个人账号在 `pages-data` 分支上手动 `workflow_dispatch`**（触发分支 `pages-data`），凭据是 Aaron 而非 `GITHUB_TOKEN`，绕开了对 bot 的限制。
- **修复（4447e758）**：把 `publish-pages` 从 `--orphan + --force` 改成 **`git plumbing` 普通 push**——`git fetch origin main --prune` 取最新快照 → `git fetch origin pages-data` 取远端 HEAD → `git read-tree` 把远端树复制出来、替换 `ranking.json` → **`git commit-tree -p <远端HEAD>` 建新 commit**（父节点 = 远端 `pages-data` 的 HEAD）→ `git push origin <新commit>:pages-data` 做**普通前进 push**（非 force）。ruleset 不拦。数据相同则 `git diff --cached --quiet` 跳过，不刷 commit。首次无 `pages-data` 时用空树 + 空根提交作起点。
- **关键教训**：①ruleset 对 force push 的限制不受 `permissions` 影响，别指望加权限绕过；②想让 bot 的 push 不被拦，就要让 commit 有远端 HEAD 为父（普通前进），不能新建独立历史再强推；③拼单文件分支用 `git plumbing`（`commit-tree` / `read-tree` / `write-tree`），**别 checkout 整个 main 工作树**（609 文件全带上，脏且慢）；④GitHub Pages 只发布分支根目录文件，`pages-data` 根目录必须放 `ranking.json`，且非主页仓库带仓库名子目录（URL 是 `.../cataito/ranking.json`，不是 `.../ranking.json`）。
- **验证**：本地 bare repo 复现 fetch → read-tree → 换文件 → `commit-tree -p <远端HEAD>` → `git push origin <新commit>:pages-data`，结果为普通前进 `de26523..b759847`，`rc=0`，无 force 提示。上线后 #52（手动触发）publish-pages 成功，`pages-data` 新增 `a68a3d60 chore(data): ranking live 2026-09-02`，活数据源 `updatedAt` 变为 `2026-09-02`，8 board 共 340 items。详见 skill `solutions.md` #13。
- **断档补救**：发现当天活数据没更新，立即去 Actions 页搜 `Update Ranking` → 手动 `Run workflow`（分支 main）补跑一次即可，当天活数据覆盖写、无变化不提交，补跑无副作用。
