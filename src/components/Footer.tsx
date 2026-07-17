import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt="CATAI"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              CATAI
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--muted)] text-center">
            {t('description')}
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="mailto:cataisvip@gmail.com" className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition" title={t('contact')}>
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">cataisvip@gmail.com</span>
            </a>
            <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
              {tNav('blog')}
            </Link>
            <Link href="/privacy" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('privacy')}
            </Link>
            <Link href="/disclaimer" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition">
              {t('disclaimer')}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[var(--card-border)] text-center">
          <p className="text-xs text-[var(--muted)]">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
