/**
 * SEO 工具函数 — 统一生成 hreflang + canonical 元数据
 */

export const BASE_URL = 'https://catai.cc.cd';
export const LOCALES = ['en', 'zh', 'ja', 'es', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * 为指定路径生成 hreflang + canonical alternates 对象
 * @param path 以 / 开头的路径，如 /tool/chatgpt 或 /blog
 */
export function generateAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  return {
    canonical: `${BASE_URL}/en${path}`,
    languages,
  };
}

/**
 * 生成 WebSite JSON-LD（首页用）
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CATAI',
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
      name: params.author || 'CATAI Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CATAI',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
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
