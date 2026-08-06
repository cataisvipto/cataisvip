'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCover from '@/components/BlogCover';
import MarkdownContent from '@/components/MarkdownContent';
import { Clock, User, Calendar, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Tutorial } from '../TutorialsClient';
import { PlatformProvider } from '@/components/PlatformContext';
import PlatformSelector from '@/components/PlatformSelector';

interface TutorialDetailClientProps {
  tutorial: Tutorial;
  locale: string;
  howToJsonLd: Record<string, unknown>;
  allTutorials: Tutorial[];
}

const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

export default function TutorialDetailClient({
  tutorial,
  locale,
  howToJsonLd,
  allTutorials,
}: TutorialDetailClientProps) {
  const t = useTranslations('tutorials');
  const [searchQuery, setSearchQuery] = useState('');

  const title = getLocalized(tutorial.title, locale);
  const excerpt = getLocalized(tutorial.excerpt, locale);
  const content = getLocalized(tutorial.content, locale);

  // 相关教程（同标签，排除自身）
  const related = allTutorials
    .filter((item) => item.slug !== tutorial.slug)
    .filter((item) => (item.tags || []).some((tag) => (tutorial.tags || []).includes(tag)))
    .slice(0, 3);

  return (
    <PlatformProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: t('title'), href: '/tutorials' },
              { name: title },
            ]}
            locale={locale}
          />

          {/* Cover Image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <BlogCover
              src={tutorial.coverImage}
              alt={title}
              width={1200}
              height={630}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-[var(--primary)]">
                {t(`difficulties.${tutorial.difficulty}`)}
              </span>
              <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                <Clock className="w-4 h-4" />
                {tutorial.readTime} {t('readTime')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {tutorial.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {tutorial.publishedAt}
              </span>
            </div>
          </header>

          {/* Platform selector — 文首系统选择 */}
          <PlatformSelector />

          {/* Content (图文渲染) */}
          <div className="max-w-none">
            <MarkdownContent content={content} />
          </div>

          {/* Tags */}
          {tutorial.tags && tutorial.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[var(--muted-border)]">
              {tutorial.tags.map((tag) => (
                <span key={tag} className="text-xs text-[var(--muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Back to list */}
          <div className="mt-10">
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--muted-border)] text-[var(--foreground)] font-medium rounded-full hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToList')}
            </Link>
          </div>
        </article>

        {/* Related tutorials */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">{t('relatedTutorials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((item) => {
                const itemTitle = getLocalized(item.title, locale);
                const itemExcerpt = getLocalized(item.excerpt, locale);
                return (
                  <article
                    key={item.slug}
                    className="group bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <Link href={`/tutorials/${item.slug}`} className="block aspect-video overflow-hidden">
                      <BlogCover
                        src={item.coverImage}
                        alt={itemTitle}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3 text-sm text-[var(--muted)]">
                        <span className="text-xs font-medium text-[var(--primary)]">
                          {t(`difficulties.${item.difficulty}`)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.readTime} {t('readTime')}
                        </span>
                      </div>
                      <Link href={`/tutorials/${item.slug}`} className="group/title">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover/title:text-[var(--primary)] transition">
                          {itemTitle}
                        </h3>
                      </Link>
                      <p className="text-[var(--muted)] text-sm leading-relaxed mb-3 line-clamp-2 hover:text-[var(--foreground)] transition">
                        {itemExcerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)]">
                        {t('readTutorial')}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </PlatformProvider>
  );
}
