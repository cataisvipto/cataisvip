'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ToolGrid from '@/components/ToolGrid';
import FeaturedAgents from '@/components/FeaturedAgents';
import BlogHighlights from '@/components/BlogHighlights';
import TutorialHighlights from '@/components/TutorialHighlights';
import Newsletter from '@/components/Newsletter';
import SubmitCTA from '@/components/SubmitCTA';
import Footer from '@/components/Footer';
import LogoTile from '@/components/LogoTile';
import tools from '@/data/tools.json';
import { Tool, getLocalizedDescription } from '@/components/ToolCard';
import { CATEGORIES, categoryToSlug } from '@/lib/categories';

export default function HomePageClient() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tCategories = useTranslations('categories');
  const tNav = useTranslations('nav');
  const [searchQuery, setSearchQuery] = useState('');
  const allTools = tools as Tool[];

  // Latest 8 tools
  const latestTools = allTools.slice(-8).reverse();
  // Curated editor's picks
  const curatedTools = allTools.filter((tool) => tool.homeFeatured).slice(0, 8);

  const getDisplayName = (tool: Tool) =>
    locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locale={locale}
      />
      <main className="flex-1">
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Latest Additions - clean, no gradient icon */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                {t('latestTitle')}
              </h2>
              <p className="mt-1.5 text-[var(--muted)] text-sm">{t('latestDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {latestTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tool/${tool.slug}`}
                className="group bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 p-4"
              >
                <div className="flex items-center gap-3 mb-3 group/header">
                                  <LogoTile
                                    logo={tool.logo}
                                    logoDark={tool.logoDark}
                                    alt={getDisplayName(tool)}
                                    className="w-10 h-10 rounded-lg"
                                    imgPx={32}
                                    fallbackClassName="text-base"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-sm text-[var(--foreground)] truncate group-hover/header:text-[var(--primary)] transition">
                      {getDisplayName(tool)}
                    </h3>
                    {tool.developer && (
                      <p className="text-xs text-[var(--muted)] truncate">
                        {locale === 'zh' && tool.developerZh ? tool.developerZh : tool.developer}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2 hover:text-[var(--foreground)] transition">
                  {getLocalizedDescription(tool, locale)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Editor's Picks */}
        <ToolGrid
          tools={allTools}
          locale={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={allTools.length}
          curated
          curatedTools={curatedTools}
          header={
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                  {t('featuredTitle')}
                </h2>
                <p className="mt-1.5 text-[var(--muted)] text-sm">{t('featuredDesc')}</p>
              </div>
              <Link
                href="/tools"
                className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
              >
                {t('viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          }
        />

        {/* Mobile view-all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FeaturedAgents />

                {/* Resources navigation — 正文内链，帮助 Google 发现 Skills/MCP/分类等页面 */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    <Link href="/skills" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition shadow-sm">
                                          {tNav('skills')}
                                        </Link>
                                        <Link href="/mcp" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[var(--foreground)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300">
                                          MCP
                                        </Link>
                                        <Link href="/ranking" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[var(--foreground)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300">
                                          {tNav('ranking')}
                                        </Link>
                                        <Link href="/tutorials" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[var(--foreground)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300">
                                          {tNav('tutorials')}
                                        </Link>
                                        <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[var(--foreground)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300">
                                          All Tools
                                        </Link>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {CATEGORIES.slice(0, 8).map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${categoryToSlug(cat)}`}
                        className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition px-2 py-1"
                      >
                        {tCategories(cat as any)}
                      </Link>
                    ))}
                    <span className="text-xs text-[var(--muted)] px-1">·</span>
                    {CATEGORIES.slice(8).map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${categoryToSlug(cat)}`}
                        className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition px-2 py-1"
                      >
                        {tCategories(cat as any)}
                      </Link>
                    ))}
                  </div>
                </section>

                <BlogHighlights />

                {/* Tutorials content grid — 教程内容网格（最新 3 篇，无教程时自动隐藏） */}
                <TutorialHighlights />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Newsletter />
        </div>
        <SubmitCTA />
      </main>
      <Footer />
    </>
  );
}