import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 显式锁定 Turbopack 根目录为本项目，避免因上级目录存在 package-lock.json
  // 被误判为工作区根导致 next dev 路由 404
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // 阶段二分类扩容：Platform/Developer 两个旧分类撤销，旧 URL 永久重定向到接替分类
  async redirects() {
    return [
      {
        source: '/:locale(zh|en|ja|es|fr)/category/platform',
        destination: '/:locale/category/open-source',
        permanent: true,
      },
      {
        source: '/:locale(zh|en|ja|es|fr)/category/developer',
        destination: '/:locale/category/api-platform',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
