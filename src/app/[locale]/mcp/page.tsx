import { getTranslations, setRequestLocale } from 'next-intl/server';
import McpClient from './McpClient';
import mcpServers from '@/data/mcp.json';
import { generateAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

async function fetchGitHubStars(repo: string, staticStars: number): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return staticStars;
    const data = await res.json();
    return data.stargazers_count ?? staticStars;
  } catch {
    return staticStars;
  } finally {
    clearTimeout(timeout);
  }
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

  // Fetch live stars for all MCP servers at build time
  const starsEntries = await Promise.all(
    mcpServers.map(async (entry) => {
      const stars = await fetchGitHubStars(entry.repo, entry.stars);
      return [entry.slug, stars] as const;
    })
  );
  const starsMap: Record<string, number> = Object.fromEntries(starsEntries);

  return <McpClient servers={mcpServers} locale={locale} starsMap={starsMap} />;
}
