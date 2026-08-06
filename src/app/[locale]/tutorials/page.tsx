import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import tutorials from '@/data/tutorials.json';
import TutorialsClient from './TutorialsClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tutorials' });
  const title = `${t('title')} - Cataito`;
  const description = t('subtitle');
  return {
    title,
    description,
    alternates: generateAlternates('/tutorials', locale),
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default function TutorialsPage() {
  return <TutorialsClient tutorials={tutorials} />;
}
