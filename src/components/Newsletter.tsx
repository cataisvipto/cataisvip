'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Check, Loader2 } from 'lucide-react';

export default function Newsletter() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMessage(t('invalidEmail'));
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '9ec58a55-eb5e-440e-b5d7-887b53f460ee',
          email: email,
          from_name: 'Cataito Newsletter',
          subject: 'New Newsletter Subscription - Cataito',
          message: `New subscription from: ${email}`,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(t('error'));
      }
    } catch {
      setStatus('error');
      setErrorMessage(t('error'));
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
          <Check className="w-7 h-7 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{t('success')}</h3>
        <p className="text-[var(--muted)] text-sm">{t('description')}</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl shadow-[var(--card-shadow)] p-8 sm:p-10">
      <div className="max-w-xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--muted-bg)] rounded-full mb-4">
          <Mail className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">{t('title')}</h3>
        <p className="text-[var(--muted)] mb-6">{t('description')}</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-2.5 rounded-full border border-[var(--muted-border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 bg-[var(--primary)] text-white font-medium rounded-full hover:bg-[var(--primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              t('button')
            )}
          </button>
        </form>
        
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
        )}
        
        <p className="mt-4 text-xs text-[var(--muted)]">
          {t('privacy')}
        </p>
      </div>
    </div>
  );
}