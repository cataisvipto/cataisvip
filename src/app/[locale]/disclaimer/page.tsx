import type { Metadata } from 'next';
import DisclaimerClient from './DisclaimerClient';

export const metadata: Metadata = {
  title: 'Disclaimer - CATAI AI Ecosystem Portal',
  description: 'Disclaimer for CATAI - Your gateway to the global AI ecosystem.',
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
