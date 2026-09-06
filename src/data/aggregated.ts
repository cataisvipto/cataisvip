/**
 * 数据聚合出口（2.1 数据文件拆分后的唯一运行时入口）。
 *
 * - 编辑源：`tools/<slug>.json` 等 6 个目录，每条一文件（git diff 精确到条目）
 * - 展示顺序：`canonical-order.json`（= 拆分前数组的原始顺序；glob 返回字典序不可靠，
 *   列表页/首页的展示顺序依赖它）
 * - 依赖 Turbopack 的 `import.meta.glob`（Next 16 全局类型内置声明）；Node 脚本侧请用
 *   `scripts/lib/load-data.mjs`（fs 装配），不要在无打包器环境 import 本模块
 * - 数据结构由 `scripts/schemas/*.schema.json` 在 `npm test` 强校验，此处不做 TS 深推断
 */

import canonicalOrder from './canonical-order.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Tool = any;
export type ToolDetail = any;
export type Skill = any;
export type SkillDetail = any;
export type Mcp = any;
export type McpDetail = any;

type JsonModule = { default: unknown };

const toolMods = import.meta.glob('./tools/*.json', { eager: true }) as Record<string, JsonModule>;
const toolDetailMods = import.meta.glob('./tool-details/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const skillMods = import.meta.glob('./skills/*.json', { eager: true }) as Record<string, JsonModule>;
const skillDetailMods = import.meta.glob('./skill-details/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const mcpMods = import.meta.glob('./mcp/*.json', { eager: true }) as Record<string, JsonModule>;
const mcpDetailMods = import.meta.glob('./mcp-details/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;

/** 按顺序锚装配数组；多文件/缺文件都是数据事故，构建期直接失败 */
function assembleArray(
  mods: Record<string, JsonModule>,
  order: string[],
  label: string,
): unknown[] {
  const expected = order.map((slug) => `./${label}/${slug}.json`);
  const missing = expected.filter((p) => !(p in mods));
  const extra = Object.keys(mods).filter((p) => !expected.includes(p));
  if (missing.length || extra.length) {
    throw new Error(
      `数据不一致（${label}）：` +
        (missing.length ? `canonical-order.json 登记但缺文件：${missing.join(', ')}` : '') +
        (extra.length ? `目录有文件但未登记顺序：${extra.join(', ')}（应更新 canonical-order.json）` : ''),
    );
  }
  return expected.map((p) => {
    // Turbopack 对 JSON 的 glob 模块可能是 { default } 包裹，也可能直接是对象本身——归一化兼容
    const m = mods[p] as { default?: unknown };
    return (m.default ?? m) as unknown;
  });
}

/** 按顺序锚装配 map（详情集合顺序跟随主档顺序） */
function assembleMap(
  mods: Record<string, JsonModule>,
  order: string[],
  label: string,
): Record<string, unknown> {
  const list = assembleArray(mods, order, label);
  return Object.fromEntries(order.map((slug, i) => [slug, list[i]]));
}

export const tools: Tool[] = assembleArray(toolMods, canonicalOrder.tools, 'tools');
export const toolDetails: Record<string, ToolDetail> = assembleMap(
  toolDetailMods,
  canonicalOrder.tools,
  'tool-details',
);
export const skills: Skill[] = assembleArray(skillMods, canonicalOrder.skills, 'skills');
export const skillDetails: Record<string, SkillDetail> = assembleMap(
  skillDetailMods,
  canonicalOrder.skills,
  'skill-details',
);
export const mcp: Mcp[] = assembleArray(mcpMods, canonicalOrder.mcp, 'mcp');
export const mcpDetails: Record<string, McpDetail> = assembleMap(
  mcpDetailMods,
  canonicalOrder.mcp,
  'mcp-details',
);
