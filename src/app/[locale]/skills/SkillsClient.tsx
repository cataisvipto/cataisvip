'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Star, GitFork, Code2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import type { FaqItem } from '@/components/FaqSection';

export interface Skill {
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
  agents: string[];
  category: string;
  tags: string[];
  installCommand: string;
  logo: string;
  stars: number;
  featured: boolean;
  faqs?: FaqItem[];
}

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

interface SkillsClientProps {
  skills: Skill[];
  locale: string;
}

export default function SkillsClient({ skills, locale }: SkillsClientProps) {
  const tSkills = useTranslations('skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Compute unique agents and categories from actual skills data
  const ALL_AGENTS = [...new Set(skills.flatMap(s => s.agents))];
  const ALL_CATEGORIES = [...new Set(skills.map(s => s.category))];

  const displayName = (skill: Skill) => locale === 'zh' && skill.nameZh ? skill.nameZh : skill.name;

  // Filter skills
  const filtered = skills.filter((skill) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = displayName(skill).toLowerCase().includes(q) ||
      skill.descriptionEn.toLowerCase().includes(q) ||
      getLocalizedSkillDescription(skill, locale).toLowerCase().includes(q);
    const agentMatch = selectedAgent === 'all' || skill.agents.includes(selectedAgent);
    const categoryMatch = selectedCategory === 'all' || skill.category === selectedCategory;
    return nameMatch && agentMatch && categoryMatch;
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
                  { name: tSkills('title') },
                ]}
                locale={locale}
              />

              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">{tSkills('title')}</h1>
                <p className="mt-1.5 text-[var(--muted)] text-sm">{tSkills('subtitle')}</p>
              </div>

        {/* Agent Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-[var(--muted)] mr-1">{tSkills('filterByAgent')}:</span>
          <button
            onClick={() => setSelectedAgent('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedAgent === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--muted-border)]'
            }`}
          >
            {tSkills('allAgents')}
          </button>
          {ALL_AGENTS.map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition capitalize ${
                selectedAgent === agent
                  ? 'bg-[var(--primary)] text-white'
                  : `${AGENT_COLORS[agent]} border border-[var(--muted-border)] hover:opacity-80`
              }`}
            >
              {agent}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm font-medium text-[var(--muted)] mr-1">{tSkills('filterByCategory')}:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--muted-border)]'
            }`}
          >
            {tSkills('allCategories')}
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
              {tSkills(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-8">
                  {tSkills('resultsCount', { count: filtered.length })}
                </p>

        {/* Skills Grid */}
        <ScrollReveal><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((skill) => (
            <Link
              key={skill.slug}
              href={`/skills/${skill.slug}`}
              className="group relative bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col"
            >
              {/* Featured badge */}
              {skill.featured && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 mb-3 group/header">
                              <div className="w-12 h-12 rounded-xl bg-[var(--logo-tile-bg)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                <Image
                                  src={skill.logo}
                                  alt={displayName(skill)}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-[var(--foreground)] truncate group-hover/header:text-[var(--primary)] transition">
                    {displayName(skill)}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">{tSkills(`categories.${skill.category}`)}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 flex-1 line-clamp-3 hover:text-[var(--foreground)] transition">
                {getLocalizedSkillDescription(skill, locale)}
              </p>

              {/* Agent badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skill.agents.map((agent) => (
                  <span
                    key={agent}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${AGENT_COLORS[agent] || AGENT_COLORS['generic']}`}
                  >
                    {agent}
                  </span>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skill.tags.map((tag) => (
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
                  {skill.repo}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {skill.stars.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div></ScrollReveal>

                {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Code2 className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--muted)]">{tSkills('noResults')}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
