import Script from 'next/script';

export default function GoogleAnalytics() {
  return (
    <>
      {/* Consent Mode v2：默认全部 denied（GDPR/EEA 合规），由 ConsentBanner 按用户选择 update。
          此内联块必须先于 gtag.js 入队，确保 default 信号先于任何命中处理。 */}
      <Script id="google-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
          gtag('js', new Date());
          gtag('config', 'G-S8N78PNHZW');
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-S8N78PNHZW`}
        strategy="afterInteractive"
      />
    </>
  );
}
