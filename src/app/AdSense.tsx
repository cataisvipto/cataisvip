import Script from 'next/script';

// Google AdSense 主脚本（官方要求置于 <head>、覆盖每个网页）。
// 静态导出（output: export）+ Cloudflare Pages 架构下无法动态生成 nonce，
// 因此 CSP 走域名白名单方案（见 public/_headers）。
// 审核通过前 NEXT_PUBLIC_ADSENSE_CLIENT 为空 → 整段静默不渲染，不影响现有站点。
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

export default function AdSense() {
  if (!client) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
