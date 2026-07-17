'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyClient() {
  const locale = useLocale();
  const t = useTranslations('privacy');
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
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('intro_title')}</h2>
              <p>{t('intro_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('collect_title')}</h2>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">{t('collect_auto_title')}</h3>
              <p>{t('collect_auto_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('collect_auto_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2 mt-4">{t('collect_user_title')}</h3>
              <p>{t('collect_user_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('use_title')}</h2>
              <p>{t('use_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('use_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('third_title')}</h2>
              <p>{t('third_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('third_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-2">{t('third_text2')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('cookies_title')}</h2>
              <p>{t('cookies_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('links_title')}</h2>
              <p>{t('links_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('security_title')}</h2>
              <p>{t('security_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('rights_title')}</h2>
              <p>{t('rights_text')}</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {t.raw('rights_items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-2">{t('rights_text2')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('children_title')}</h2>
              <p>{t('children_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('changes_title')}</h2>
              <p>{t('changes_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">{t('contact_title')}</h2>
              <p>{t('contact_text')}</p>
              <p className="mt-2"><strong>Email:</strong> cataisvip@gmail.com</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
