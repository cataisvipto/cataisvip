import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { generateAlternates } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import BadgeClient from './BadgeClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Cataito Badge — Add to Your README',
    description: 'Show the world your AI tool is listed on Cataito. Add our badge to your GitHub README and get discovered by more users.',
    alternates: generateAlternates('/badge', locale),
  };
}

export default async function BadgePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cataito Badge</h1>
          <p className="text-lg text-[var(--muted)] max-w-xl mx-auto">
            Show the world your AI tool is listed on Cataito — add our badge to your GitHub README.
          </p>
        </div>

        <BadgeClient />
      </main>
    </div>
  );
}