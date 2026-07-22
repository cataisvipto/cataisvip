import { getTranslations } from 'next-intl/server';
import SkillsClient from './SkillsClient';
import skills from '@/data/skills.json';

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
  const t = await getTranslations({ locale, namespace: 'skills' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;

  // Fetch live stars for all skills at build time
  const starsEntries = await Promise.all(
    skills.map(async (skill) => {
      const stars = await fetchGitHubStars(skill.repo, skill.stars);
      return [skill.slug, stars] as const;
    })
  );
  const starsMap: Record<string, number> = Object.fromEntries(starsEntries);

  return <SkillsClient skills={skills} locale={locale} starsMap={starsMap} />;
}
