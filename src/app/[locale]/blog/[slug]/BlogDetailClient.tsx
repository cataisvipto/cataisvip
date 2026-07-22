'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Calendar, Clock, User, Share2, Link2, Check, ExternalLink } from 'lucide-react';
import { TwitterIcon, LinkedinIcon, FacebookIcon } from '@/components/SocialIcons';
import Image from 'next/image';
import BlogCover from '@/components/BlogCover';
import tools from '@/data/tools.json';
import { Tool, getLocalizedDescription } from '@/components/ToolCard';

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
  articleJsonLd: Record<string, unknown>;
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

  const siteUrl = 'https://cataito.com';
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
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let idx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle table blocks (consecutive | lines)
      if (line.startsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        i--; // for loop will increment

        const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
        const rows = tableLines.slice(2).filter(row => row.startsWith('|'));

        elements.push(
          <div key={idx++} className="overflow-x-auto my-6 rounded-xl border border-[var(--card-border)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--muted-bg)]">
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                  return (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-[var(--card-bg)]' : 'bg-[var(--muted-bg)]'}>
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-4 py-3 text-sm text-[var(--muted)] border-t border-[var(--card-border)]">{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={idx++} className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx++} className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={idx++} className="ml-6 text-[var(--muted)] mb-2 list-disc">{line.replace('- ', '')}</li>);
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={idx++} className="ml-6 text-[var(--muted)] mb-2 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
      } else if (line === '') {
        elements.push(<br key={idx++} />);
      } else {
        elements.push(<p key={idx++} className="text-[var(--muted)] mb-4 leading-relaxed">{line}</p>);
      }
    }

    return elements;
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
            <BlogCover
              src={post.coverImage}
              alt={title}
              width={1200}
              height={630}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium capitalize">
                {t(`categories.${post.category}`)}
              </span>
              <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                <Clock className="w-4 h-4" />
                {post.readTime} {t('readTime')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
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
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-[var(--card-border)]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-[var(--muted-bg)] text-[var(--muted)] rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Social Sharing */}
          <div className="mt-8 p-6 bg-[var(--muted-bg)] rounded-2xl">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] text-[var(--foreground)] rounded-lg hover:bg-[var(--card-border)] transition text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Link2 className="w-4 h-4" />}
                {copied ? t('linkCopied') : t('copyLink')}
              </button>
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-500" />
                {t('relatedTools')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tool/${tool.slug}`}
                    className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)] hover:shadow-sm transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/90 border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <Image
                        src={tool.logo}
                        alt={tool.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--foreground)] text-sm truncate">{tool.name}</div>
                      <div className="text-xs text-[var(--muted)] truncate">
                        {getLocalizedDescription(tool as Tool, locale)}
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
