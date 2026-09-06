import { MetadataRoute } from 'next';
import { tools } from '@/data/aggregated';
import blogPosts from '@/data/blogPosts.json';
import tutorials from '@/data/tutorials.json';
import { skills } from '@/data/aggregated';
import { mcp as mcpServers } from '@/data/aggregated';
import { routing, TEMP_NOINDEX_LOCALES } from '@/i18n/routing';
import { allProjects } from '@/lib/ranking-history';
import { CATEGORY_SLUGS } from '@/lib/categories';

// output: 'export' 要求路由显式声明为纯静态。
export const dynamic = 'force-static';

const BASE_URL = 'https://cataito.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // noindex 语言来自 routing.ts 的 TEMP_NOINDEX_LOCALES（单一 source of truth，
  // 与 [locale]/layout.tsx 的 robots noindex、src/lib/seo.ts 的 hreflang 过滤共用）：
  // 对 ja/es/fr 全站 noindex（195/195 工具描述未本地化），sitemap 一并剔除，
  // 避免 Google 收到矛盾信号。
  const INDEXED_LOCALES = routing.locales.filter((l) => !TEMP_NOINDEX_LOCALES.has(l));
  const locales = INDEXED_LOCALES;

  // Static pages（/tools /skills /mcp 为列表页，权重高于普通静态页）
  const staticPages = ['', '/tools', '/skills', '/mcp', '/submit', '/about', '/privacy', '/disclaimer', '/editorial-policy', '/blog', '/tutorials', '/ranking', '/report'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : path === '/tools' || path === '/skills' || path === '/mcp' ? 0.9 : 0.5,
    }))
  );

  // Category pages
  const categoryPages = CATEGORY_SLUGS.flatMap((cat) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  // Tool detail pages
  const toolPages = tools.flatMap((tool) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/tool/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );

  // Blog pages
  const blogPages = blogPosts.flatMap((post: any) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.publishedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Tutorial pages
  const tutorialPages = tutorials.flatMap((tutorial: any) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/tutorials/${tutorial.slug}`,
      lastModified: tutorial.publishedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Skill detail pages
  const skillPages = skills.flatMap((skill: any) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/skills/${skill.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // MCP server detail pages
  const mcpPages = mcpServers.flatMap((entry: any) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/mcp/${entry.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // P4.1 排行项目详情页（en-only 数据页，每日刷新的独家数据）
  const projectPages = [...allProjects().keys()].map((fullName) => ({
    url: `${BASE_URL}/project/${fullName}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages, ...tutorialPages, ...skillPages, ...mcpPages, ...projectPages];
}
