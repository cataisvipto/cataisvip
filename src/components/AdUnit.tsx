'use client';

import { useEffect, useRef } from 'react';

// 可复用的 AdSense 广告单元组件。
// 依赖 [locale]/layout.tsx 里 <AdSense /> 注入的 adsbygoogle.js（全站一次性加载）。
// 审核通过前 NEXT_PUBLIC_ADSENSE_CLIENT / AD_UNIT 为空 → 返回 null，零影响。
//
// 使用约定：仅在长内容页（博客详情 / 工具详情）插入，
// 列表页、排行榜、MCP/Skills 网格页不要放——交互目录页插广告会踩
// Google Better Ads Standards 违规。
interface AdUnitProps {
  /** AdSense 广告位 ID（广告单元编号） */
  unit: string;
  /** 可选：广告上方说明文案（i18n 翻译后传入），符合透明性要求 */
  label?: string;
}

export default function AdUnit({ unit, label }: AdUnitProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client || !unit || !ref.current) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {
      /* 静默失败：未审核通过时不报错、不白屏 */
    }
  }, [client, unit]);

  if (!client || !unit) return null;

  return (
    <div ref={ref} className="my-10">
      {label ? (
        <p className="mb-2 text-center text-xs tracking-wide text-[var(--muted)]">
          {label}
        </p>
      ) : null}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={unit}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
