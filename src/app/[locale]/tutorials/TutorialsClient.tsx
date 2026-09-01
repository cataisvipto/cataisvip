'use client';

import { useState, useMemo } from 'react';
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
  logo?: string;
  logoDark?: string;
  author: string;
  publishedAt: string;
  difficulty: string;
  readTime: number;
  tags: string[];
  product: string;
}

interface TutorialsClientProps {
  tutorials: Tutorial[];
}

const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

// Product display config (public logos; plain <img> — next/image breaks under
// output:'export' on Cloudflare Pages because the /_next/image endpoint 404s).
const PRODUCTS: Record<string, { name: string; logo?: string; logoDark?: string }> = {
  codex: { name: 'Codex', logo: '/logos/tools/codex.svg', logoDark: '/logos/tools/codex-white.svg' },
  'claude-code': { name: 'Claude Code', logo: '/logos/tools/claude-code.png' },
  'hermes-agent': { name: 'Hermes Agent', logo: '/logos/tools/hermes-agent-light.png' },
  'deepseek-harness': { name: 'DeepSeek Harness', logo: '/logos/tools/deepseek-harness.png' },
};

// Resolve a real logo path for a product: per-tutorial field first, then config.
function getProductLogo(product: string, tut: Tutorial): string | undefined {
  if (tut.logo) return tut.logo;
  return PRODUCTS[product]?.logo;
}

export default function TutorialsClient({ tutorials }: TutorialsClientProps) {
  const locale = useLocale();
  const t = useTranslations('tutorials');
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  // Build product list from data, collecting a real logo per product.
  const products = useMemo(() => {
    const seen = new Set<string>();
    const list: { slug: string; name: string; logo?: string; count: number }[] = [];
    for (const tut of tutorials) {
      if (!seen.has(tut.product)) {
        seen.add(tut.product);
        const cfg = PRODUCTS[tut.product] || { name: tut.product };
        list.push({
          slug: tut.product,
          name: cfg.name,
          logo: getProductLogo(tut.product, tut),
          count: 0,
        });
      }
      const item = list.find((p) => p.slug === tut.product);
      if (item) item.count++;
    }
    return list;
  }, [tutorials]);

  const sorted = useMemo(() => {
    const filtered = activeProduct
      ? tutorials.filter((t) => t.product === activeProduct)
      : tutorials;
    return [...filtered].sort((a, b) =>
      (b.publishedAt || '').localeCompare(a.publishedAt || '')
    );
  }, [tutorials, activeProduct]);

  return (
    <>
      <Header searchQuery="" onSearchChange={() => {}} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
        <Breadcrumb items={[{ name: t('title') }]} locale={locale} />

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            {t('title')}
          </h1>
          <p className="mt-1.5 text-[var(--muted)] text-sm">{t('subtitle')}</p>
        </div>

        {/* Product filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveProduct(null)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeProduct === null
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--muted-border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('all')} ({tutorials.length})
          </button>
          {products.map((product) => (
            <button
              key={product.slug}
              onClick={() => setActiveProduct(product.slug)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeProduct === product.slug
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--muted-border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {product.logo && (
                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-white/80 flex items-center justify-center">
                  <img
                    src={product.logo}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
              <span>{product.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeProduct === product.slug
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--muted-bg)] text-[var(--muted)]'
              }`}>
                {product.count}
              </span>
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          /* Empty state */
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

                      {/* Product badge */}
                      {tutorial.product && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-4 h-4 rounded overflow-hidden bg-white/80 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={getProductLogo(tutorial.product, tutorial) || PRODUCTS[tutorial.product]?.logo || ''}
                              alt={PRODUCTS[tutorial.product]?.name || tutorial.product}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <span className="text-xs font-medium text-[var(--muted)]">
                            {PRODUCTS[tutorial.product]?.name || tutorial.product}
                          </span>
                        </div>
                      )}

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