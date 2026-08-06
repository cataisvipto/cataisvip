'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Star, GitFork, Plug } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import type { FaqItem } from '@/components/FaqSection';

export interface McpServer {
  slug: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionEn: string;
  descriptionJa?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  developer?: string;
  developerZh?: string;
  repo: string;
  clients: string[];
  category: string;
  tags: string[];
  installCommand: string;
  logo: string;
  stars: number;
  featured: boolean;
  faqs?: FaqItem[];
}

const getLocalizedMcpDescription = (entry: McpServer, locale: string) => {
  switch (locale) {
    case 'zh': return entry.description;
    case 'ja': return entry.descriptionJa || entry.descriptionEn;
    case 'es': return entry.descriptionEs || entry.descriptionEn;
    case 'fr': return entry.descriptionFr || entry.descriptionEn;
    default: return entry.descriptionEn;
  }
};

const CLIENT_COLORS: Record<string, string> = {
  'claude': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'cursor': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'codex': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'vscode': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'windsurf': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'generic': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Open Source': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'API': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface McpClientProps {
  servers: McpServer[];
  locale: string;
}

export default function McpClient({ servers, locale }: McpClientProps) {
  const tMcp = useTranslations('mcp');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Compute unique clients and categories from actual data
  const ALL_CLIENTS = [...new Set(servers.flatMap(s => s.clients))];
  const ALL_CATEGORIES = [...new Set(servers.map(s => s.category))];

  const displayName = (entry: McpServer) => locale === 'zh' && entry.nameZh ? entry.nameZh : entry.name;

  // Filter servers
  const filtered = servers.filter((entry) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = displayName(entry).toLowerCase().includes(q) ||
      entry.descriptionEn.toLowerCase().includes(q) ||
      getLocalizedMcpDescription(entry, locale).toLowerCase().includes(q);
    const clientMatch = selectedClient === 'all' || entry.clients.includes(selectedClient);
    const categoryMatch = selectedCategory === 'all' || entry.category === selectedCategory;
    return nameMatch && clientMatch && categoryMatch;
  })
    // 卡片按星数由高到低排列（并列按 slug 升序保证确定性）；stars 为与详情页共用的单一数据源，
    // 由 refresh-stars 定时/手动刷新，新收录条目自动纳入排序，无需逐个配置。
    .sort((a, b) => (b.stars - a.stars) || a.slug.localeCompare(b.slug));

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
              <Breadcrumb
                items={[
                  { name: tMcp('title') },
                ]}
                locale={locale}
              />

              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">{tMcp('title')}</h1>
                <p className="mt-1.5 text-[var(--muted)] text-sm">{tMcp('subtitle')}</p>
              </div>

        {/* Client Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-[var(--muted)] mr-1">{tMcp('filterByClient')}:</span>
          <button
            onClick={() => setSelectedClient('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedClient === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--muted-border)]'
            }`}
          >
            {tMcp('allClients')}
          </button>
          {ALL_CLIENTS.map((client) => (
            <button
              key={client}
              onClick={() => setSelectedClient(client)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition capitalize ${
                selectedClient === client
                  ? 'bg-[var(--primary)] text-white'
                  : `${CLIENT_COLORS[client] || CLIENT_COLORS['generic']} border border-[var(--muted-border)] hover:opacity-80`
              }`}
            >
              {client}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm font-medium text-[var(--muted)] mr-1">{tMcp('filterByCategory')}:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--muted-border)]'
            }`}
          >
            {tMcp('allCategories')}
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--muted-border)]'
              }`}
            >
              {tMcp(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-8">
                  {tMcp('resultsCount', { count: filtered.length })}
                </p>

        {/* MCP Servers Grid */}
        <ScrollReveal><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((entry) => (
            <Link
              key={entry.slug}
              href={`/mcp/${entry.slug}`}
              className="group relative bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col"
            >
              {/* Featured badge */}
              {entry.featured && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 mb-3 group/header">
                              <div className="w-12 h-12 rounded-xl bg-[var(--logo-tile-bg)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                <Image
                                  src={entry.logo}
                                  alt={displayName(entry)}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-[var(--foreground)] truncate group-hover/header:text-[var(--primary)] transition">
                    {displayName(entry)}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">{tMcp(`categories.${entry.category}`)}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 flex-1 line-clamp-3 hover:text-[var(--foreground)] transition">
                {getLocalizedMcpDescription(entry, locale)}
              </p>

              {/* Client badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {entry.clients.map((client) => (
                  <span
                    key={client}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${CLIENT_COLORS[client] || CLIENT_COLORS['generic']}`}
                  >
                    {client}
                  </span>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Repo + Stars */}
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1 truncate">
                  <GitFork className="w-3 h-3 shrink-0" />
                  {entry.repo}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {entry.stars.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div></ScrollReveal>

                {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Plug className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--muted)]">{tMcp('noResults')}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
