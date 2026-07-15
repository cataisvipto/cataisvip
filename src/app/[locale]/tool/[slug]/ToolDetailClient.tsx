'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tool } from '@/components/ToolCard';
import toolDetails from '@/data/toolDetails.json';
import { ArrowLeft, ExternalLink, Globe, Star, CheckCircle, XCircle, Lightbulb, DollarSign, Zap, Info } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ToolDetailClientProps {
  tool: Tool;
  locale: string;
}

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700',
  'Freemium': 'bg-blue-100 text-blue-700',
  'Paid': 'bg-amber-100 text-amber-700',
  'Open Source': 'bg-violet-100 text-violet-700',
  'API': 'bg-purple-100 text-purple-700',
};

// Helper to get localized content
const getLocalized = (content: any, locale: string) => {
  if (typeof content === 'string') return content;
  return content?.[locale] || content?.['en'] || '';
};

export default function ToolDetailClient({ tool, locale }: ToolDetailClientProps) {
  const t = useTranslations('common');
  const tCategories = useTranslations('categories');
  const tTags = useTranslations('tags');
  const [searchQuery, setSearchQuery] = useState('');
  const description = locale === 'zh' ? tool.description : tool.descriptionEn;
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  const details = (toolDetails as any)[tool.slug];

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: displayName,
    applicationCategory: tCategories(tool.category as any),
    operatingSystem: 'Web',
    url: tool.url,
    image: tool.logo,
    description: description,
    offers: {
      '@type': 'Offer',
      price: tool.tags.includes('Free') ? '0' : tool.tags.includes('Paid') ? '' : '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToHome')}
        </Link>

        <article className="space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src={tool.logo}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                    {tool.featured && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {t('featured')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{tCategories(tool.category as any)}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {locale === 'zh' ? tTags(tag as any) : tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                {t('about')}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {description}
              </p>
            </div>

            {/* Visit Button */}
            <div className="p-8 pt-0">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium rounded-full hover:opacity-90 transition shadow-md"
              >
                {t('visit')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Rich Details (if available) */}
          {details && (
            <>
              {/* Features */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  {t('keyFeatures')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalized(details.features, locale).map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-500" />
                  {t('pricing')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(details.pricing).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 capitalize mb-1">{key}</div>
                      <div className="text-gray-900">{getLocalized(value, locale)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-indigo-500" />
                  {t('useCases')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalized(details.useCases, locale).map((useCase: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    {t('pros')}
                  </h2>
                  <div className="space-y-3">
                    {getLocalized(details.pros, locale).map((pro: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    {t('cons')}
                  </h2>
                  <div className="space-y-3">
                    {getLocalized(details.cons, locale).map((con: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Update */}
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-100 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  {t('latestUpdate')}
                </h2>
                <p className="text-gray-700 leading-relaxed">{getLocalized(details.latestUpdate, locale)}</p>
              </div>
            </>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
