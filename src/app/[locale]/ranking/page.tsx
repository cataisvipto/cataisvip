import { getTranslations, setRequestLocale } from 'next-intl/server';
import RankingClient from './RankingClient';
import ranking from '@/data/githubRanking.json';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ranking' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: generateAlternates('/ranking', locale),
  };
}

export default async function RankingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RankingClient
      items={ranking.items}
      updatedAt={ranking.updatedAt}
      locale={locale}
    />
  );
}
