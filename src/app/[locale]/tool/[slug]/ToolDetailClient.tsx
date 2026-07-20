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
import { ArrowLeft, ExternalLink, Globe, Star, Building2, CheckCircle, XCircle, Lightbulb, DollarSign, Zap, Info, Share2, Link2, Check, Newspaper, BookOpen, Clipboard, LayoutGrid } from 'lucide-react';
import { TwitterIcon, LinkedinIcon, FacebookIcon } from '@/components/SocialIcons';
import Newsletter from '@/components/Newsletter';
import Image from 'next/image';
import { useState } from 'react';

interface ToolDetailClientProps {
  tool: Tool;
  locale: string;
}

const TAG_COLORS: Record<string, string> = {
  'Free': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Freemium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Paid': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Open Source': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'API': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
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
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const description = getLocalizedDescription(tool, locale);
  const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
  const details = (toolDetails as any)[tool.slug];

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

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
    setCopiedIndex('share-link');
    setTimeout(() => setCopiedIndex(null), 2000);
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
            { name: tCategories(tool.category as any), href: `/category/${tool.category.toLowerCase()}` },
            { name: displayName },
          ]}
          locale={locale}
        />

        <article className="space-y-8">
          {/* Header Card */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-[var(--card-border)]">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-white/90 border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">{displayName}</h1>
                    {tool.featured && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {t('featured')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{tCategories(tool.category as any)}</span>
                  </div>

                  {tool.developer && (
                    <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{locale === 'zh' && tool.developerZh ? tool.developerZh : tool.developer}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
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
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                {t('about')}
              </h2>
              <p className="text-[var(--muted)] leading-relaxed text-lg">
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
              <div className="flex items-center gap-2 mb-3 text-sm text-[var(--muted)]">
                <Share2 className="w-4 h-4" />
                <span>{t('shareTool')}</span>
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
                <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-xs font-medium shadow-sm">
                  {copiedIndex === 'share-link' ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copiedIndex === 'share-link' ? t('linkCopied') : t('copyLink')}
                </button>
              </div>
            </div>
          </div>

          {/* Rich Details (if available) */}
          {details && (
            <>
              {/* Features */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  {t('keyFeatures')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalized(details.features, locale).map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[var(--muted)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-500" />
                  {t('pricing')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(details.pricing).map(([key, value]) => (
                    <div key={key} className="p-4 bg-[var(--muted-bg)] rounded-xl">
                      <div className="text-sm font-medium text-[var(--muted)] capitalize mb-1">{key}</div>
                      <div className="text-[var(--foreground)]">{getLocalized(value, locale)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-indigo-500" />
                  {t('useCases')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalized(details.useCases, locale).map((useCase: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-[var(--muted)]">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    {t('pros')}
                  </h2>
                  <div className="space-y-3">
                    {getLocalized(details.pros, locale).map((pro: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[var(--muted)]">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    {t('cons')}
                  </h2>
                  <div className="space-y-3">
                    {getLocalized(details.cons, locale).map((con: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-[var(--muted)]">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Update */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  {t('latestUpdate')}
                </h2>
                <p className="text-[var(--muted)] leading-relaxed">{getLocalized(details.latestUpdate, locale)}</p>
              </div>
            </>
          )}

          {/* Tutorial Section - redesigned for clarity and copy-ability */}
          {details?.tutorial && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-8 py-6 border-b border-[var(--card-border)] bg-[var(--card-bg)] bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                      {details.tutorial[locale]?.title || details.tutorial.en?.title}
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      {t('tutorialSubtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="p-8">
                {(details.tutorial[locale]?.steps || details.tutorial.en?.steps || []).map((step: any, index: number) => {
                  const commands = step.commands || [];
                  return (
                    <div key={index} className={`flex gap-6 ${index > 0 ? 'mt-8 pt-8 border-t border-[var(--card-border)]' : ''}`}>
                      {/* Step number */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-base font-bold text-white">{step.step}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{step.title}</h3>

                        {step.content && (
                          <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">{step.content}</p>
                        )}

                        {/* Command blocks */}
                        {commands.length > 0 && (
                          <div className="space-y-2.5">
                            {commands.map((cmd: any, cmdIndex: number) => {
                              const cmdId = `${step.step}-${cmdIndex}`;
                              return (
                                <div key={cmdIndex} className="group">
                                  {cmd.label && (
                                    <div className="text-xs font-medium text-[var(--muted)] mb-1 ml-1">{cmd.label}</div>
                                  )}
                                  <div className="flex items-stretch">
                                    {/* Code */}
                                    <div className="flex-1 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-l-lg px-4 py-2.5 overflow-x-auto">
                                      <code className="text-sm text-[var(--foreground)] font-mono whitespace-nowrap select-all">{cmd.code}</code>
                                    </div>
                                    {/* Copy button */}
                                    <button
                                      onClick={() => handleCopy(cmd.code, cmdId)}
                                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[var(--muted-bg)] border border-l-0 border-[var(--card-border)] rounded-r-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                                      title={t('copyCommand')}
                                    >
                                      {copiedIndex === cmdId ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          <span className="text-emerald-500">{t('copied')}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clipboard className="w-3.5 h-3.5" />
                                          <span className="hidden sm:inline">{t('copy')}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Tools (Same Category) */}
          {relatedTools.length > 0 && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-500" />
                {t('relatedTools', { category: tCategories(tool.category as any) })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedTools.map((rt) => {
                  const rtName = locale === 'zh' && rt.nameZh ? rt.nameZh : rt.name;
                  const rtDesc = getLocalizedDescription(rt as Tool, locale);
                  const rtDev = locale === 'zh' && (rt as Tool).developerZh ? (rt as Tool).developerZh : (rt as Tool).developer;
                  return (
                    <Link
                      key={rt.slug}
                      href={`/tool/${rt.slug}`}
                      className="group flex items-start gap-4 p-5 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--muted-bg)] hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/90 border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <Image
                          src={rt.logo}
                          alt={rtName}
                          width={28}
                          height={28}
                          className="w-7 h-7 object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[var(--foreground)] text-sm truncate group-hover:text-[var(--primary)] transition">
                          {rtName}
                        </div>
                        {rtDev && (
                          <div className="text-xs text-[var(--muted)] mt-0.5">
                            {rtDev}
                          </div>
                        )}
                        <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed line-clamp-2">
                          {rtDesc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Blog Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-500" />
                {t('relatedArticles')}
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--muted-bg)] transition"
                  >
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 capitalize">
                      {post.category}
                    </div>
                    <h3 className="font-medium text-[var(--foreground)] mb-1">
                      {getLocalized(post.title, locale)}
                    </h3>
                    <p className="text-sm text-[var(--muted)] line-clamp-2">
                      {getLocalized(post.excerpt, locale)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Newsletter */}
        <div className="mt-8">
          <Newsletter locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
