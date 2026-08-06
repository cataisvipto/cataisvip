'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import ScrollReveal from '@/components/ScrollReveal';
import BlogCover from '@/components/BlogCover';
import { Clock, GraduationCap, BookOpen } from 'lucide-react';

export interface Tutorial {
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

interface TutorialsClientProps {
  tutorials: Tutorial[];
}

const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

export default function TutorialsClient({ tutorials }: TutorialsClientProps) {
  const locale = useLocale();
  const t = useTranslations('tutorials');

  const sorted = [...tutorials].sort((a, b) =>
    (b.publishedAt || '').localeCompare(a.publishedAt || '')
  );

  return (
    <>
      <Header searchQuery="" onSearchChange={() => {}} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
        <Breadcrumb items={[{ name: t('title') }]} locale={locale} />

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            {t('title')}
          </h1>
          <p className="mt-1.5 text-[var(--muted)] text-sm">{t('subtitle')}</p>
        </div>

        {sorted.length === 0 ? (
          /* Empty state — 教程暂未收录 */
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] py-20 px-6 text-center">
            <div className="w-14 h-14 bg-[var(--muted-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-[var(--muted)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{t('emptyTitle')}</h2>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto">{t('emptyDesc')}</p>
          </div>
        ) : (
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sorted.map((tutorial) => {
                const title = getLocalized(tutorial.title, locale);
                const excerpt = getLocalized(tutorial.excerpt, locale);
                return (
                  <article
                    key={tutorial.slug}
                    className="group bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Cover */}
                    <Link href={`/tutorials/${tutorial.slug}`} className="block aspect-video overflow-hidden">
                      <BlogCover
                        src={tutorial.coverImage}
                        alt={title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta: difficulty + read time */}
                      <div className="flex items-center gap-3 mb-3 text-sm text-[var(--muted)]">
                        <span className="text-xs font-medium text-[var(--primary)]">
                          {t(`difficulties.${tutorial.difficulty}`)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {tutorial.readTime} {t('readTime')}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/tutorials/${tutorial.slug}`} className="group/title">
                        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 line-clamp-2 group-hover/title:text-[var(--primary)] transition">
                          {title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-[var(--muted)] text-sm leading-relaxed mb-4 line-clamp-3 hover:text-[var(--foreground)] transition">
                        {excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--muted-border)]">
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
          </ScrollReveal>
        )}
      </main>
      <Footer />
    </>
  );
}
