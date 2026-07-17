import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import tools from '@/data/tools.json';
import { generateAlternates } from '@/lib/seo';
import CategoryClient from './CategoryClient';

// All available categories derived from tools data
const CATEGORIES = [
  'Chat', 'Image', 'Code', 'Writing', 'Video',
  'Audio', 'Search', 'Platform', 'Developer', 'Agent', 'Design',
] as const;

// Map category to URL slug
const categoryToSlug = (cat: string) => cat.toLowerCase();
const slugToCategory = (slug: string) =>
  CATEGORIES.find((c) => categoryToSlug(c) === slug);

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: categoryToSlug(cat) }));
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) return {};

  const categoryTools = tools.filter((t) => t.category === category);
  const title = `Best ${category} AI Tools in 2026 - ${categoryTools.length} Tools | CATAI`;
  const description = `Discover the top ${categoryTools.length} AI ${category.toLowerCase()} tools. Compare features, pricing, and find the best ${category.toLowerCase()} AI tool for your needs.`;

  return {
    title,
    description,
    alternates: generateAlternates(`/category/${slug}`),
    openGraph: {
      title,
      description,
      url: `https://catai.cc.cd/en/category/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  const categoryTools = tools.filter((t) => t.category === category);

  // JSON-LD: ItemList schema for category
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${category} AI Tools`,
    description: `Top ${category.toLowerCase()} AI tools comparison`,
    numberOfItems: categoryTools.length,
    itemListElement: categoryTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `https://catai.cc.cd/en/tool/${tool.slug}`,
      description: tool.descriptionEn,
      image: tool.logo,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryClient
        category={category}
        slug={slug}
        tools={categoryTools}
        locale={locale}
      />
    </>
  );
}
