'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Target, Compass, ShieldCheck, Scale, Mail, Send, Check } from 'lucide-react';
import { tools } from '@/data/aggregated';

export default function AboutClient() {
  const locale = useLocale();
  const t = useTranslations('about');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          {tCommon('backToHome')}
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-lg text-[var(--muted)] mt-3">{t('subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Mission */}
          <section aria-labelledby="about-mission" className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
            <h2 id="about-mission" className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              {t('missionTitle')}
            </h2>
            <div className="space-y-3 text-[var(--muted)] leading-relaxed">
              <p>{t('missionText1')}</p>
              <p>{t('missionText2')}</p>
            </div>
          </section>

          {/* What we offer */}
          <section aria-labelledby="about-what" className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
            <h2 id="about-what" className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              {t('whatTitle')}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-4">{t('whatText', { count: tools.length })}</p>
            <ul className="space-y-2.5">
              {t.raw('whatItems').map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2.5 text-[var(--muted)] leading-relaxed">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Methodology */}
          <section aria-labelledby="about-method" className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
            <h2 id="about-method" className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              {t('methodTitle')}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-4">{t('methodText')}</p>
            <ul className="space-y-2.5">
              {t.raw('methodItems').map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2.5 text-[var(--muted)] leading-relaxed">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Independence */}
          <section aria-labelledby="about-independence" className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
            <h2 id="about-independence" className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              {t('independenceTitle')}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed">{t('independenceText')}</p>
          </section>

          {/* Contact */}
          <section aria-labelledby="about-contact" className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
            <h2 id="about-contact" className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              {t('contactTitle')}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-5">{t('contactText')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:hello@cataito.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition shadow-sm"
              >
                <Mail className="w-4 h-4" />
                hello@cataito.com
              </a>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--muted-bg)] text-[var(--foreground)] text-sm font-medium rounded-full hover:bg-[var(--muted-border)] hover:text-[var(--primary)] transition"
              >
                <Send className="w-4 h-4" />
                {t('contactSubmit')}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
