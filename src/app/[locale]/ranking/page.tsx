import { getTranslations, setRequestLocale } from 'next-intl/server';
import RankingClient from './RankingClient';
import ranking from '@/data/ranking.json';
import { generateAlternates } from '@/lib/seo';

export const revalidate = 3600;

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
          items={ranking.boards.all.items}
          updatedAt={ranking.updatedAt}
      locale={locale}
    />
  );
}
