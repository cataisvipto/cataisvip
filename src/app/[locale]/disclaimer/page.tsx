import type { Metadata } from 'next';
import DisclaimerClient from './DisclaimerClient';
import { generateAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Disclaimer - CATAI AI Ecosystem Portal',
  description: 'Disclaimer for CATAI - Your gateway to the global AI ecosystem.',
  alternates: generateAlternates('/disclaimer'),
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
