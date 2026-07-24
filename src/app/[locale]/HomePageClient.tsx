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
import Newsletter from '@/components/Newsletter';
import SubmitCTA from '@/components/SubmitCTA';
import Footer from '@/components/Footer';
import LogoTile from '@/components/LogoTile';
import tools from '@/data/tools.json';
import { Tool } from '@/components/ToolCard';

export default function HomePageClient() {
  const locale = useLocale();
  const t = useTranslations('home');
  const [searchQuery, setSearchQuery] = useState('');
  const allTools = tools as Tool[];

  // Latest 8 tools (last entries in tools.json)
  const latestTools = allTools.slice(-8).reverse();
  // Curated editor's picks for the homepage showcase (balanced across categories)
  const curatedTools = allTools.filter((tool) => tool.homeFeatured);

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
        <HeroSection />

        {/* Latest Additions Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {t('latestTitle')}
                </h2>
                <p className="mt-1 text-[var(--muted)] text-sm">{t('latestDesc')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {latestTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tool/${tool.slug}`}
                className="group bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <LogoTile
                    logo={tool.logo}
                    alt={getDisplayName(tool)}
                    className="w-10 h-10 rounded-lg"
                    imgPx={32}
                    fallbackClassName="text-base"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition">
                      {getDisplayName(tool)}
                    </h3>
                    {tool.developer && (
                      <p className="text-xs text-[var(--muted)] truncate">
                        {locale === 'zh' && tool.developerZh ? tool.developerZh : tool.developer}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                  {locale === 'zh' ? tool.description : tool.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Editor's Picks — curated showcase across categories */}
        <ToolGrid
          tools={allTools}
          locale={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={allTools.length}
          curated
          curatedTools={curatedTools}
          header={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {t('featuredTitle')}
                </h2>
                <p className="mt-1 text-[var(--muted)] text-sm">{t('featuredDesc')}</p>
              </div>
            </div>
          }
        />

        {/* Browse All Link */}
        <div className="text-center pb-4">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition text-sm font-medium"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FeaturedAgents />
        <BlogHighlights />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Newsletter locale={locale} />
        </div>
        <SubmitCTA />
      </main>
      <Footer />
    </>
  );
}
