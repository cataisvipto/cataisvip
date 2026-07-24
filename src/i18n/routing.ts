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

export const routing = defineRouting({
  locales,
  defaultLocale,
});
