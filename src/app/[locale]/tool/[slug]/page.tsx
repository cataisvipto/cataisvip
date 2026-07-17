import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    return { title: 'Resource Not Found - CATAI' };
  }

  const description = locale === 'zh' ? tool.description : tool.descriptionEn;
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  const siteName = locale === 'zh' ? 'AI 生态门户' : 'AI Ecosystem Portal';

  return {
    title: `${displayName} - ${siteName}`,
    description: description,
    alternates: generateAlternates(`/tool/${slug}`),
    openGraph: {
      title: `${displayName} - CATAI`,
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
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return <ToolDetailClient tool={tool as Tool} locale={locale} />;
}
