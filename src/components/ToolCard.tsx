'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import LogoTile from './LogoTile';

export interface Tool {
  slug: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionEn: string;
  descriptionJa?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  url: string;
  logo: string;
  logoTheme?: 'light' | 'dark' | 'fill';
  category: string;
  tags: string[];
  featured: boolean;
  platforms?: string[];
  developer?: string;
  developerZh?: string;
}

// Helper to get localized description
export const getLocalizedDescription = (tool: Tool, locale: string) => {
  switch (locale) {
    case 'zh': return tool.description;
    case 'ja': return tool.descriptionJa || tool.descriptionEn;
    case 'es': return tool.descriptionEs || tool.descriptionEn;
    case 'fr': return tool.descriptionFr || tool.descriptionEn;
    default: return tool.descriptionEn;
  }
};

interface ToolCardProps {
  tool: Tool;
  locale: string;
}

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Freemium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Paid': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Open Source': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'API': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function ToolCard({ tool, locale }: ToolCardProps) {
  const t = useTranslations('common');
  const tTags = useTranslations('tags');
  const tCategories = useTranslations('categories');
  const description = getLocalizedDescription(tool, locale);
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;

  return (
    <article className="group relative bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-5 hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 flex flex-col">
      {/* Featured badge */}
      {tool.featured && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      )}

      {/* Header - links to detail page */}
      <Link href={`/tool/${tool.slug}`} className="flex items-start gap-3 mb-3 group/header">
        <LogoTile
          logo={tool.logo}
          alt={displayName}
          theme={tool.logoTheme}
          className="w-12 h-12 rounded-xl"
          pad="p-1.5"
          imgPx={40}
          fallbackClassName="text-lg"
        />
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] truncate group-hover/header:text-[var(--primary)] transition">{displayName}</h3>
          <span className="text-xs text-[var(--muted)]">{tCategories(tool.category as any)}</span>
        </div>
      </Link>

      {/* Description - links to detail page */}
      <Link href={`/tool/${tool.slug}`}>
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 flex-1 line-clamp-3 hover:text-[var(--foreground)] transition cursor-pointer">
          {description}
        </p>
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded-md text-xs font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {tTags(tag as any)}
          </span>
        ))}
      </div>

      {/* Platforms (for Agent category) */}
      {tool.platforms && tool.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tool.platforms.map((platform) => (
            <span
              key={platform}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {platform}
            </span>
          ))}
        </div>
      )}

      {/* Visit Link */}
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[var(--muted-bg)] hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] rounded-xl text-sm font-medium transition border border-[var(--card-border)] hover:border-[var(--primary)]"
      >
        {t('visit')}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </article>
  );
}
