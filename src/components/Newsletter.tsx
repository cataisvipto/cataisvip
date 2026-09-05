'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Check, Loader2 } from 'lucide-react';
import { useTimeTrap, useHoneypot, useTurnstile, HONEYPOT_FIELD } from '@/lib/form-guard';

export default function Newsletter() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const timeOk = useTimeTrap();
  const honeypot = useHoneypot();
  const turnstile = useTurnstile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMessage(t('invalidEmail'));
      return;
    }

    // 防滥用：蜜罐命中或提交过快 = 机器人，静默丢弃（假装成功，不给修复线索）
    if (honeypot.triggered || !timeOk()) {
      setStatus('success');
      return;
    }
    // Turnstile 已配置但用户未完成验证：明确提示
    if (turnstile.widget && !turnstile.token) {
      setStatus('error');
      setErrorMessage(t('error'));
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
          // Turnstile token：需在 Web3Forms 后台配置对应 secret key 才会服务端校验
          ...(turnstile.token ? { 'cf-turnstile-response': turnstile.token } : {}),
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
          {/* 蜜罐：视觉隐藏，机器人会填 */}
          <input
            type="text"
            name={HONEYPOT_FIELD}
            value={honeypot.value}
            onChange={(e) => honeypot.setValue(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />
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
        {turnstile.widget && <div className="mt-4 flex justify-center">{turnstile.widget}</div>}
        
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