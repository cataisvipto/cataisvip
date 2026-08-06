import { MetadataRoute } from 'next';
import tools from '@/data/tools.json';
import blogPosts from '@/data/blogPosts.json';
import tutorials from '@/data/tutorials.json';
import skills from '@/data/skills.json';
import mcpServers from '@/data/mcp.json';
import { routing } from '@/i18n/routing';
import { CATEGORY_SLUGS } from '@/lib/categories';

const BASE_URL = 'https://cataito.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales;

  // Static pages（/tools /skills /mcp 为列表页，权重高于普通静态页）
  const staticPages = ['', '/tools', '/skills', '/mcp', '/submit', '/about', '/privacy', '/disclaimer', '/editorial-policy', '/blog', '/tutorials', '/ranking'].flatMap((path) =>
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

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages, ...tutorialPages, ...skillPages, ...mcpPages];
}
