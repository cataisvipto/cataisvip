import { MetadataRoute } from 'next';
import tools from '@/data/tools.json';

const BASE_URL = 'https://catai.cc.cd';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'zh'];

  // Static pages
  const staticPages = ['', '/submit', '/privacy', '/disclaimer'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.5,
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

  return [...staticPages, ...toolPages];
}
