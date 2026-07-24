/**
 * SEO 工具函数 — 统一生成 hreflang + canonical 元数据
 */

export const BASE_URL = 'https://cataito.com';
export const LOCALES = ['en', 'zh', 'ja', 'es', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * 为指定路径生成 hreflang + canonical alternates 对象
 * @param path 以 / 开头的路径，如 /tool/chatgpt 或 /blog
 * @param currentLocale 当前页面语言（必填）；canonical 自引用到该语言版本
 *        （多语言站点最佳实践：每个语言页 canonical 指向自身，避免被 /en 合并而不被收录）
 *        设为必填是为了让新增页面若漏传 locale 时 `next build` 直接 TypeScript 报错，防止 canonical 退化为全部指向 /en。
 */
export function generateAlternates(path: string, currentLocale: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  // x-default 指向英文版，供未匹配语言的用户回退
  languages['x-default'] = `${BASE_URL}/en${path}`;
  const canonicalLocale = (LOCALES as readonly string[]).includes(currentLocale)
    ? currentLocale
    : 'en';
  return {
    canonical: `${BASE_URL}/${canonicalLocale}${path}`,
    languages,
  };
}

/**
 * 工具详情页本地化 SEO 标题（含长尾关键词：功能/价格/评测）
 */
export function getToolSeoTitle(
  locale: string,
  name: string,
  categoryLabel: string
): string {
  const map: Record<string, string> = {
    en: `${name}: ${categoryLabel} AI Tool — Features, Pricing & Review | Cataito`,
    zh: `${name}：${categoryLabel} AI 工具 — 功能、价格与评测 | Cataito`,
    ja: `${name}：${categoryLabel} AIツール — 機能・料金・レビュー | Cataito`,
    es: `${name}: herramienta de IA de ${categoryLabel} — funciones, precios y opiniones | Cataito`,
    fr: `${name} : outil IA ${categoryLabel} — fonctionnalités, tarifs et avis | Cataito`,
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
