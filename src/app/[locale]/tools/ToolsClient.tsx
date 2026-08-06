'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import ToolGrid from '@/components/ToolGrid';
import type { Tool } from '@/components/ToolCard';

interface ToolsClientProps {
  tools: Tool[];
  locale: string;
}

export default function ToolsClient({ tools, locale }: ToolsClientProps) {
  const t = useTranslations('allTools');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
        <Breadcrumb items={[{ name: t('title') }]} locale={locale} />

        <div className="mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-1.5 text-[var(--muted)] text-sm">{t('subtitle')}</p>
        </div>
      </main>

      <ToolGrid
        tools={tools}
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={tools.length}
      />

      <Footer />
    </>
  );
}