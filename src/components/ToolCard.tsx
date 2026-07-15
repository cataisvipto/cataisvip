'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export interface Tool {
  slug: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionEn: string;
  url: string;
  logo: string;
  category: string;
  tags: string[];
  featured: boolean;
}

interface ToolCardProps {
  tool: Tool;
  locale: string;
}

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700',
  'Freemium': 'bg-blue-100 text-blue-700',
  'Paid': 'bg-amber-100 text-amber-700',
  'Open Source': 'bg-violet-100 text-violet-700',
  'API': 'bg-purple-100 text-purple-700',
};

export default function ToolCard({ tool, locale }: ToolCardProps) {
  const t = useTranslations('common');
  const tCategories = useTranslations('categories');
  const description = locale === 'zh' ? tool.description : tool.descriptionEn;
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col">
      {/* Featured badge */}
      {tool.featured && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      )}

      {/* Header - links to detail page */}
      <Link href={`/tool/${tool.slug}`} className="flex items-start gap-3 mb-3 group/header">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          <Image
            src={tool.logo}
            alt={displayName}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover/header:text-indigo-600 transition">{displayName}</h3>
          <span className="text-xs text-gray-400">{tCategories(tool.category as any)}</span>
        </div>
      </Link>

      {/* Description - links to detail page */}
      <Link href={`/tool/${tool.slug}`}>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3 hover:text-gray-800 transition cursor-pointer">
          {description}
        </p>
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded-md text-xs font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
          >
            {locale === 'zh' ? t(tag as any) : tag}
          </span>
        ))}
      </div>

      {/* Visit Link */}
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-xl text-sm font-medium transition border border-gray-100 hover:border-indigo-200"
      >
        {t('visit')}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </article>
  );
}
