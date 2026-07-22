'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DisclaimerClient() {
  const locale = useLocale();
  const t = useTranslations('disclaimer');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          {tCommon('backToHome')}
        </Link>

        <article className="prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{t('title')}</h1>
          <p className="text-sm text-[var(--muted)] mb-8">{tCommon('lastUpdated')}: July 15, 2026</p>

          <div className="space-y-6 text-[var(--muted)] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('general_title')}</h2>
              <p>{t('general_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('endorse_title')}</h2>
              <p>{t('endorse_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('links_title')}</h2>
              <p>{t('links_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('links_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('pricing_title')}</h2>
              <p>{t('pricing_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('submit_title')}</h2>
              <p>{t('submit_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('risks_title')}</h2>
              <p>{t('risks_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('risks_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('ads_title')}</h2>
              <p>{t('ads_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('liability_title')}</h2>
              <p>{t('liability_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('liability_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('trademark_title')}</h2>
              <p>{t('trademark_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('changes_title')}</h2>
              <p>{t('changes_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('contact_title')}</h2>
              <p>{t('contact_text')}</p>
              <p className="mt-2"><strong>Email:</strong> hello@cataito.com</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
