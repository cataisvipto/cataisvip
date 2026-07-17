'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ToolGrid from '@/components/ToolGrid';
import FeaturedAgents from '@/components/FeaturedAgents';
import BlogHighlights from '@/components/BlogHighlights';
import Newsletter from '@/components/Newsletter';
import SubmitCTA from '@/components/SubmitCTA';
import Footer from '@/components/Footer';
import tools from '@/data/tools.json';
import { Tool } from '@/components/ToolCard';

export default function HomePageClient() {
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
        <FeaturedAgents />
        <BlogHighlights />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Newsletter locale={locale} />
        </div>
        <SubmitCTA />
      </main>
      <Footer />
    </>
  );
}
