'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Star, GitFork, Trophy, TrendingUp, TrendingDown, Minus, ExternalLink, Info } from 'lucide-react';

export interface RankingItem {
  rank: number;
  fullName: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  avatar: string | null;
  change: number | null;
}

/** GitHub 语言标识色（装饰性小圆点，非内容卡片配色） */
const LANGUAGE_COLORS: Record<string, string> = {
  'Python': 'bg-blue-500',
  'TypeScript': 'bg-sky-600',
  'JavaScript': 'bg-yellow-400',
  'Go': 'bg-cyan-500',
  'Rust': 'bg-orange-600',
  'C++': 'bg-pink-600',
  'C': 'bg-gray-500',
  'Jupyter Notebook': 'bg-orange-400',
  'Java': 'bg-amber-700',
  'Kotlin': 'bg-purple-500',
  'Swift': 'bg-orange-500',
  'HTML': 'bg-red-500',
  'Vue': 'bg-emerald-500',
};

/** 前三名奖牌配色（装饰性徽章，渐变仅用于徽章元素） */
const MEDAL_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-md',
  2: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-md',
  3: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-md',
};

function RepoAvatar({ item }: { item: RankingItem }) {
  const [failed, setFailed] = useState(false);
  // 外链头像加载失败兜底：品牌渐变 + 首字母占位
  if (!item.avatar || failed) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-sm">{item.name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.avatar}
      alt={item.fullName}
      width={40}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-white dark:bg-white/90 border border-[var(--card-border)]"
    />
  );
}

function ChangeBadge({ change, newLabel }: { change: number | null; newLabel: string }) {
  if (change === null) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
        {newLabel}
      </span>
    );
  }
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-3 h-3" />{change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500 dark:text-red-400">
        <TrendingDown className="w-3 h-3" />{Math.abs(change)}
      </span>
    );
  }
  return <Minus className="w-3 h-3 text-[var(--muted)]" />;
}

interface RankingClientProps {
  items: RankingItem[];
  updatedAt: string;
  locale: string;
}

export default function RankingClient({ items, updatedAt, locale }: RankingClientProps) {
  const t = useTranslations('ranking');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = items.filter(
    (item) =>
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Breadcrumb items={[{ name: t('title') }]} locale={locale} />

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
              <p className="text-sm text-[var(--muted)]">{t('subtitle')}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">{t('updatedLabel', { date: updatedAt })}</p>
        </div>

        {/* Methodology note — 只说明维度类别，不暴露算法细节 */}
        <div className="flex items-start gap-2.5 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 mb-8">
          <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--muted)] leading-relaxed">{t('methodologyText')}</p>
        </div>

        {/* Ranking list */}
        <div className="space-y-2">
          {filtered.map((item) => (
            <a
              key={item.fullName}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 sm:gap-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] px-3 sm:px-5 py-3.5 hover:shadow-md hover:border-[var(--primary)] transition-all duration-200"
            >
              {/* Rank */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                  MEDAL_STYLES[item.rank] || 'bg-[var(--muted-bg)] text-[var(--muted)]'
                }`}
              >
                {item.rank}
              </div>

              <RepoAvatar item={item} />

              {/* Name + description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition">
                    {item.fullName}
                  </h2>
                  <ChangeBadge change={item.change} newLabel={t('newLabel')} />
                </div>
                <p className="text-xs text-[var(--muted)] truncate mt-0.5">{item.description}</p>
              </div>

              {/* Metrics */}
              <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-[var(--muted)]">
                {item.language && (
                  <span className="hidden md:flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${LANGUAGE_COLORS[item.language] || 'bg-gray-400'}`} />
                    {item.language}
                  </span>
                )}
                <span className="flex items-center gap-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  {item.stars.toLocaleString()}
                </span>
                <span className="hidden lg:flex items-center gap-1 tabular-nums">
                  <GitFork className="w-3.5 h-3.5" />
                  {item.forks.toLocaleString()}
                </span>
              </div>

              <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition shrink-0" />
            </a>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--muted)]">{t('noResults')}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
