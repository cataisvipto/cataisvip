import { MetadataRoute } from 'next';
import tools from '@/data/tools.json';
import blogPosts from '@/data/blogPosts.json';
import skills from '@/data/skills.json';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://cataito.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales;

  // Static pages（/tools /skills 为列表页，权重高于普通静态页）
  const staticPages = ['', '/tools', '/skills', '/submit', '/about', '/privacy', '/disclaimer', '/editorial-policy', '/blog', '/ranking'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : path === '/tools' || path === '/skills' ? 0.9 : 0.5,
    }))
  );

  // Category pages
  const categories = ['chat', 'image', 'code', 'writing', 'video', 'audio', 'search', 'platform', 'developer', 'agent', 'design'];
  const categoryPages = categories.flatMap((cat) =>
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

  // Skill detail pages
  const skillPages = skills.flatMap((skill: any) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/skills/${skill.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages, ...skillPages];
}
