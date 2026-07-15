'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import ToolCard, { Tool } from './ToolCard';
import CategoryFilter from './CategoryFilter';
import { Search } from 'lucide-react';

interface ToolGridProps {
  tools: Tool[];
  locale: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ToolGrid({ tools, locale, searchQuery, onSearchChange }: ToolGridProps) {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const tCategories = useTranslations('categories');
  const [activeCategory, setActiveCategory] = useState('all');

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

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={tNav('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 text-sm text-gray-500">
        {filteredTools.length} {locale === 'zh' ? '个资源' : 'resources'}
        {activeCategory !== 'all' && ` · ${tCategories(activeCategory as any)}`}
        {searchQuery && ` · "${searchQuery}"`}
      </div>

      {/* Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500">{t('noResults')}</p>
        </div>
      )}
    </section>
  );
}
