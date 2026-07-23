import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail, Code2, Send, Newspaper } from 'lucide-react';
import LogoFull from './Logo/LogoFull';
import { WORDMARK_GRADIENT_VIVID } from '@/lib/brandColors';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCategories = useTranslations('categories');

  const categories = ['Chat', 'Image', 'Code', 'Writing', 'Video', 'Audio', 'Search', 'Agent', 'Developer', 'Design', 'Platform'];

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
              <Mail className="w-3.5 h-3.5" />
              <span>hello@cataito.com</span>
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
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider">{t('categories')}</h3>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${cat.toLowerCase()}`}
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
              {categories.slice(6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${cat.toLowerCase()}`}
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
            <Link href="/privacy" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('privacy')}
            </Link>
            <Link href="/disclaimer" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('disclaimer')}
            </Link>
          </div>
          <p className="text-xs text-[var(--muted)]">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
