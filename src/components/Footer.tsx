import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Code2, Send, Newspaper, Info, Plug } from 'lucide-react';
import LogoFull from './Logo/LogoFull';
import { WORDMARK_GRADIENT_VIVID } from '@/lib/brandColors';
import { CATEGORIES, categoryToSlug } from '@/lib/categories';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCategories = useTranslations('categories');

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column — Full Logo (CA + CATAITO + tagline), theme-aware */}
          <div className="space-y-4 relative">
            {/* Soft brand spotlight — dark mode only (see globals.css) */}
            <span aria-hidden="true" className="footer-glow" />
            <LogoFull
              layout="horizontal"
              maxWidth={244}
              vivid
              wordmarkGradient={WORDMARK_GRADIENT_VIVID}
              className="relative z-[1]"
            />
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t('description')}
            </p>
            <a href="mailto:hello@cataito.com" className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition" title={t('contact')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                          <span>hello@cataito.com</span>
                        </a>
                        <a href="https://x.com/cataitocom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition" title="X (Twitter)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span>@cataitocom</span>
                        </a>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider">{t('navigation')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/skills" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
                  <Code2 className="w-3.5 h-3.5" />
                  {tNav('skills')}
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
                  <Plug className="w-3.5 h-3.5" />
                  {tNav('mcp')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
                  <Newspaper className="w-3.5 h-3.5" />
                  {tNav('blog')}
                </Link>
              </li>
              <li>
                <Link href="/submit" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
                  <Send className="w-3.5 h-3.5" />
                  {tNav('submit')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
                  <Info className="w-3.5 h-3.5" />
                  {tNav('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider">{t('categories')}</h3>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${categoryToSlug(cat)}`}
                    className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition"
                  >
                    {tCategories(cat as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories Column */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider">&nbsp;</h3>
            <ul className="space-y-3">
              {CATEGORIES.slice(8).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${categoryToSlug(cat)}`}
                    className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition"
                  >
                    {tCategories(cat as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-10 pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {tNav('about')}
            </Link>
            <Link href="/privacy" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('privacy')}
            </Link>
            <Link href="/disclaimer" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('disclaimer')}
            </Link>
            <Link href="/editorial-policy" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('editorial')}
            </Link>
          </div>
          <p className="text-xs text-[var(--muted)]">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
