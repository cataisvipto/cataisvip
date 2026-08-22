import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import blogPosts from '@/data/blogPosts.json';
import { routing } from '@/i18n/routing';
import { generateAlternates, generateArticleJsonLd, BASE_URL } from '@/lib/seo';
import BlogDetailClient from './BlogDetailClient';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
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
    return { title: 'Article Not Found - Cataito' };
  }

  const title = (post.title as Record<string, string>)[locale] || post.title.en;
  const excerpt = (post.excerpt as Record<string, string>)[locale] || post.excerpt.en;
  const localeCover = `/blog/covers/${slug}.png` || `/blog/covers/${slug}-${locale}.svg`;

  // 自定义 SEO（优先），回退到默认标题 + excerpt
  const seo = post.seo as { title?: Record<string, string>; description?: Record<string, string> } | undefined;
  const seoTitle = seo?.title?.[locale] || seo?.title?.en || `${title} - Cataito Blog`;
  const seoDesc = seo?.description?.[locale] || seo?.description?.en || excerpt;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: generateAlternates(`/blog/${slug}`, locale),
    openGraph: {
      title: `${title} - Cataito`,
      description: seoDesc,
      images: [localeCover],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: seoDesc,
      images: [localeCover],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const title = (post.title as Record<string, string>)[locale] || post.title.en;
  const excerpt = (post.excerpt as Record<string, string>)[locale] || post.excerpt.en;
  const articleJsonLd = generateArticleJsonLd({
    title,
    description: excerpt,
    image: post.coverImage,
    author: post.author,
    datePublished: post.publishedAt,
    url: `${BASE_URL}/${locale}/blog/${slug}`,
  });

  const localeCover = `/blog/covers/${slug}.png` || `/blog/covers/${slug}-${locale}.svg`;

  return <BlogDetailClient post={post} locale={locale} articleJsonLd={articleJsonLd} coverImage={localeCover} />;
}