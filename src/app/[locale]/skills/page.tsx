import { getTranslations, setRequestLocale } from 'next-intl/server';
import SkillsClient from './SkillsClient';
import skills from '@/data/skills.json';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'skills' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: generateAlternates('/skills', locale),
  };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 星数单一数据源：直接读 skills.json 的 stars 字段（由 refresh-stars 定时/手动刷新），保证卡片与详情页始终一致
  return <SkillsClient skills={skills} locale={locale} />;
}
