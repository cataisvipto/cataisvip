import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import GoogleAnalytics from '../GoogleAnalytics';
import { ThemeProvider } from '@/components/ThemeProvider';
import { routing } from '@/i18n/routing';
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
  metadataBase: new URL('https://cataito.com'),
  title: "Cataito - Best AI Tools, Models & Agents Directory | Free Reviews",
  description: "Discover 180+ free and paid AI tools. Compare features, pricing and reviews — from ChatGPT, DeepSeek, Kling AI to Grok. Your AI toolkit starts here.",
  keywords: "AI portal, AI tools directory, AI models, AI agents, ChatGPT, DeepSeek, Kling AI, Grok, Gemini, Claude, AI reviews, free AI tools, artificial intelligence",
  authors: [{ name: "Cataito" }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Cataito - AI Ecosystem Portal",
    description: "Discover AI models, agents, tools, and resources from around the world.",
    type: "website",
    locale: "en_US",
    siteName: "Cataito",
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Cataito' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cataito - AI Ecosystem Portal",
    description: "Your gateway to the global AI ecosystem.",
    images: ['/logo.png'],
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // 启用静态渲染：告知 next-intl 当前请求 locale，避免 getMessages() 因读取 headers() 而退化为动态渲染
  setRequestLocale(locale);

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
