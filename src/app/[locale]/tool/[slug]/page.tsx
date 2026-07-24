import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import tools from '@/data/tools.json';
import { Tool } from '@/components/ToolCard';
import ToolDetailClient from './ToolDetailClient';
import { routing } from '@/i18n/routing';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const tool of tools) {
      params.push({ locale, slug: tool.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    return { title: 'Resource Not Found - Cataito' };
  }

  const description = (() => {
    switch (locale) {
      case 'zh': return tool.description;
      case 'ja': return tool.descriptionJa || tool.descriptionEn;
      case 'es': return tool.descriptionEs || tool.descriptionEn;
      case 'fr': return tool.descriptionFr || tool.descriptionEn;
      default: return tool.descriptionEn;
    }
  })();
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  const siteName: Record<string, string> = {
    zh: 'AI 生态门户',
    en: 'AI Ecosystem Portal',
    ja: 'AI エコシステムポータル',
    es: 'Portal de Ecosistema de IA',
    fr: 'Portail d\'Écosystème IA',
  };

  const localizedSiteName = siteName[locale] || siteName.en;

  return {
    title: `${displayName} - ${localizedSiteName}`,
    description: description,
    alternates: generateAlternates(`/tool/${slug}`),
    openGraph: {
      title: `${displayName} - Cataito`,
      description: description,
      images: [tool.logo],
    },
    twitter: {
      card: 'summary',
      title: displayName,
      description: description,
      images: [tool.logo],
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return <ToolDetailClient tool={tool as Tool} locale={locale} />;
}
