import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import tutorialsData from '@/data/tutorials.json';
import { routing } from '@/i18n/routing';
import { generateAlternates, generateHowToJsonLd, BASE_URL } from '@/lib/seo';
import TutorialDetailClient from './TutorialDetailClient';
import type { Tutorial } from '../TutorialsClient';

export const revalidate = 3600;

const tutorials = tutorialsData as Tutorial[];

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const tutorial of tutorials) {
      params.push({ locale, slug: tutorial.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tutorial = tutorials.find((t) => t.slug === slug);

  if (!tutorial) {
    return { title: 'Tutorial Not Found - Cataito' };
  }

  const title = (tutorial.title as Record<string, string>)[locale] || tutorial.title.en;
  const excerpt = (tutorial.excerpt as Record<string, string>)[locale] || tutorial.excerpt.en;

  return {
    title: `${title} - Cataito Tutorials`,
    description: excerpt,
    alternates: generateAlternates(`/tutorials/${slug}`, locale),
    openGraph: {
      title: `${title} - Cataito`,
      description: excerpt,
      images: [tutorial.coverImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [tutorial.coverImage],
    },
  };
}

export default async function TutorialDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tutorial = tutorials.find((t) => t.slug === slug);

  if (!tutorial) {
    notFound();
  }

  const title = (tutorial.title as Record<string, string>)[locale] || tutorial.title.en;
  const excerpt = (tutorial.excerpt as Record<string, string>)[locale] || tutorial.excerpt.en;
  const content = (tutorial.content as Record<string, string>)[locale] || tutorial.content.en;

  const howToJsonLd = generateHowToJsonLd({
    title,
    description: excerpt,
    content,
    readTime: tutorial.readTime,
    url: `${BASE_URL}/${locale}/tutorials/${slug}`,
  });

  return (
    <TutorialDetailClient
      tutorial={tutorial}
      locale={locale}
      howToJsonLd={howToJsonLd}
      allTutorials={tutorials}
    />
  );
}
