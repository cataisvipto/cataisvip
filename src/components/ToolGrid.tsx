'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo, type ReactNode } from 'react';
import ToolCard, { Tool } from './ToolCard';
import CategoryFilter from './CategoryFilter';
import { Search } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

interface ToolGridProps {
  tools: Tool[];
  locale: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount?: number;
  curated?: boolean;
  curatedTools?: Tool[];
  header?: ReactNode;
}

export default function ToolGrid({ tools, locale, searchQuery, totalCount, curated = false, curatedTools, header }: ToolGridProps) {
  const t = useTranslations('common');
  const tCategories = useTranslations('categories');
  const [activeCategory, setActiveCategory] = useState('all');

  const hasSearch = searchQuery.trim().length > 0;

  const filteredTools = useMemo(() => {
    let filtered = tools;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((tool) => tool.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          (tool.nameZh && tool.nameZh.toLowerCase().includes(query)) ||
          tool.description.toLowerCase().includes(query) ||
          tool.descriptionEn.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [tools, activeCategory, searchQuery]);

  const displayTools = curated && !hasSearch ? (curatedTools ?? filteredTools) : filteredTools;

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {header && <div className="mb-10">{header}</div>}

      {!curated && (
        <div className="mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      )}

      {(!curated || hasSearch) && (
        <div className="mb-6 text-sm text-[var(--muted)]">
          {t('resourceCount', { count: displayTools.length })}
          {totalCount && totalCount !== displayTools.length
            ? ` / ${t('resourceTotal', { count: totalCount })}`
            : ''}
          {activeCategory !== 'all' && ` · ${tCategories(activeCategory as any)}`}
          {searchQuery && ` · "${searchQuery}"`}
        </div>
      )}

      {displayTools.length > 0 ? (
              <ScrollReveal><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} locale={locale} hideFeaturedBadge={curated && !hasSearch} />
                ))}
              </div></ScrollReveal>
      ) : (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-[var(--muted-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-[var(--muted)]" />
          </div>
          <p className="text-[var(--muted)]">{t('noResults')}</p>
        </div>
      )}
    </section>
  );
}