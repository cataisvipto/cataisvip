import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// 根域 / 无 locale 版本：明确 301 到 /en（英文为站点默认）。
// 静态 metadata route —— 不使用 layout.tsx 的 locale-aware <html>，
// 因此 Googlebot 对根域直接拿到干净的 301 响应 + 正确的 <link rel="canonical">，
// 避免落入 [locale]/page.tsx 的 RSC 流式空壳响应（2026-08-24 实测根域返回 text/x-component 577B）。
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://cataito.com/en',
    languages: {
      en: 'https://cataito.com/en',
      zh: 'https://cataito.com/zh',
      ja: 'https://cataito.com/ja',
      es: 'https://cataito.com/es',
      fr: 'https://cataito.com/fr',
      'x-default': 'https://cataito.com/en',
    },
  },
};

export default function RootPage() {
  redirect('/en');
}
