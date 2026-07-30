'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Image from 'next/image';
import { Star, GitFork, ExternalLink, Plug, Copy, Check, Terminal, ArrowLeft, Building2 } from 'lucide-react';
import FaqSection from '@/components/FaqSection';
import type { McpServer } from '../McpClient';

const getLocalizedMcpDescription = (server: McpServer, locale: string) => {
  switch (locale) {
    case 'zh': return server.description;
    case 'ja': return server.descriptionJa || server.descriptionEn;
    case 'es': return server.descriptionEs || server.descriptionEn;
    case 'fr': return server.descriptionFr || server.descriptionEn;
    default: return server.descriptionEn;
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

interface McpDetailClientProps {
  server: McpServer;
  locale: string;
  readmeInstallHtml?: string;
  gitHubStars?: number;
}

export default function McpDetailClient({ server, locale, readmeInstallHtml, gitHubStars }: McpDetailClientProps) {
  const t = useTranslations('common');
  const tMcp = useTranslations('mcp');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const displayName = locale === 'zh' && server.nameZh ? server.nameZh : server.name;
  const stars = gitHubStars ?? server.stars;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(server.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Click-to-copy for code blocks in README installation section via event delegation
  const copiedLabel = t('copied');
  useEffect(() => {
    const container = document.querySelector('.readme-install');
    if (!container) return;

    const handleClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest('.copy-code-btn');
      if (!btn) return;
      const wrapper = btn.closest('.code-block-wrapper');
      if (!wrapper) return;
      const code = wrapper.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.textContent || '');
      // Brief visual feedback
      const original = btn.textContent;
      btn.textContent = copiedLabel;
      setTimeout(() => { btn.textContent = original; }, 1500);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [readmeInstallHtml, copiedLabel]);

  // JSON-LD structured data for SEO (aligned with ToolDetailClient convention)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: displayName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    url: `https://github.com/${server.repo}`,
    image: server.logo,
    description: getLocalizedMcpDescription(server, locale),
    offers: {
      '@type': 'Offer',
      price: server.tags.includes('Free') ? '0' : '',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { name: tMcp('title'), href: '/mcp' },
            { name: displayName },
          ]}
          locale={locale}
        />

        <article className="space-y-6">
          {/* Header Card */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-[var(--logo-tile-bg)] border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <Image
                    src={server.logo}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">{displayName}</h1>
                    {server.featured && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {t('featured')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)] mb-3">
                    <Plug className="w-4 h-4" />
                    <span className="text-sm">{tMcp(`categories.${server.category}`)}</span>
                  </div>

                  {/* Repo & Stars */}
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-4">
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-4 h-4" />
                      <a
                        href={`https://github.com/${server.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--primary)] transition"
                      >
                        {server.repo}
                      </a>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4" />
                      {stars.toLocaleString()} {tMcp('starsLabel')}
                    </span>
                  </div>

                  {/* Developer */}
                  {server.developer && (
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {locale === 'zh' && server.developerZh ? server.developerZh : server.developer}
                      </span>
                    </div>
                  )}

                  {/* Client badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {server.clients.map((client) => (
                      <span
                        key={client}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${CLIENT_COLORS[client] || CLIENT_COLORS['generic']}`}
                      >
                        {client}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {server.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-8 pb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Plug className="w-5 h-5 text-indigo-500" />
                {tMcp('about')}
              </h2>
              <p className="text-[var(--muted)] leading-relaxed text-lg">
                {getLocalizedMcpDescription(server, locale)}
              </p>
            </div>

            {/* Install Command */}
            <div className="px-8 pb-8">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" />
                {tMcp('install')}
              </h2>
              <div className="flex items-stretch">
                <div className="code-install-box flex-1 border border-[var(--card-border)] rounded-l-lg px-4 py-3 overflow-x-auto">
                  <code className="code-install-text text-sm font-mono whitespace-nowrap select-all">{server.installCommand}</code>
                </div>
                <button
                  onClick={handleCopyCommand}
                  className="code-install-btn flex items-center gap-1.5 px-4 py-3 border border-l-0 border-[var(--card-border)] rounded-r-lg text-xs font-medium hover:text-white hover:bg-[var(--primary)]/20 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{tMcp('copyCommand')}</span>
                    </>
                  )}
                </button>
              </div>
              {readmeInstallHtml && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-[var(--muted)] mb-2">{tMcp('officialGuide')}</p>
                  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 overflow-x-auto">
                    <div
                      className="readme-install text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: readmeInstallHtml }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 flex flex-wrap gap-3">
              <a
                href={`https://github.com/${server.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium rounded-full hover:opacity-90 transition shadow-md"
              >
                <GitFork className="w-4 h-4" />
                {tMcp('viewOnGitHub')}
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/mcp"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-full hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {tMcp('backToList')}
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <FaqSection faqs={server.faqs} locale={locale} title={tMcp('faqTitle')} />
        </article>
      </main>
      <Footer />
    </>
  );
}
