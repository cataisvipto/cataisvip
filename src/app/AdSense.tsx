import Script from 'next/script';
import { ADSENSE_CLIENT } from '@/lib/adsense';

// Google AdSense 主脚本（官方要求置于 <head>、覆盖每个网页）。
// 静态导出（output: export）+ Cloudflare Pages 架构下无法动态生成 nonce，
// 因此 CSP 走域名白名单方案（见 public/_headers）。
export default function AdSense() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
