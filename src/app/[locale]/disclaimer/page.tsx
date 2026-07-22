import type { Metadata } from 'next';
import DisclaimerClient from './DisclaimerClient';
import { generateAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Disclaimer - Cataito AI Ecosystem Portal',
  description: 'Disclaimer for Cataito - Your gateway to the global AI ecosystem.',
  alternates: generateAlternates('/disclaimer'),
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
