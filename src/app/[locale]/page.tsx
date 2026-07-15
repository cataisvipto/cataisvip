'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ToolGrid from '@/components/ToolGrid';
import SubmitCTA from '@/components/SubmitCTA';
import Footer from '@/components/Footer';
import tools from '@/data/tools.json';
import { Tool } from '@/components/ToolCard';

export default function HomePage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locale={locale}
      />
      <main className="flex-1">
        <HeroSection />
        <ToolGrid
          tools={tools as Tool[]}
          locale={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <SubmitCTA />
      </main>
      <Footer />
    </>
  );
}
