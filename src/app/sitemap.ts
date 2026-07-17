import { MetadataRoute } from 'next';
import tools from '@/data/tools.json';
import blogPosts from '@/data/blogPosts.json';

const BASE_URL = 'https://catai.cc.cd';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'zh', 'ja', 'es', 'fr'];

  // Static pages
  const staticPages = ['', '/submit', '/privacy', '/disclaimer', '/blog'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.5,
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

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
