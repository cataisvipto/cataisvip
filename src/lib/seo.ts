/**
 * SEO 工具函数 — 统一生成 hreflang + canonical 元数据
 */

import { locales } from '@/i18n/routing';

export const BASE_URL = 'https://cataito.com';
// 语言列表统一来自 routing.ts（单一 source of truth），新增语言只改那里
export const LOCALES = locales;
export type Locale = (typeof LOCALES)[number];

/**
 * 为指定路径生成 hreflang + canonical alternates 对象
 * @param path 以 / 开头的路径，如 /tool/chatgpt 或 /blog
 * @param currentLocale 当前页面语言（必填）；canonical 自引用到该语言版本
 *        （多语言站点最佳实践：每个语言页 canonical 指向自身，避免被 /en 合并而不被收录）
 *        设为必填是为了让新增页面若漏传 locale 时 `next build` 直接 TypeScript 报错，防止 canonical 退化为全部指向 /en。
 */
export function generateAlternates(path: string, currentLocale: string) {
  // 归一化：首页 path='/' 会拼出 /en/（尾斜杠），与实际 URL /en 不一致，
  // 导致 Lighthouse canonical 审计失败（Points to another hreflang location），统一去掉尾斜杠
  const normalizedPath = path === '/' ? '' : path.replace(/\/+$/, '');
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${normalizedPath}`;
  }
  // x-default 指向英文版，供未匹配语言的用户回退
  languages['x-default'] = `${BASE_URL}/en${normalizedPath}`;
  const canonicalLocale = (LOCALES as readonly string[]).includes(currentLocale)
    ? currentLocale
    : 'en';
  return {
    canonical: `${BASE_URL}/${canonicalLocale}${normalizedPath}`,
    languages,
  };
}

/**
 * 工具详情页本地化 SEO 标题（含长尾关键词：Best/年份/功能/价格/评测）
 * 加 "Best" + 年份前缀，提升搜索 SERP 点击率
 */
export function getToolSeoTitle(
  locale: string,
  name: string,
  categoryLabel: string
): string {
  const map: Record<string, string> = {
    en: `Best ${name} ${categoryLabel} AI Tool in 2026 — Features, Pricing & Review | Cataito`,
    zh: `2026年最佳${name}：${categoryLabel} AI 工具 — 功能、价格与评测 | Cataito`,
    ja: `2026年ベスト${name}：${categoryLabel} AIツール — 機能・料金・レビュー | Cataito`,
    es: `Mejor ${name}: herramienta de IA de ${categoryLabel} en 2026 — funciones, precios y opiniones | Cataito`,
    fr: `Meilleur ${name} : outil IA ${categoryLabel} en 2026 — fonctionnalités, tarifs et avis | Cataito`,
  };
  return map[locale] || map.en;
}

/**
 * 工具详情页本地化 Meta Description（150-160 字符，含 CTA）
 * 比裸用 description 更吸引点击
 */
export function getToolMetaDescription(
  locale: string,
  name: string,
  categoryLabel: string,
  rawDescription: string
): string {
  // 截断 rawDescription 到合适长度，避免溢出
  const maxLen = 80;
  const truncated = rawDescription.slice(0, maxLen).replace(/[.。!！?？…]+$/, '');

  const map: Record<string, string> = {
    en: `${name} is a ${categoryLabel} AI tool. ${truncated}. Compare features, pricing, pros/cons and use cases. Find the best AI tool for your needs.`,
    zh: `${name} 是一款 ${categoryLabel} AI 工具。${truncated}。对比功能、价格、优缺点和使用案例，找到最适合你的 AI 工具。`,
    ja: `${name}は${categoryLabel} AIツールです。${truncated}。機能・料金・メリット・デメリットを比較し、最適なAIツールを見つけましょう。`,
    es: `${name} es una herramienta de IA de ${categoryLabel}. ${truncated}. Compare funciones, precios, pros/contra y casos de uso. Encuentre la mejor herramienta de IA.`,
    fr: `${name} est un outil IA ${categoryLabel}. ${truncated}. Comparez fonctionnalités, tarifs, avantages/inconvénients et cas d'utilisation. Trouvez le meilleur outil IA.`,
  };
  return map[locale] || map.en;
}

/**
 * 分类聚合页本地化 SEO（标题 + 描述，含年份与数量长尾词）
 */
export function getCategorySeo(
  locale: string,
  categoryLabel: string,
  count: number
): { title: string; description: string } {
  const map: Record<string, { title: string; description: string }> = {
    en: {
      title: `Best ${categoryLabel} AI Tools in 2026 (${count} Tools) | Cataito`,
      description: `Discover and compare the top ${count} ${categoryLabel} AI tools. Explore features, pricing and reviews to find the best ${categoryLabel} AI tool for your needs.`,
    },
    zh: {
      title: `2026 年最佳 ${categoryLabel} AI 工具（共 ${count} 款）| Cataito`,
      description: `发现并对比 ${count} 款顶级 ${categoryLabel} AI 工具，查看功能、价格与评测，找到最适合你的 ${categoryLabel} AI 工具。`,
    },
    ja: {
      title: `2026年ベスト${categoryLabel} AIツール（${count}選）| Cataito`,
      description: `トップ${count}の${categoryLabel} AIツールを比較。機能・料金・レビューを確認して、最適な${categoryLabel} AIツールを見つけましょう。`,
    },
    es: {
      title: `Mejores herramientas de IA de ${categoryLabel} en 2026 (${count}) | Cataito`,
      description: `Descubre y compara las ${count} mejores herramientas de IA de ${categoryLabel}. Explora funciones, precios y opiniones para encontrar la ideal.`,
    },
    fr: {
      title: `Meilleurs outils IA ${categoryLabel} en 2026 (${count}) | Cataito`,
      description: `Découvrez et comparez les ${count} meilleurs outils IA ${categoryLabel}. Explorez fonctionnalités, tarifs et avis pour trouver l'outil idéal.`,
    },
  };
  return map[locale] || map.en;
}

/**
 * 首页本地化 SEO（标题 + 描述 + 关键词）
 */
export function getHomeSeo(locale: string): {
  title: string;
  description: string;
  keywords: string;
} {
  const map: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Cataito - AI Ecosystem Portal | Your Gateway to AI',
      description:
        'Your gateway to the global AI ecosystem. Discover AI models, agents, tools, and resources from around the world.',
    },
    zh: {
      title: 'Cataito - AI 生态门户 | 探索全球 AI 工具与模型',
      description:
        '通往全球 AI 生态的门户。发现来自世界各地的 AI 模型、智能体、工具与资源。',
    },
    ja: {
      title: 'Cataito - AIエコシステムポータル | AIへの入口',
      description:
        '世界のAIエコシステムへの入口。世界中のAIモデル、エージェント、ツール、リソースを発見しましょう。',
    },
    es: {
      title: 'Cataito - Portal del Ecosistema de IA | Tu puerta a la IA',
      description:
        'Tu puerta al ecosistema global de IA. Descubre modelos, agentes, herramientas y recursos de IA de todo el mundo.',
    },
    fr: {
      title: "Cataito - Portail de l'Écosystème IA | Votre porte vers l'IA",
      description:
        "Votre porte vers l'écosystème mondial de l'IA. Découvrez modèles, agents, outils et ressources d'IA du monde entier.",
    },
  };
  const keywords =
    'AI portal, AI ecosystem, AI tools, AI models, AI agents, ChatGPT, Claude, Gemini, DeepSeek, Grok, AI resources, artificial intelligence';
  return { ...(map[locale] || map.en), keywords };
}

/**
 * 生成 WebSite JSON-LD（首页用）
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cataito',
    url: BASE_URL,
    description: 'Your gateway to the global AI ecosystem. Discover AI models, agents, tools, and resources from around the world.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/en?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 生成 Article JSON-LD（博客详情页用）
 */
export function generateArticleJsonLd(params: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: params.image,
    author: {
      '@type': 'Organization',
      name: params.author || 'Cataito Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cataito',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: params.datePublished,
    url: params.url,
  };
}

/**
 * 生成 BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/**
 * 生成 SoftwareApplication JSON-LD（工具详情页用 — Google 商品富摘要）
 * 含 operatingSystem、author、publisher、offers 等完整字段
 */
export function generateSoftwareAppJsonLd(params: {
  name: string;
  description: string;
  image: string;
  url: string;
  developer: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: { price: string; priceCurrency: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: params.name,
    description: params.description,
    image: params.image,
    url: params.url,
    applicationCategory: params.applicationCategory,
    operatingSystem: params.operatingSystem,
    author: { '@type': 'Organization', name: params.developer || 'Cataito' },
    publisher: { '@type': 'Organization', name: 'Cataito', url: 'https://cataito.com' },
    offers: { '@type': 'Offer', ...params.offers, url: params.url },
  };
}

/**
 * 生成 HowTo JSON-LD（教程详情页用 — Google 教程富摘要）
 * 从 Markdown 内容中解析 ### 步骤生成 HowToStep 数组
 */
export function generateHowToJsonLd(params: {
  title: string;
  description: string;
  content: string;
  readTime?: number;
  url: string;
}) {
  const steps = params.content
    .split('\n')
    .filter((line) => line.trim().startsWith('### '))
    .map((line, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: line.replace(/^###\s+/, '').trim(),
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.title,
    description: params.description,
    ...(params.readTime
      ? { totalTime: `PT${Math.max(1, params.readTime)}M` }
      : {}),
    ...(steps.length > 0 ? { step: steps } : {}),
    url: params.url,
  };
}
