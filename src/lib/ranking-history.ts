/**
 * ranking-history — P4.1 排行项目详情页的构建期数据层
 *
 * 读 snapshots/YYYY-MM-DD.json（每日 fullName → stars 快照，bot 维护），
 * 装配每个项目的 star 时序。仅在服务端构建期使用（fs 直读，globalThis 按 worker 缓存）。
 *
 * 路由采用 /project/[org]/[repo] 双段：fullName 本身就是路径（可逆、无转义）。
 * 严禁用「- 替换 /」做单向 slug——GitHub 项目名普遍含连字符，不可逆。
 */
import fs from 'node:fs';
import path from 'node:path';
import ranking from '@/data/ranking.json';

export interface ProjectRankInfo {
  fullName: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  avatar: string;
  boards: { key: string; nameEn: string; rank: number; change: number | null }[];
  bestRank: number;
}

const BOARD_NAME_EN: Record<string, string> = {
  all: 'Overall',
  llm: 'LLM',
  agents: 'AI Agents',
  image: 'Image Generation',
  audio: 'Audio',
  devtools: 'Dev Tools',
  rag: 'RAG',
  video: 'Video',
  vision: 'Vision',
};

interface HistoryCache {
  dates: string[];
  starsByProject: Map<string, (number | null)[]>;
}

const G = globalThis as unknown as { __rankingHistory?: HistoryCache };

function loadHistory(): HistoryCache {
  if (G.__rankingHistory) return G.__rankingHistory;
  const dir = path.join(process.cwd(), 'snapshots');
  const dates = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map((f) => f.replace('.json', ''))
        .sort()
    : [];
  const starsByProject = new Map<string, (number | null)[]>();
  for (const date of dates) {
    const snap = JSON.parse(fs.readFileSync(path.join(dir, date + '.json'), 'utf8')) as Record<
      string,
      number
    >;
    for (const [fullName, stars] of Object.entries(snap)) {
      const arr = starsByProject.get(fullName);
      if (arr) arr.push(stars ?? null);
      else starsByProject.set(fullName, [stars ?? null]);
    }
  }
  // 项目中途进快照池的：前置补 null 对齐长度
  for (const arr of starsByProject.values()) {
    while (arr.length < dates.length) arr.unshift(null);
  }
  G.__rankingHistory = { dates, starsByProject };
  return G.__rankingHistory;
}

/** 所有出现在任一榜单的项目（ranking.json 为准），键 = fullName */
export function allProjects(): Map<string, ProjectRankInfo> {
  const info = new Map<string, ProjectRankInfo>();
  for (const [key, board] of Object.entries(ranking.boards)) {
    for (const item of board.items) {
      let e = info.get(item.fullName);
      if (!e) {
        e = {
          fullName: item.fullName,
          name: item.name,
          description: item.description ?? '',
          url: item.url ?? `https://github.com/${item.fullName}`,
          stars: item.stars,
          forks: item.forks ?? 0,
          language: item.language ?? '',
          topics: item.topics ?? [],
          avatar: item.avatar ?? '',
          boards: [],
          bestRank: 999,
        };
        info.set(item.fullName, e);
      }
      e.boards.push({
        key,
        nameEn: BOARD_NAME_EN[key] ?? key,
        rank: item.rank,
        change: item.change ?? null,
      });
      e.bestRank = Math.min(e.bestRank, item.rank);
    }
  }
  return info;
}

export interface ProjectPageData {
  info: ProjectRankInfo;
  fullName: string;
  org: string;
  repo: string;
  series: { date: string; stars: number | null }[];
  latest: number;
  d7: number | null;
  d30: number | null;
  d7Pct: number | null;
  dataDate: string;
}

/** 组装单个项目页所需的全部数据；fullName 不存在返回 null */
export function getProjectPageData(fullName: string): ProjectPageData | null {
  const info = allProjects().get(fullName);
  if (!info) return null;
  const [org, repo] = fullName.split('/');
  const { dates, starsByProject } = loadHistory();
  const raw = starsByProject.get(fullName) ?? [];
  const series = dates.map((date, i) => ({ date, stars: raw[i] ?? null }));
  const known = series.filter((p) => p.stars !== null) as { date: string; stars: number }[];
  const latest = known.length ? known[known.length - 1].stars : info.stars;
  const at = (back: number) => {
    if (known.length <= back) return null;
    return known[known.length - 1 - back].stars;
  };
  const prev7 = at(7);
  const prev30 = at(30);
  const d7 = prev7 !== null ? latest - prev7 : null;
  const d30 = prev30 !== null ? latest - prev30 : null;
  return {
    info,
    fullName,
    org,
    repo,
    series,
    latest,
    d7,
    d30,
    d7Pct: d7 !== null && prev7 ? Math.round((d7 / prev7) * 1000) / 10 : null,
    dataDate: known.length ? known[known.length - 1].date : (ranking.updatedAt ?? ''),
  };
}

export function rankingUpdatedAt(): string {
  return (ranking as { updatedAt?: string }).updatedAt ?? '';
}
