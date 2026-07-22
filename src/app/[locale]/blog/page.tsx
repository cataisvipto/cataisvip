import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import blogPosts from '@/data/blogPosts.json';
import BlogClient from './BlogClient';
import { generateAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AI Blog & News - Cataito',
  description: 'Stay updated with the latest AI trends, tool reviews, comparisons, and industry insights.',
  alternates: generateAlternates('/blog'),
};

export default function BlogPage() {
  return <BlogClient posts={blogPosts} />;
}
