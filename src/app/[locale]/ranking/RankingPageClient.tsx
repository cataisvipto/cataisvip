'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RankingClient from './RankingClient';
import ModelRankingClient from './ModelRankingClient';
import type { RankingItem } from './RankingClient';
import type { ModelRankingItem, ModelSource } from './ModelRankingClient';

interface RankingPageClientProps {
  githubItems: RankingItem[];
  githubUpdatedAt: string;
  modelItems: ModelRankingItem[];
  modelUpdatedAt: string;
  modelSources: ModelSource[];
  locale: string;
}

type TabId = 'models' | 'github';

export default function RankingPageClient({
  githubItems,
  githubUpdatedAt,
  modelItems,
  modelUpdatedAt,
  modelSources,
  locale,
}: RankingPageClientProps) {
  const t = useTranslations('ranking');
  const [activeTab, setActiveTab] = useState<TabId>('models');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'models', label: t('tabModels') },
    { id: 'github', label: t('tabGithub') },
  ];

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
        {/* Tab switcher */}
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-[var(--muted-bg)] rounded-xl p-1 w-fit border border-[var(--muted-border)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'github' ? (
          <RankingClient
                      items={githubItems}
                      updatedAt={githubUpdatedAt}
                      locale={locale}
                    />
        ) : (
          <ModelRankingClient
            items={modelItems}
            updatedAt={modelUpdatedAt}
            sources={modelSources}
            locale={locale}
            searchQuery={searchQuery}
          />
        )}
      </main>
      <Footer />
    </>
  );
}