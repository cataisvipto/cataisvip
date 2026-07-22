'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Chat', 'Image', 'Code', 'Writing', 'Video', 'Audio', 'Search', 'Design', 'Agent', 'Developer', 'Platform'];
const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/cataisvip@gmail.com';

export default function SubmitPage() {
  const t = useTranslations('submit');
  const tCommon = useTranslations('common');
  const tCategories = useTranslations('categories');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🔔 New AI Resource Submission: ${formData.name}`,
          _template: 'table',
          'Resource Name': formData.name,
          'Website URL': formData.url,
          'Description': formData.description,
          'Category': formData.category,
          'Submitter Email': formData.email || 'Not provided',
          'Submitted From': window.location.href,
          'Locale': locale,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(t('submitError'));
      }
    } catch {
      setError(t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locale={locale}
      />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {tCommon('backToHome')}
        </Link>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] mt-2">{t('description')}</p>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-[var(--foreground)] mb-2">{t('success')}</p>
              <p className="text-sm text-[var(--muted)] mb-6">{t('successDetail')}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
              >
                {tCommon('backToHome')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot for spam */}
              <input type="text" name="_honey" style={{ display: 'none' }} />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Tool Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t('toolName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] bg-[var(--muted-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  placeholder="e.g. ChatGPT"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t('toolUrl')}
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] bg-[var(--muted-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  placeholder="https://..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t('toolDescription')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] bg-[var(--muted-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  placeholder={locale === 'zh' ? '简要描述这个资源...' : 'Briefly describe this resource...'}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t('toolCategory')}
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] bg-[var(--muted-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                >
                  <option value="">{t('selectCategory')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{tCategories(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Submitter Email (optional) */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t('yourEmail')}
                  <span className="text-[var(--muted)] font-normal ml-1">({t('optional')})</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] bg-[var(--muted-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  placeholder={locale === 'zh' ? '您的邮箱（可选，方便我们回复您）' : 'Your email (optional, so we can reply to you)'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium rounded-xl hover:opacity-90 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? t('submitting') : t('submitBtn')}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
