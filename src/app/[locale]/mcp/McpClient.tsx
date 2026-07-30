'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Star, GitFork, ExternalLink, Plug } from 'lucide-react';

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
  starsMap?: Record<string, number>;
}

export default function McpClient({ servers, locale, starsMap }: McpClientProps) {
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
    const nameMatch = displayName(entry).toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    const clientMatch = selectedClient === 'all' || entry.clients.includes(selectedClient);
    const categoryMatch = selectedCategory === 'all' || entry.category === selectedCategory;
    return nameMatch && clientMatch && categoryMatch;
  });

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { name: tMcp('title') },
          ]}
          locale={locale}
        />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Plug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{tMcp('title')}</h1>
              <p className="text-sm text-[var(--muted)]">{tMcp('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Client Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-[var(--muted)] mr-1">{tMcp('filterByClient')}:</span>
          <button
            onClick={() => setSelectedClient('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedClient === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--card-border)]'
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
                  : `${CLIENT_COLORS[client] || CLIENT_COLORS['generic']} border border-[var(--card-border)] hover:opacity-80`
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
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--card-border)]'
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
                  : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--card-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-4">
          {tMcp('resultsCount', { count: filtered.length })}
        </p>

        {/* MCP Servers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <article
              key={entry.slug}
              className="group relative bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-5 hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 flex flex-col"
            >
              {/* Featured badge */}
              {entry.featured && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}

              {/* Header */}
              <Link href={`/mcp/${entry.slug}`} className="flex items-start gap-3 mb-3 group/header">
                <div className="w-12 h-12 rounded-xl bg-[var(--logo-tile-bg)] border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                  <span className="text-xs text-[var(--muted)]">{entry.category}</span>
                </div>
              </Link>

              {/* Description */}
              <Link href={`/mcp/${entry.slug}`}>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 flex-1 line-clamp-3 hover:text-[var(--foreground)] transition cursor-pointer">
                  {getLocalizedMcpDescription(entry, locale)}
                </p>
              </Link>

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
              <div className="flex items-center gap-3 text-xs text-[var(--muted)] mb-3">
                <span className="flex items-center gap-1 truncate">
                  <GitFork className="w-3 h-3 shrink-0" />
                  {entry.repo}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {(starsMap?.[entry.slug] ?? entry.stars).toLocaleString()}
                </span>
              </div>

              {/* View Details Button */}
              <Link
                href={`/mcp/${entry.slug}`}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[var(--muted-bg)] hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] rounded-xl text-sm font-medium transition border border-[var(--card-border)] hover:border-[var(--primary)]"
              >
                {tMcp('viewDetails')}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </article>
          ))}
        </div>

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
