'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { usePlatform, type Platform } from './PlatformContext';

interface PlatformTabsProps {
  /** 各平台的内容块（仅包含数据中出现的平台） */
  blocks: Partial<Record<Platform, ReactNode>>;
}

/**
 * 平台内容 Tabs — 显示当前选中系统的内容，点击 tab 可切换（联动全局选择）。
 */
export default function PlatformTabs({ blocks }: PlatformTabsProps) {
  const t = useTranslations('tutorials');
  const { platform, setPlatform } = usePlatform();

  const available = (Object.keys(blocks) as Platform[]).filter(
    (p) => blocks[p] != null
  );

  // 当前选中平台不在可用列表时，回退到第一个可用平台
  const active: Platform = available.includes(platform)
    ? platform
    : (available[0] as Platform);

  const labels: Record<Platform, string> = {
    windows: t('platforms.windows'),
    macos: t('platforms.macos'),
    linux: t('platforms.linux'),
  };

  return (
    <div className="my-6">
      {/* Tab headers */}
      <div className="flex items-center gap-1.5 bg-[var(--muted-bg)] rounded-t-xl px-2 pt-2 border border-b-0 border-[var(--muted-border)]">
        {available.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
              p === active
                ? 'bg-[var(--card-bg)] text-[var(--primary)] border border-b-0 border-[var(--muted-border)] -mb-px'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>
      {/* Active platform content */}
      <div className="bg-[var(--card-bg)] border border-[var(--muted-border)] rounded-b-xl rounded-tr-xl p-5">
        {blocks[active]}
      </div>
    </div>
  );
}
