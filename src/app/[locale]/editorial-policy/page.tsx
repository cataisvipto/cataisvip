import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import EditorialPolicyClient from './EditorialPolicyClient';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'editorialPolicy' });
  const title = `${t('title')} - Cataito`;
  return {
    title,
    description: t('intro_text'),
    alternates: generateAlternates('/editorial-policy', locale),
  };
}

export default function EditorialPolicyPage() {
  return <EditorialPolicyClient />;
}
