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
  // 安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: http:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; frame-src 'none'; object-src 'none'; base-uri 'self'",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  trailingSlash: false,

  // 阶段二分类扩容 + 尾斜杠修复
  async redirects() {
    return [
      // 尾斜杠 308 循环修复（v6.84）：
      // 此前 next-intl 插件导致带尾斜杠 URL（如 /en/ /en/tools/）
      // 重定向回自身，Googlebot 记为 Redirect Error 打回。
      // 在 next.config.ts 显式声明 trailingSlash: false 并添加以下 rewrite 规则，
      // 让带尾斜杠 URL 在 middleware 层被无条件重写到无尾斜杠版本，彻底避免循环。
      {
        // 根域尾斜杠（/ → / 已处理；但防万一）
        source: '/',
        destination: '/en',
        permanent: true,
        // 注意：这个规则与 src/app/page.tsx 的 redirect('/en') 配合，
        // 后者处理无尾斜杠的根域，前者兜底处理可能带尾斜杠的 /
      },
      // 带语言前缀的尾斜杠页面（/en/ /zh/ /ja/ 等）
      {
        source: '/:locale(zh|en|ja|es|fr)/',
        destination: '/:locale',
        permanent: true,
      },
      // 已知带尾斜杠的 Google 收录页面（重定向循环）硬编码修复
      // 不用 wildcard 是因为 Next.js redirect 无法在 destination 中 strip
      // 被 path* 捕获的尾斜杠，逐个声明是最可靠的方式。
      // 若后续新增同类问题页面，在此数组追加。
      ...(['', '/tools', '/skills', '/mcp', '/blog', '/tutorials', '/ranking', '/submit', '/about'].map(
        (p) => ({
          source: '/:locale(zh|en|ja|es|fr)' + p + '/',
          destination: '/:locale' + p,
          permanent: true,
        })
      )),
      // 分类扩容重定向（阶段二）
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
