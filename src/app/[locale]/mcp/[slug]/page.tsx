import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import McpDetailClient from './McpDetailClient';
import mcpServers from '@/data/mcp.json';
import mcpDetails from '@/data/mcpDetails.json';
import tutorials from '@/data/tutorials.json';
import { generateAlternates } from '@/lib/seo';
import { routing } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const entry of mcpServers) {
      params.push({ locale, slug: entry.slug });
    }
  }
  return params;
}

/** Pick the description matching the locale (falls back to English) */
function getLocalizedDescription(entry: (typeof mcpServers)[number], locale: string): string {
  switch (locale) {
    case 'zh': return entry.description;
    case 'ja': return entry.descriptionJa || entry.descriptionEn;
    case 'es': return entry.descriptionEs || entry.descriptionEn;
    case 'fr': return entry.descriptionFr || entry.descriptionEn;
    default: return entry.descriptionEn;
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'mcp' });
  const entry = mcpServers.find((s) => s.slug === slug);
  if (!entry) return { title: t('notFound') };

  const name = locale === 'zh' && entry.nameZh ? entry.nameZh : entry.name;
  return {
      title: `${name} - ${t('title')}`,
      description: getLocalizedDescription(entry, locale),
      alternates: generateAlternates(`/mcp/${slug}`, locale),
      openGraph: {
        title: `${name} - Cataito MCP`,
        description: getLocalizedDescription(entry, locale),
        images: [entry.logo],
      },
      twitter: {
        card: 'summary',
        title: name,
        description: getLocalizedDescription(entry, locale),
        images: [entry.logo],
      },
    };
}

/** 星数单一数据源：直接读 mcp.json 的 stars（由 refresh-stars 定时/手动刷新），与列表卡片始终一致 */
export default async function McpDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = mcpServers.find((s) => s.slug === slug);
  if (!entry) notFound();

  // 关联教程（related.mcp 显式声明），只传渲染需要的字段
  const relatedTutorials = tutorials
    .filter((tut: any) => (tut.related?.mcp || []).includes(slug))
    .map((tut: any) => ({
          slug: tut.slug,
          title: tut.title,
          excerpt: tut.excerpt,
          difficulty: tut.difficulty,
          readTime: tut.readTime,
          coverImage: tut.coverImage,
        }));

  return (
      <McpDetailClient
        server={entry}
        locale={locale}
        details={(mcpDetails as Record<string, any>)[slug]}
        relatedTutorials={relatedTutorials}
      />
    );
}
