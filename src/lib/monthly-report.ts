/**
 * monthly-report — P4.2 月度生态报告的构建期数据层
 *
 * 用月初冷归档快照（每月 1 号永久保留）对比相邻两个月，产出生态总览与策展榜单。
 * 只统计已收录（ranking.json 榜单内）且 star ≥ 阈值的项目——原始增量榜会混入刷量条目，
 * 策展过滤是报告可信度的关键。构建期使用（fs 直读，globalThis 缓存）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { allProjects, type ProjectRankInfo } from '@/lib/ranking-history';

export interface ReportGainer {
  fullName: string;
  name: string;
  delta: number;
  current: number;
  info: ProjectRankInfo;
}

export interface MonthlyReport {
  month: string; // 'YYYY-MM'
  prevDate: string;
  curDate: string;
  totalStarsPrev: number;
  totalStarsCur: number;
  starGrowth: number;
  projectsPrev: number;
  projectsCur: number;
  newEntrants: number; // 快照池新面孔总数（未过滤）
  curatedNewEntrants: number; // 策展新面孔
  topGainers: ReportGainer[];
  topNewcomers: ReportGainer[];
}

const MIN_STARS = 2000;
const TOP_N = 20;

const G = globalThis as unknown as { __monthlyReport?: MonthlyReport };

export function getMonthlyReport(): MonthlyReport | null {
  if (G.__monthlyReport) return G.__monthlyReport;
  const dir = path.join(process.cwd(), 'snapshots');
  if (!fs.existsSync(dir)) return null;
  const monthStarts = fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-01\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort();
  if (monthStarts.length < 2) return null;

  const prevDate = monthStarts[monthStarts.length - 2];
  const curDate = monthStarts[monthStarts.length - 1];
  const prev = JSON.parse(fs.readFileSync(path.join(dir, prevDate + '.json'), 'utf8')) as Record<string, number>;
  const cur = JSON.parse(fs.readFileSync(path.join(dir, curDate + '.json'), 'utf8')) as Record<string, number>;

  const curated = allProjects();
  const eligible = [...curated.keys()].filter((f) => typeof cur[f] === 'number' && cur[f] >= MIN_STARS);

  const gainers: ReportGainer[] = [];
  const newcomers: ReportGainer[] = [];
  for (const fullName of eligible) {
    const info = curated.get(fullName)!;
    const curStars = cur[fullName];
    if (typeof prev[fullName] === 'number') {
      gainers.push({ fullName, name: info.name, delta: curStars - prev[fullName], current: curStars, info });
    } else {
      newcomers.push({ fullName, name: info.name, delta: curStars, current: curStars, info });
    }
  }
  gainers.sort((a, b) => b.delta - a.delta);
  newcomers.sort((a, b) => b.current - a.current);

  const sum = (d: Record<string, number>) => Object.values(d).reduce((s, n) => s + n, 0);
  const rawNewcomers = Object.keys(cur).filter((k) => !(k in prev)).length;

  const report: MonthlyReport = {
    month: curDate.slice(0, 7),
    prevDate,
    curDate,
    totalStarsPrev: sum(prev),
    totalStarsCur: sum(cur),
    starGrowth: sum(cur) - sum(prev),
    projectsPrev: Object.keys(prev).length,
    projectsCur: Object.keys(cur).length,
    newEntrants: rawNewcomers,
    curatedNewEntrants: newcomers.length,
    topGainers: gainers.slice(0, TOP_N),
    topNewcomers: newcomers.slice(0, TOP_N),
  };
  G.__monthlyReport = report;
  return report;
}
