'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo, type ReactNode } from 'react';
import ToolCard, { Tool } from './ToolCard';
import CategoryFilter from './CategoryFilter';
import { Search } from 'lucide-react';

interface ToolGridProps {
  tools: Tool[];
  locale: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount?: number;
  /** 首页橱窗模式：隐藏分类筛选器与计数，默认只展示精选集；搜索时回退到全量检索 */
  curated?: boolean;
  /** curated 模式下无搜索时默认展示的精选工具 */
  curatedTools?: Tool[];
  /** 可选的区块标题（渲染在网格上方，与网格紧密相连） */
  header?: ReactNode;
}

export default function ToolGrid({ tools, locale, searchQuery, totalCount, curated = false, curatedTools, header }: ToolGridProps) {
  const t = useTranslations('common');
  const tCategories = useTranslations('categories');
  const [activeCategory, setActiveCategory] = useState('all');

  const hasSearch = searchQuery.trim().length > 0;

  const filteredTools = useMemo(() => {
    let filtered = tools;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((tool) => tool.category === activeCategory);
    }

    // Filter by search query
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

  // 橱窗模式：无搜索时展示精选集，搜索时展示全量匹配结果
  const displayTools = curated && !hasSearch ? (curatedTools ?? filteredTools) : filteredTools;

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Optional section header (curated showcase) */}
      {header && <div className="mb-8">{header}</div>}

      {/* Category Filter (hidden in curated homepage showcase) */}
      {!curated && (
        <div className="mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      )}

      {/* Results count (full directory always; curated only while searching) */}
      {(!curated || hasSearch) && (
        <div className="mb-6 text-sm text-[var(--muted)]">
          {displayTools.length} {locale === 'zh' ? '个资源' : 'resources'}
          {totalCount && totalCount !== displayTools.length
            ? locale === 'zh'
              ? ` / 共 ${totalCount} 个`
              : ` / ${totalCount} total`
            : ''}
          {activeCategory !== 'all' && ` · ${tCategories(activeCategory as any)}`}
          {searchQuery && ` · "${searchQuery}"`}
        </div>
      )}

      {/* Grid */}
      {displayTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[var(--muted-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-[var(--muted)]" />
          </div>
          <p className="text-[var(--muted)]">{t('noResults')}</p>
        </div>
      )}
    </section>
  );
}
