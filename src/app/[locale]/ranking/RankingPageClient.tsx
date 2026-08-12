'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RankingClient from './RankingClient';

interface RankingPageClientProps {
  githubItems: any[];
  githubUpdatedAt: string;
  locale: string;
}

export default function RankingPageClient({
  githubItems,
  githubUpdatedAt,
  locale,
}: RankingPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
        <RankingClient
          items={githubItems}
          updatedAt={githubUpdatedAt}
          locale={locale}
        />
      </main>
      <Footer />
    </>
  );
}