import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import tools from '@/data/tools.json';
import { Tool } from '@/components/ToolCard';
import ToolDetailClient from './ToolDetailClient';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
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
