'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'catai-consent';

type ConsentState = 'granted' | 'denied';

// 与 GoogleAnalytics.tsx 的 gtag 存根同语义：push 到 dataLayer 队列
function pushConsentUpdate(state: ConsentState) {
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.gtag =
    w.gtag ||
    function (...args: unknown[]) {
      w.dataLayer!.push(args);
    };
  w.gtag('consent', 'update', {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

export default function ConsentBanner() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'granted' || stored === 'denied') {
        // 已有选择：应用到本页（Consent Mode 信号跨页持续）
        pushConsentUpdate(stored);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (state: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch {
      // 隐私模式下 localStorage 不可用：仅本页生效
    }
    pushConsentUpdate(state);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow-hover)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">{t('consentTitle')}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t('consentText')}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose('denied')}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
          >
            {t('consentReject')}
          </button>
          <button
            onClick={() => choose('granted')}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            {t('consentAccept')}
          </button>
        </div>
      </div>
    </div>
  );
}
