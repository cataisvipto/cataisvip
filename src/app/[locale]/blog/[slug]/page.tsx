import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import blogPosts from '@/data/blogPosts.json';
import BlogDetailClient from './BlogDetailClient';
import { routing } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const post of blogPosts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: 'Article Not Found - CATAI' };
  }

  const title = (post.title as Record<string, string>)[locale] || post.title.en;
  const excerpt = (post.excerpt as Record<string, string>)[locale] || post.excerpt.en;

  return {
    title: `${title} - CATAI Blog`,
    description: excerpt,
    openGraph: {
      title: `${title} - CATAI`,
      description: excerpt,
      images: [post.coverImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} locale={locale} />;
}
