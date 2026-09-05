'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, ADSENSE_UNIT } from '@/lib/adsense';

// 可复用的 AdSense 广告单元组件。
// 依赖 [locale]/layout.tsx 里 <AdSense /> 注入的 adsbygoogle.js（全站一次性加载）。
// 配置集中在 src/lib/adsense.ts（硬编码，ID 本身随 HTML 暴露，不敏感）。
// 临时关停：把 ADSENSE_UNIT 置空即 return null，不渲染任何广告元素。
//
// 使用约定：仅在长内容页（博客详情 / 工具详情）插入，
// 列表页、排行榜、MCP/Skills 网格页不要放——交互目录页插广告会踩
// Google Better Ads Standards 违规。
interface AdUnitProps {
  /** 可选：广告上方说明文案（i18n 翻译后传入），符合透明性要求 */
  label?: string;
}

export default function AdUnit({ label }: AdUnitProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_UNIT || !ref.current) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {
      /* 静默失败：配置缺失时不报错、不白屏 */
    }
  }, []);

  if (!ADSENSE_CLIENT || !ADSENSE_UNIT) return null;

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
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_UNIT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
