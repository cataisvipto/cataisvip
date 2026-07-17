'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { ArrowLeft, Calendar, Clock, User, Share2, Link2, Check, ExternalLink } from 'lucide-react';
import { TwitterIcon, LinkedinIcon, FacebookIcon } from '@/components/SocialIcons';
import Image from 'next/image';
import tools from '@/data/tools.json';

interface BlogPost {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

interface BlogDetailClientProps {
  post: BlogPost;
  locale: string;
  articleJsonLd: Record<string, any>;
}

// Localize a multilingual field, falling back to English so the blog follows the site language
const getLocalized = (field: Record<string, string>, locale: string) =>
  field?.[locale] || field?.en || '';

export default function BlogDetailClient({ post, locale, articleJsonLd }: BlogDetailClientProps) {
  const t = useTranslations('blog');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const title = getLocalized(post.title, locale);
  const content = getLocalized(post.content, locale);

  // Find related tools (blog tags match tool name/slug)
  const relatedTools = tools.filter((tool) => {
    const postTags = (post.tags || []).map((t) => t.toLowerCase());
    const toolName = tool.name.toLowerCase();
    const toolSlug = tool.slug.toLowerCase();
    return postTags.some(
      (tag) => tag === toolName || tag === toolSlug || tag.includes(toolSlug)
    );
  }).slice(0, 4);

  const siteUrl = 'https://catai.cc.cd';
  const postUrl = `${siteUrl}/${locale}/blog/${post.slug}`;
  const shareText = title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 text-gray-700 mb-2 list-disc">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={index} className="ml-6 text-gray-700 mb-2 list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-700 mb-4 leading-relaxed">{line}</p>;
    });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: t('title') || 'Blog', href: '/blog' },
              { name: title },
            ]}
            locale={locale}
          />

          {/* Cover Image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={title}
              width={1200}
              height={630}
              className="w-full h-full object-cover"
              unoptimized
              priority
            />
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium capitalize">
                {t(`categories.${post.category}` as any)}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {post.readTime} {t('readTime')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.publishedAt}
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {renderContent(content)}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Social Sharing */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-500" />
              {t('share')}
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                <TwitterIcon className="w-4 h-4" />
                {t('shareOnTwitter')}
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <LinkedinIcon className="w-4 h-4" />
                {t('shareOnLinkedIn')}
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              >
                <FacebookIcon className="w-4 h-4" />
                {t('shareOnFacebook')}
              </a>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
                {copied ? t('linkCopied') : t('copyLink')}
              </button>
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-500" />
                {locale === 'zh' ? '相关工具推荐' : 'Related Tools'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tool/${tool.slug}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition"
                  >
                    <Image
                      src={tool.logo}
                      alt={tool.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg object-contain"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{tool.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {locale === 'zh' ? tool.description : tool.descriptionEn}
                      </div>
                    </div>
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
