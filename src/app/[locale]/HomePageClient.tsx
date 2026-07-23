'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const allTools = tools as Tool[];

  // Latest 4 tools (last entries in tools.json)
  const latestTools = allTools.slice(-4).reverse();
  // Featured tools for main grid
  const featuredTools = allTools.filter(t => t.featured);

  const getDisplayName = (tool: Tool) =>
    locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;

  const t = {
    latestTitle: locale === 'zh' ? '最新收录' : locale === 'ja' ? '最新追加' : locale === 'es' ? 'Últimas incorporaciones' : locale === 'fr' ? 'Derniers ajouts' : 'Latest Additions',
    latestDesc: locale === 'zh' ? '最新加入 Cataito 生态的 AI 工具' : 'Recently added AI tools to the Cataito ecosystem',
    viewAll: locale === 'zh' ? '浏览全部工具' : locale === 'ja' ? 'すべてのツールを見る' : locale === 'es' ? 'Ver todas las herramientas' : locale === 'fr' ? 'Voir tous les outils' : 'Browse All Tools',
  };

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
                  {t.latestTitle}
                </h2>
                <p className="mt-1 text-[var(--muted)] text-sm">{t.latestDesc}</p>
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
                    theme={tool.logoTheme}
                    className="w-10 h-10 rounded-lg"
                    pad="p-1.5"
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

        <ToolGrid
          tools={featuredTools}
          locale={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={allTools.length}
        />

        {/* Browse All Link */}
        <div className="text-center pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition text-sm font-medium"
          >
            {t.viewAll}
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
