import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import blogPosts from '@/data/blogPosts.json';
import BlogClient from './BlogClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const title = `${t('title')} - Cataito`;
  const description = t('subtitle');
  return {
    title,
    description,
    alternates: generateAlternates('/blog', locale),
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default function BlogPage() {
  return <BlogClient posts={blogPosts} />;
}
