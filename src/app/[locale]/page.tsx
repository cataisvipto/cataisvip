import type { Metadata } from 'next';
import { generateAlternates, generateWebSiteJsonLd, BASE_URL } from '@/lib/seo';
import HomePageClient from './HomePageClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cataito - AI Ecosystem Portal | Your Gateway to AI',
    description:
      'Your gateway to the global AI ecosystem. Discover AI models, agents, tools, and resources from around the world.',
    keywords:
      'AI portal, AI ecosystem, AI tools, AI models, AI agents, ChatGPT, Claude, Gemini, DeepSeek, Grok, AI resources, artificial intelligence',
    alternates: generateAlternates('/'),
    openGraph: {
      title: 'Cataito - AI Ecosystem Portal',
      description:
        'Discover AI models, agents, tools, and resources from around the world.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Cataito',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cataito - AI Ecosystem Portal',
      description: 'Your gateway to the global AI ecosystem.',
    },
  };
}

export default function HomePage() {
  const webSiteJsonLd = generateWebSiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
