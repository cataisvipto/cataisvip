# ALGO-CHANGELOG — 算法演进史

> ⚠️ 本文档是算法的"户口本"，与 `scripts/rank.mjs` 中的 `ALGO_VERSION` 一一对应。
> 历史条目**只增不删、只增不改**——半年后回看"当时为什么这么改"全靠它。

## 记录纪律（每次改算法必须走完）

1. 递增 `rank.mjs` 顶部的 `ALGO_VERSION`（影响结果的改动升次版本号 x.Y；评分模型重构升主版本号 X.0）
2. 在本文档**最上方**追加条目：日期、变更、动机、前后参数对照、预期影响
3. `node scripts/rank.mjs --dry` 验证通过，对比前后榜单前 20 名确认变化符合预期
4. 单独提交，commit message 前缀 `algo:`

---

## v1.3 — 2026-07-31

**变更**（快照保留策略调整，排序逻辑无变化）：
- `SNAPSHOT_KEEP_DAYS` 35 → 548：滚动窗口 35 天 → 18 个月；每月 1 号永久豁免规则不变

**动机**：日粒度快照删了无法回溯（GitHub API 无历史 star 曲线），35 天只够月榜窗口；18 个月可支撑同比对比（需 13 个月）、季度/年度日粒度趋势等未来功能。实测每份快照约 50KB，18 个月满窗约 27MB（git delta 压缩后更小），零成本约束内。趁快照刚开始积累（当前仅 5 份）尽早放宽，避免数据被清理后追悔。

**评估过"更长周期/永久滚动"并放弃**：①>18 个月的分析场景月初冷归档（月粒度）已覆盖；②git 历史本身保留全部被清理快照，可回溯兜底；③超长日粒度回溯的正解是 GH Archive @ BigQuery（IDEAS L4），无限加长窗口只堆文件数、无消费场景。

**预期影响**：榜单排序结果与 v1.2 完全一致；snapshots/ 目录文件数上限约 560 个。

## v1.2 — 2026-07-26

**变更**（分类扩容 6 → 8 + 黑名单增强）：
- 新增分类 `video 视频生成`（video-generation >300★ / text-to-video >300★）与 `vision 计算机视觉`（computer-vision >3000★ / object-detection >1000★ / ocr >1000★）
- 黑名单增强：excludeTopics 增加 `book`；excludeDescPatterns 增加 /textbook/i、/教科书/、/用于教学/、/\bbook\b/i（\b 边界不误伤 notebook/cookbook）

**动机**：探针实测（见 Backlog 归档表）video/vision 密度远超判定线，是现有六分类最大空缺；CV 池头部混入 d2l-zh 等教科书仓库，现有正则拦不住。

**前后对照**：分类 6 → 8；总榜候选池扩大（新增约 5 条查询 × 100）；教材拦截可能剔除少量原上榜仓库（预期为误收录，属修正）。

**预期影响**：总榜前列基本稳定（头部项目不受新增查询影响）；候选池扩大导致池内归一化基准微移，中后段名次或有小幅波动，属预期内。

## v1.1 — 2026-07-26

**变更**（管线加固，排序逻辑无变化）：
- 新增数据熔断 `sanityCheck`：候选池相比最近快照跌幅 > `MAX_POOL_SHRINK`(0.4)，或任一榜单候选不足名额 → 报错退出、不写任何文件
- 建立每日 star 快照体系：全候选池（含未过滤仓库）写入 `snapshots/YYYY-MM-DD.json`，滚动 35 天，**每月 1 号永久归档**
- CI 失败自动开 issue 告警

**动机**：为周榜/月榜积累增量基准（历史无法回溯，必须尽早开始）；防止 API 异常时坏数据污染榜单；消除定时任务静默失败。

**预期影响**：榜单排序结果与 v1.0 完全一致；新增的是数据安全网。

## v1.0 — 2026-07-26（初版基线）

**评分模型**：五因子池内 min-max 归一化加权
| 因子 | 权重 | 原始变换 |
|---|---|---|
| stars | 0.28 | log10(stars+1) |
| velocity | 0.24 | log10(stars/仓库年龄天数+1) |
| freshness | 0.24 | exp(-ln2 × 距最近提交天数 / 28) |
| forks | 0.13 | log10(forks+1) |
| community | 0.11 | min(0.3, forks/stars) / 0.3 |

**过滤规则（黑名单）**：
- 硬性：archived/disabled、无描述、star < 800、90 天无提交、forks/stars > 0.5
- 清单类三重正则：仓库名（awesome-/-list/interview/roadmap/course/tutorial 等 15 条）、描述（教程/入门/curated list 等 7 条）、topics（awesome/tutorial/education 等 7 项）

**发现与名额**：6 分类 × 3 topic 查询（star 下限 300~3000 分级）；总榜 Top 100（全池归一化）+ 分类榜各 Top 30（分池归一化）；同分按 star 数决胜；`EDITORIAL_ADJUST` 编辑加权（±0.1）留空。

**防反推**：池内归一化 + 分池归一化 + 输出零得分 + 编辑加权，公开数据无法复现分数。

---

## Backlog

- [ ] **仓库名黑名单**（2026-07-27，想法）：两日 star 增量测试实测发现内容型仓库躲过 v1.2 黑名单进入候选池并霸榜增长榜（ai-agent-book +757★/天、ai-engineering-from-scratch、system_prompts_leaks）。现有教材拦截只查 description 与 topic，未查仓库名。v1.3 候选：对 repo.name 增加 \bbook\b、from[-_]scratch、leaks?、prompts? 类模式拦截；改动前须用探针实测误伤率（防止误杀正规项目如 jupyter-book 类工具）。
- [ ] **两日增量原型已验证**（2026-07-27，已验证待产品化）：snapshots 相减管线跑通（1643 可比仓库），周榜=7日差、月榜=30日差，等快照积累够即可开发。（已识别、待数据/时机成熟）

- [ ] **velocity 因子升级**：快照满 30 天后，从"stars/仓库年龄"（历史平均）换成"近 7/30 天真实增量"——精度质变，v2.0 主候选
- [ ] 周榜/月榜排序：star 增量为主 + 增速率为辅，权重待真实快照回测
- [ ] 反刷分：基于快照识别单日 star 异常暴涨曲线，触发人工复核
- [ ] 名次平滑：边缘位次连续两天变化才生效，消除归一化抖动
- [ ] 显式黑名单：规则拦不住的具体仓库（目前无案例，遇到再加）

### 分类扩容探针实测（2026-07-26，匿名 API，轻量过滤口径）

> 判定线：过滤后 ≥800★ 仓库数 ≥ 40 → 可独立成分类（30 名额 + 熔断余量）；20~40 观察；<20 不成立。

| 候选分类 | 探针查询 | ≥800★ | 判定 | 备注 |
|---|---|---|---|---|
| 视频生成 | video-generation / text-to-video | 106 | ✅ 成立 | 信号干净，当前六分类的明显空缺 |
| 计算机视觉 | computer-vision / object-detection / ocr | 244 | ✅ 成立（密度最高） | 头部 opencv/PaddleOCR；注意 d2l-zh 这类教材需靠描述正则拦截 |
| 训练/微调 | fine-tuning / lora / llm-training | 122 | ✅ 成立 | 与 llm/rag 榜有重叠（如 llama_index 打了 fine-tuning 标签），允许一仓多榜即可 |
| 数据分析 | text-to-sql / data-analysis | 97 | ⚠️ 观察 | 数量够但边界模糊：superset/scikit-learn 属通用数据工具，"AI 数据分析"界定难 |
| 视频剪辑 | video-editing / video-processing | 87 | ❌ 不独立 | topic 污染严重（supervision/mediapipe/Anime4K 实为 CV 库），并入"视频"或 CV 更合理 |

- [x] **分类扩容 v1.2 候选**：✅ 已落地（v1.2，2026-07-26）新增 video/vision 两分类；"训练/微调 training"视用户需求后续可加；数据分析待想清楚边界再议

