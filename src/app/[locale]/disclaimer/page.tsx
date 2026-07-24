import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DisclaimerClient from './DisclaimerClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'disclaimer' });
  const title = `${t('title')} - Cataito`;
  return {
    title,
    description: t('general_text'),
    alternates: generateAlternates('/disclaimer', locale),
  };
}

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
