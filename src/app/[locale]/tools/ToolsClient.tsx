'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid } from 'lucide-react';
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Breadcrumb items={[{ name: t('title') }]} locale={locale} />

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-sm text-[var(--muted)]">{t('subtitle')}</p>
          </div>
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
