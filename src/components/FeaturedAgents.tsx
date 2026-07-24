'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Bot } from 'lucide-react';
import LogoTile from '@/components/LogoTile';
import tools from '@/data/tools.json';
import { Tool, getLocalizedDescription } from './ToolCard';

export default function FeaturedAgents() {
  const t = useTranslations('featuredAgents');
  const tCategories = useTranslations('categories');
  const locale = useLocale();

  // Filter Agent category tools that are featured
  const agents = (tools as Tool[])
    .filter((tool) => tool.category === 'Agent' && tool.featured)
    .slice(0, 6);

  if (agents.length === 0) return null;

  const getDisplayName = (tool: Tool) => {
    return locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {t('title')}
            </h2>
            <p className="mt-1 text-[var(--muted)] text-sm">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <Link
          href="/category/agent"
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const displayName = getDisplayName(agent);
          const description = getLocalizedDescription(agent, locale);

          return (
            <Link
              key={agent.slug}
              href={`/tool/${agent.slug}`}
              className="group bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-5 hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <LogoTile
                  logo={agent.logo}
                  alt={displayName}
                  className="w-14 h-14 rounded-xl"
                  imgPx={48}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition">
                    {displayName}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {tCategories(agent.category as any)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
                {description}
              </p>

              {/* Platforms */}
              {agent.platforms && agent.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {agent.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile view-all */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/category/agent"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAllMobile')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
