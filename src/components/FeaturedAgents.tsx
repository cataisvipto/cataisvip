'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Bot } from 'lucide-react';
import LogoTile from '@/components/LogoTile';
import tools from '@/data/tools.json';
import { Tool, PLATFORM_META, getLocalizedDescription } from './ToolCard';

export default function FeaturedAgents() {
  const t = useTranslations('featuredAgents');
  const tCategories = useTranslations('categories');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const agents = (tools as Tool[])
    .filter((tool) => tool.category === 'Agent' && tool.featured)
    .slice(0, 6);

  if (agents.length === 0) return null;

  const getDisplayName = (tool: Tool) => {
    return locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            {t('title')}
          </h2>
          <p className="mt-1.5 text-[var(--muted)] text-sm">
            {t('subtitle')}
          </p>
        </div>
        <Link
          href="/category/agent"
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
        >
          {t('viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const displayName = getDisplayName(agent);
          const description = getLocalizedDescription(agent, locale);
          const platformChips = agent.platforms
            ? PLATFORM_META.filter((p) => agent.platforms![p.key] === true)
            : [];

          return (
            <Link
              key={agent.slug}
              href={`/tool/${agent.slug}`}
              className="group bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 p-5"
            >
              <div className="flex items-start gap-4 mb-4 group/header">
                              <LogoTile
                                logo={agent.logo}
                                logoDark={agent.logoDark}
                                alt={displayName}
                                className="w-14 h-14 rounded-xl"
                                imgPx={48}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[var(--foreground)] truncate group-hover/header:text-[var(--primary)] transition">
                    {displayName}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {tCategories(agent.category as any)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-2 hover:text-[var(--foreground)] transition">
                {description}
              </p>

              {platformChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {platformChips.map((p) => (
                    <span
                      key={p.key}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--muted-bg)] text-[var(--muted)]"
                    >
                      {tCommon(p.labelKey as any)}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

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