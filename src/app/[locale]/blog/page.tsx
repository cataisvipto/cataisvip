import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import blogPosts from '@/data/blogPosts.json';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'AI Blog & News - CATAI',
  description: 'Stay updated with the latest AI trends, tool reviews, comparisons, and industry insights.',
};

export default function BlogPage() {
  return <BlogClient posts={blogPosts} />;
}
