import type { Metadata } from 'next';
import { generateAlternates, generateWebSiteJsonLd, getHomeSeo } from '@/lib/seo';
import HomePageClient from './HomePageClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { title, description, keywords } = getHomeSeo(locale);
  return {
    title,
    description,
    keywords,
    alternates: generateAlternates('/', locale),
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Cataito',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
