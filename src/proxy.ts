import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 匹配所有非静态资源路径：不带语言前缀的 URL（如 /tool/chatgpt）
  // 会被 next-intl 重定向到默认语言（/en/tool/chatgpt），而非 404。
  // 排除 api、_next、_vercel 及含“.”的静态文件（logos/*.png、sitemap.xml 等）。
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
