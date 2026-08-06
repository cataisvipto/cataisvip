'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Clock, ArrowRight, GraduationCap } from 'lucide-react';
import BlogCover from '@/components/BlogCover';
import tutorials from '@/data/tutorials.json';

interface TutorialItem {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  coverImage: string;
  author: string;
  publishedAt: string;
  difficulty: string;
  readTime: number;
  tags: string[];
}

const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

export default function TutorialHighlights() {
  const t = useTranslations('tutorials');
  const locale = useLocale();

  const latest = [...(tutorials as TutorialItem[])]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            {t('highlightsTitle')}
          </h2>
          <p className="mt-1.5 text-[var(--muted)] text-sm sm:text-base">{t('highlightsSubtitle')}</p>
        </div>
        <Link
          href="/tutorials"
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {latest.map((tutorial) => {
          const title = getLocalized(tutorial.title, locale);
          const excerpt = getLocalized(tutorial.excerpt, locale);

          return (
            <article
              key={tutorial.slug}
              className="group bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <Link href={`/tutorials/${tutorial.slug}`} className="block aspect-video overflow-hidden">
                <BlogCover
                  src={tutorial.coverImage}
                  alt={title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2 text-sm text-[var(--muted)]">
                  <span className="text-xs font-medium text-[var(--primary)]">
                    {t(`difficulties.${tutorial.difficulty}`)}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    {tutorial.readTime} {t('readTime')}
                  </span>
                </div>
                <Link href={`/tutorials/${tutorial.slug}`} className="group/title">
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover/title:text-[var(--primary)] transition">
                    {title}
                  </h3>
                </Link>
                <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2">{excerpt}</p>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--muted-border)]">
                  <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                    <GraduationCap className="w-4 h-4" />
                    {tutorial.author}
                  </span>
                  <Link
                    href={`/tutorials/${tutorial.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
                  >
                    {t('readTutorial')}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}