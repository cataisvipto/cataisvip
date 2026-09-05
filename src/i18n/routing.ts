import { defineRouting } from 'next-intl/routing';

/**
 * 全站语言列表的单一 source of truth。
 *
 * 新增语言时只需：
 *   1. 在下方 `locales` 数组追加语言代码（如 'de'）
 *   2. 新建 messages/{locale}.json 并补齐全部键
 * 其余派生点无需手动改：
 *   - SEO hreflang/canonical（src/lib/seo.ts 的 LOCALES 从此 import）
 *   - 各页 generateStaticParams、locale 校验（layout / skills 从 routing.locales 派生）
 *   - sitemap（src/app/sitemap.ts 从 routing.locales 派生）
 *   - 校验/冒烟脚本（scripts/* 从 messages/*.json 自动发现语言）
 *
 * 注意：仍需为 B 类内容分支（getLocalizedDescription、Newsletter 内联文案、
 * seo.ts 的标题模板 map、数据文件 descriptionXx 字段）补对应语言，否则该部分静默回退英文。
 */
export const locales = ['en', 'zh', 'ja', 'es', 'fr'] as const;
export const defaultLocale = 'en';

// 临时 noindex 语种列表：2026-03 spam update 强化 Scaled Content Abuse 打击，
// 实测 195/195 工具的 ja/es/fr description 与英文完全相同（无本地化），
// 在本地化完成前先对这些语种全站 noindex，隔离风险。
// TODO: 完成本地化翻译后从此数组移除对应语种，恢复 index。
// 单一 source of truth：[locale]/layout.tsx（robots noindex）与 src/lib/seo.ts
// （hreflang 过滤，避免给 noindex 页面发 hreflang 信号）都从这里取值。
export const TEMP_NOINDEX_LOCALES: ReadonlySet<string> = new Set(['ja', 'es', 'fr']);

export const routing = defineRouting({
  locales,
  defaultLocale,
});
