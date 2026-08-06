import { HelpCircle, ChevronDown } from 'lucide-react';

/** Localized FAQ entry stored in mcp.json / skills.json (per-locale question & answer maps) */
export interface FaqItem {
  question: Record<string, string>;
  answer: Record<string, string>;
}

/** Pick the text matching the locale (falls back to English) */
const pick = (map: Record<string, string>, locale: string) => map[locale] || map.en || '';

interface FaqSectionProps {
  faqs?: FaqItem[];
  locale: string;
  title: string;
}

/**
 * FAQ accordion (collapsed by default) built on native <details>/<summary> —
 * zero JS, fully crawlable content, with FAQPage JSON-LD for structured data.
 * Shared by the MCP and Skills detail pages.
 */
export default function FaqSection({ faqs, locale, title }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: pick(faq.question, locale),
      acceptedAnswer: {
        '@type': 'Answer',
        text: pick(faq.answer, locale),
      },
    })),
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-indigo-500" />
        {title}
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group border border-[var(--muted-border)] rounded-lg overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none text-[var(--foreground)] font-medium hover:text-[var(--primary)] transition [&::-webkit-details-marker]:hidden">
              <span>{pick(faq.question, locale)}</span>
              <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 pt-1 text-[var(--muted)] leading-relaxed text-sm">
              {pick(faq.answer, locale)}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
