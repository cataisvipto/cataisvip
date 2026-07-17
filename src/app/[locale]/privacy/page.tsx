import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { generateAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy - CATAI AI Ecosystem Portal',
  description: 'Privacy Policy for CATAI - Your gateway to the global AI ecosystem.',
  alternates: generateAlternates('/privacy'),
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
