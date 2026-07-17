'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import posts from '@/data/blogPosts.json';

interface BlogPost {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  publishedAt: string;
  category: string;
  coverImage: string;
  readTime: number;
}

// Localize a multilingual field, falling back to English so the section follows the site language
const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

export default function BlogHighlights() {
  const t = useTranslations('blog');
  const locale = useLocale();

  // Show the 3 most recent posts, newest first
  const latest = [...(posts as BlogPost[])]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">{t('latestNews')}</h2>
          <p className="mt-2 text-[var(--muted)] text-sm sm:text-base">{t('latestNewsSubtitle')}</p>
        </div>
        <Link
          href="/blog"
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {latest.map((post) => {
          const title = getLocalized(post.title, locale);
          const excerpt = getLocalized(post.excerpt, locale);

          return (
            <article
              key={post.slug}
              className="group bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2 text-sm text-[var(--muted)]">
                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-medium capitalize">
                    {t(`categories.${post.category}` as any)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime} {t('readTime')}
                  </span>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition">
                    {title}
                  </h3>
                </Link>
                <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2">{excerpt}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile view-all */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
