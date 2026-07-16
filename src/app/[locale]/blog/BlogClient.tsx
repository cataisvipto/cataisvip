'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';

interface BlogPost {
  slug: string;
  title: { en: string; zh: string };
  excerpt: { en: string; zh: string };
  content: { en: string; zh: string };
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'news', 'comparison', 'listicle', 'tutorial'];

  const filteredPosts = posts.filter((post) => {
    const title = locale === 'zh' ? post.title.zh : post.title.en;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(`categories.${cat}` as any)}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              const title = locale === 'zh' ? post.title.zh : post.title.en;
              const excerpt = locale === 'zh' ? post.excerpt.zh : post.excerpt.en;

              return (
                <article key={post.slug} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Cover Image */}
                  <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category & Meta */}
                    <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium capitalize">
                        {t(`categories.${post.category}` as any)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime} {t('readTime')}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition">
                        {title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {post.publishedAt}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                      >
                        {t('readMore')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No articles found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
