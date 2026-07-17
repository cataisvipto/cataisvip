'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Tool, getLocalizedDescription } from '@/components/ToolCard';
import toolDetails from '@/data/toolDetails.json';
import tools from '@/data/tools.json';
import blogPosts from '@/data/blogPosts.json';
import { ArrowLeft, ExternalLink, Globe, Star, CheckCircle, XCircle, Lightbulb, DollarSign, Zap, Info, Share2, Link2, Check, Newspaper } from 'lucide-react';
import { TwitterIcon, LinkedinIcon, FacebookIcon } from '@/components/SocialIcons';
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
  const [copied, setCopied] = useState(false);
  const description = getLocalizedDescription(tool, locale);
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  const details = (toolDetails as any)[tool.slug];

  // Find related tools in the same category (exclude current tool)
  const relatedTools = tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4);

  // Find related blog posts (tags match tool name/slug)
  const relatedPosts = (blogPosts as any[]).filter((post) => {
    const postTags = (post.tags || []).map((t: string) => t.toLowerCase());
    const toolName = tool.name.toLowerCase();
    const toolSlug = tool.slug.toLowerCase();
    return postTags.some(
      (tag: string) => tag === toolName || tag === toolSlug || tag.includes(toolSlug)
    );
  }).slice(0, 3);

  const getLocalized = (field: any, loc: string) =>
    typeof field === 'string' ? field : field?.[loc] || field?.en || '';

  // Social sharing
  const siteUrl = 'https://catai.cc.cd';
  const toolUrl = `${siteUrl}/${locale}/tool/${tool.slug}`;
  const shareText = `${displayName} - CATAI AI Ecosystem Portal`;
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(toolUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolUrl)}`,
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(toolUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { name: t('tools') || 'Tools', href: '/' },
            { name: tCategories(tool.category as any), href: `/category/${tool.category.toLowerCase()}` },
            { name: displayName },
          ]}
          locale={locale}
        />

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

            {/* Social Sharing */}
            <div className="px-8 pb-8">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Share2 className="w-4 h-4" />
                <span>Share this tool</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-xs font-medium">
                  <TwitterIcon className="w-3.5 h-3.5" /> Twitter
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium">
                  <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium">
                  <FacebookIcon className="w-3.5 h-3.5" /> Facebook
                </a>
                <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs font-medium">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
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

          {/* Related Tools (Same Category) */}
          {relatedTools.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                {locale === 'zh' ? `同类工具推荐（${tCategories(tool.category as any)}）` : `Related ${tCategories(tool.category as any)} Tools`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTools.map((rt) => (
                  <Link
                    key={rt.slug}
                    href={`/tool/${rt.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition"
                  >
                    <Image
                      src={rt.logo}
                      alt={rt.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg object-contain"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {locale === 'zh' && rt.nameZh ? rt.nameZh : rt.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {locale === 'zh' ? rt.description : rt.descriptionEn}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Blog Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-500" />
                {locale === 'zh' ? '相关文章' : 'Related Articles'}
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
                  >
                    <div className="text-sm text-indigo-600 mb-1 capitalize">
                      {post.category}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {getLocalized(post.title, locale)}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {getLocalized(post.excerpt, locale)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
