'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Check, Copy, ExternalLink } from 'lucide-react';

const BADGE_URL = 'https://img.shields.io/badge/Listed%20on-Cataito-6366f1?style=for-the-badge&labelColor=1e1b4b';

export default function BadgeClient() {
  const params = useParams();
  const locale = params.locale as string;
  const [copiedGeneric, setCopiedGeneric] = useState(false);
  const [copiedLinked, setCopiedLinked] = useState(false);
  const [toolSlug, setToolSlug] = useState('');

  const siteUrl = 'https://cataito.com';

  const genericMarkdown = `![Listed on Cataito](${BADGE_URL})`;

  const linkedMarkdown = toolSlug
    ? `[![Listed on Cataito](${BADGE_URL})](${siteUrl}/${locale}/tool/${toolSlug})`
    : `[![Listed on Cataito](${BADGE_URL})](${siteUrl})`;

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Badge Preview */}
      <section className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8 text-center">
        <h2 className="text-lg font-semibold mb-6">Preview</h2>
        <div className="flex justify-center">
          <img
            src={BADGE_URL}
            alt="Listed on Cataito"
            className="h-7"
          />
        </div>
        <p className="text-sm text-[var(--muted)] mt-4">
          A clean badge that says &quot;Listed on Cataito&quot; in the brand indigo color.
        </p>
      </section>

      {/* Generic Badge */}
      <section className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
        <h2 className="text-lg font-semibold mb-2">Generic Badge</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Links to the Cataito homepage. Use this if you just want to show you&apos;re listed.
        </p>

        <div className="bg-[var(--muted-bg)] rounded-lg p-4 relative group">
          <pre className="text-sm font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap">
            {genericMarkdown}
          </pre>
          <button
            onClick={() => copyToClipboard(genericMarkdown, setCopiedGeneric)}
            className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--muted-border)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedGeneric ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--muted)]" />
            )}
          </button>
        </div>
      </section>

      {/* Badge Linked to Tool */}
      <section className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
        <h2 className="text-lg font-semibold mb-2">Badge Linked to Your Tool</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Links directly to your tool&apos;s page on Cataito. Enter your tool slug below.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-[var(--muted)] shrink-0">{siteUrl}/{locale}/tool/</span>
          <input
            type="text"
            value={toolSlug}
            onChange={(e) => setToolSlug(e.target.value)}
            placeholder="your-tool-slug"
            className="flex-1 px-3 py-2 bg-[var(--muted-bg)] border border-[var(--muted-border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {toolSlug && (
            <a
              href={`/${locale}/tool/${toolSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="bg-[var(--muted-bg)] rounded-lg p-4 relative group">
          <pre className="text-sm font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap">
            {linkedMarkdown}
          </pre>
          <button
            onClick={() => copyToClipboard(linkedMarkdown, setCopiedLinked)}
            className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--muted-border)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedLinked ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--muted)]" />
            )}
          </button>
        </div>
      </section>

      {/* How to Use */}
      <section className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--card-shadow)] p-8">
        <h2 className="text-lg font-semibold mb-4">How to Add the Badge</h2>
        <ol className="space-y-3 text-sm text-[var(--muted)]">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Open your GitHub repository&apos;s README.md file</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Paste the markdown code above at the bottom of the README</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Commit and push — the badge will appear on your repository page</span>
          </li>
        </ol>
      </section>

      {/* Footer note */}
      <p className="text-center text-xs text-[var(--muted)]">
        Badge generated by <a href="https://shields.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--primary)]">Shields.io</a> — Cataito brand color: #6366f1
      </p>
    </div>
  );
}