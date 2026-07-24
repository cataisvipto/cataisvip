import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PrivacyClient from './PrivacyClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const title = `${t('title')} - Cataito`;
  return {
    title,
    description: t('intro_text'),
    alternates: generateAlternates('/privacy', locale),
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
