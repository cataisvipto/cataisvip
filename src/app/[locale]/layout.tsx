import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import GoogleAnalytics from '../GoogleAnalytics';
import { ThemeProvider } from '@/components/ThemeProvider';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CATAI - AI Ecosystem Portal | Your Gateway to AI",
  description: "Your gateway to the global AI ecosystem. Discover AI models, agents, tools, and resources from around the world.",
  keywords: "AI portal, AI ecosystem, AI tools, AI models, AI agents, ChatGPT, Claude, Gemini, DeepSeek, AI resources, artificial intelligence",
  authors: [{ name: "CATAI" }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "CATAI - AI Ecosystem Portal",
    description: "Discover AI models, agents, tools, and resources from around the world.",
    type: "website",
    locale: "en_US",
    siteName: "CATAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CATAI - AI Ecosystem Portal",
    description: "Your gateway to the global AI ecosystem.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!['en', 'zh', 'ja', 'es', 'fr'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <GoogleAnalytics />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
