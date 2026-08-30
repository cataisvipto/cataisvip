import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 纯静态导出配置：用于 Cloudflare Pages 部署。
// 所有 301 重定向和响应头通过 public/_redirects + public/_headers 文件实现
// （Cloudflare Pages 原生功能，替代 next.config.ts 的 redirects() / headers()）。
const nextConfig: NextConfig = {
  // 显式锁定 Turbopack 根目录为本项目，避免因上级目录存在 package-lock.json
  // 被误判为工作区根导致 next dev 路由 404
  turbopack: {
    root: __dirname,
  },

  // 纯静态导出（SSG）。所有 1706 页面在构建时预生成。
  // Cloudflare Pages 免费档无 Worker 大小限制、无限带宽。
  output: 'export',
  trailingSlash: false,
};

export default withNextIntl(nextConfig);
