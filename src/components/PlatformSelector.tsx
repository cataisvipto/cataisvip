'use client';

import { useTranslations } from 'next-intl';
import { Monitor, Apple, Terminal } from 'lucide-react';
import { usePlatform, type Platform } from './PlatformContext';

/**
 * 操作系统选择器 — 教程详情页文首使用。
 * 选择后所有平台 Tabs 联动切换，并记忆到 localStorage。
 */
export default function PlatformSelector() {
  const t = useTranslations('tutorials');
  const { platform, setPlatform } = usePlatform();

  const options: { id: Platform; label: string; icon: React.ReactNode }[] = [
    { id: 'windows', label: t('platforms.windows'), icon: <Monitor className="w-4 h-4" /> },
    { id: 'macos', label: t('platforms.macos'), icon: <Apple className="w-4 h-4" /> },
    { id: 'linux', label: t('platforms.linux'), icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <span className="text-sm font-medium text-[var(--muted)] mr-1">
        {t('selectPlatform')}:
      </span>
      <div className="flex items-center gap-1.5 bg-[var(--muted-bg)] rounded-full p-1 border border-[var(--muted-border)]">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPlatform(opt.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              platform === opt.id
                ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
