import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /api/ 内部 API、/cdn-cgi/ Cloudflare 伪页、/console /admin /internal 运维入口
      // 不进入搜索索引，避免浪费 Google 抓取预算并防止内部路径被意外收录
      disallow: ['/api/', '/cdn-cgi/', '/console/', '/admin/', '/internal/'],
    },
    sitemap: 'https://cataito.com/sitemap.xml',
  };
}
