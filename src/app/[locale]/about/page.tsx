import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AboutClient from './AboutClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: generateAlternates('/about', locale),
  };
}

// Organization JSON-LD — truthful E-E-A-T signals only (no fabricated data)
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cataito',
  url: 'https://cataito.com',
  logo: 'https://cataito.com/logo.png',
  email: 'hello@cataito.com',
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
