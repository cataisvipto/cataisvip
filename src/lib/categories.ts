// 全站分类单一数据源（阶段二：11 类 → 16 类，2026-07-30）
// Header / Footer / CategoryFilter / sitemap / submit / category 页均从此导入，
// 禁止在组件内再硬编码分类列表。

export const CATEGORIES = [
  'Chat',
  'Foundation Models',
  'Agent',
  'Code',
  'Image',
  'Video',
  'Avatar',
  'Audio',
  'Music',
  'Writing',
  'Design',
  'Search',
  'Website Builder',
  'Automation',
  'API Platform',
  'Open Source',
] as const;

export type Category = (typeof CATEGORIES)[number];

// 多词分类（API Platform 等）不能用 toLowerCase 直接拼 URL，统一走 slug 化
export const categoryToSlug = (category: string) =>
  category.toLowerCase().replace(/\s+/g, '-');

export const slugToCategory = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => categoryToSlug(c) === slug);

export const CATEGORY_SLUGS = CATEGORIES.map(categoryToSlug);
