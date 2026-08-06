'use client';

import { useTranslations } from 'next-intl';
import { CATEGORIES } from '@/lib/categories';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const t = useTranslations('categories');

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
          activeCategory === 'all'
            ? 'bg-[var(--foreground)] text-[var(--background)]'
            : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--muted-border)] hover:text-[var(--foreground)]'
        }`}
      >
        {t('all')}
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === cat
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--muted-border)] hover:text-[var(--foreground)]'
          }`}
        >
          {t(cat as any)}
        </button>
      ))}
    </div>
  );
}