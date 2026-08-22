import { getTranslations, setRequestLocale } from 'next-intl/server';
import McpClient from './McpClient';
import mcpServers from '@/data/mcp.json';
import { generateAlternates } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'mcp' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: generateAlternates('/mcp', locale),
  };
}

export default async function McpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 星数单一数据源：直接读 mcp.json 的 stars 字段（由 refresh-stars 定时/手动刷新），保证卡片与详情页始终一致
  return <McpClient servers={mcpServers} locale={locale} />;
}
