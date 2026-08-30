import { MetadataRoute } from 'next';

// output: 'export' 要求路由显式声明为纯静态，否则构建会报错。
// 详见 https://nextjs.org/docs/advanced-features/static-html-export
export const dynamic = 'force-static';

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
