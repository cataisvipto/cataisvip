'use client';

import { useTranslations } from 'next-intl';

const CATEGORIES = ['Chat', 'Image', 'Code', 'Writing', 'Video', 'Audio', 'Search', 'Design', 'Agent', 'Developer', 'Platform'];

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
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
          activeCategory === 'all'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]'
        }`}
      >
        {t('all')}
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCategory === cat
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]'
          }`}
        >
          {t(cat as any)}
        </button>
      ))}
    </div>
  );
}
