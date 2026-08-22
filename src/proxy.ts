import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing, locales, defaultLocale } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * 无语言前缀 URL（如 /tool/chatgpt、/skills/xxx）:
 * next-intl 默认 307 临时重定向 → Google 标记为"网页会自动重定向"且不传递权重。
 * 这里先拦截并升级为 301 永久重定向（仅当目标页存在时），SEO 权重正确合并。
 */
function isStaticOrSpecial(pathname: string): boolean {
  // middleware matcher 已排除 api/_next/_vercel/含点静态文件，此处兜底防御
  return /^\/(api|_next|_vercel)\b/.test(pathname) || /\/\..*/.test(pathname);
}

export default function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  if (!isStaticOrSpecial(pathname)) {
    // 无语言前缀（含根路径 "/"）：301 永久重定向到默认语言
    const hasLocalePrefix = locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
    if (!hasLocalePrefix) {
      const destPath = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
      // 若目标不存在也会 404，但 301 是为合并权重；存疑路径由 next-intl 处理
      return NextResponse.redirect(`${origin}${destPath}${search}`, 301);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // 匹配所有非静态资源路径：不带语言前缀的 URL（如 /tool/chatgpt）
  // 会被 301 重定向到默认语言（/en/tool/chatgpt），而非 404。
  // 排除 api、_next、_vercel 及含“.”的静态文件（logos/*.png、sitemap.xml 等）。
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
