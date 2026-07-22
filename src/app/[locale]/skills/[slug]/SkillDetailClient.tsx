'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Image from 'next/image';
import { Star, GitFork, ExternalLink, Code2, Copy, Check, Terminal, ChevronRight, Users, ArrowLeft, Building2 } from 'lucide-react';
import type { Skill } from '../SkillsClient';

const getLocalizedSkillDescription = (skill: Skill, locale: string) => {
  switch (locale) {
    case 'zh': return skill.description;
    case 'ja': return skill.descriptionJa || skill.descriptionEn;
    case 'es': return skill.descriptionEs || skill.descriptionEn;
    case 'fr': return skill.descriptionFr || skill.descriptionEn;
    default: return skill.descriptionEn;
  }
};

const AGENT_COLORS: Record<string, string> = {
  'claude': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'cursor': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'codex': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'workbuddy': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'generic': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Open Source': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'API': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface SkillDetailClientProps {
  skill: Skill;
  locale: string;
  readmeInstallHtml?: string;
  gitHubStars?: number;
}

export default function SkillDetailClient({ skill, locale, readmeInstallHtml, gitHubStars }: SkillDetailClientProps) {
  const t = useTranslations('common');
  const tSkills = useTranslations('skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const displayName = locale === 'zh' && skill.nameZh ? skill.nameZh : skill.name;
  const stars = gitHubStars ?? skill.stars;

  const handleCopyCommand = () => {
    const cmd = skill.installCommand.replace('{{agent}}', skill.agents[0]);
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const installCmd = skill.installCommand.replace('{{agent}}', skill.agents[0]);

  // Click-to-copy for code blocks in README installation section via event delegation
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
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [readmeInstallHtml]);

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { name: tSkills('title'), href: '/skills' },
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
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-white/90 border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <Image
                    src={skill.logo}
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
                    {skill.featured && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {t('featured')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)] mb-3">
                    <Code2 className="w-4 h-4" />
                    <span className="text-sm">{skill.category}</span>
                  </div>

                  {/* Repo & Stars */}
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-4">
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-4 h-4" />
                      <a
                        href={`https://github.com/${skill.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--primary)] transition"
                      >
                        {skill.repo}
                      </a>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4" />
                      {stars.toLocaleString()} stars
                    </span>
                  </div>

                  {/* Developer */}
                  {skill.developer && (
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {locale === 'zh' && skill.developerZh ? skill.developerZh : skill.developer}
                      </span>
                    </div>
                  )}

                  {/* Agent badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skill.agents.map((agent) => (
                      <span
                        key={agent}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${AGENT_COLORS[agent] || AGENT_COLORS['generic']}`}
                      >
                        {agent}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
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
                <Code2 className="w-5 h-5 text-indigo-500" />
                {tSkills('about')}
              </h2>
              <p className="text-[var(--muted)] leading-relaxed text-lg">
                {getLocalizedSkillDescription(skill, locale)}
              </p>
            </div>

            {/* Install Command */}
            <div className="px-8 pb-8">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" />
                {tSkills('install')}
              </h2>
              {readmeInstallHtml ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-5 overflow-x-auto">
                  <div
                    className="readme-install text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: readmeInstallHtml }}
                  />
                </div>
              ) : (
                <div className="flex items-stretch">
                  <div className="code-install-box flex-1 border border-[var(--card-border)] rounded-l-lg px-4 py-3 overflow-x-auto">
                    <code className="code-install-text text-sm font-mono whitespace-nowrap select-all">{installCmd}</code>
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
                        <span>{tSkills('copyCommand')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 flex flex-wrap gap-3">
              <a
                href={`https://github.com/${skill.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium rounded-full hover:opacity-90 transition shadow-md"
              >
                <GitFork className="w-4 h-4" />
                {tSkills('viewOnGitHub')}
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-full hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {tSkills('backToList')}
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
