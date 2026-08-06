'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Search, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import LogoCompact from './Logo/LogoCompact';
import { useTheme } from './ThemeProvider';
import { CATEGORIES, categoryToSlug } from '@/lib/categories';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locale: string;
}

export default function Header({ searchQuery, onSearchChange, locale }: HeaderProps) {
  const { theme } = useTheme();
  const t = useTranslations();
  const tCategories = useTranslations('categories');
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const locales: { code: string; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中' },
    { code: 'ja', label: '日本語', short: '日' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'fr', label: 'Français', short: 'FR' },
  ];
  const currentLang = locales.find(l => l.code === locale) || locales[0];

  const isHome = pathname === '/';
  const isCategory = pathname.startsWith('/category');
  const isSkills = pathname.startsWith('/skills');
  const isMcp = pathname.startsWith('/mcp');
  const isRanking = pathname.startsWith('/ranking');
  const isBlog = pathname.startsWith('/blog');
  const isTutorials = pathname.startsWith('/tutorials');

  const navIdle = 'text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition px-2 py-1';
  const navActive = 'text-sm text-[var(--foreground)] font-medium px-2 py-1';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--header-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 gap-6">
          {/* Logo */}
          <LogoCompact height={30} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={isHome ? navActive : navIdle}>
              {t('nav.home')}
            </Link>

            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen(!catOpen)}
                className={`${isCategory ? navActive : navIdle} flex items-center gap-1`}
              >
                {t('nav.categories')}
                <ChevronDown className={`w-3 h-3 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-2 w-[min(90vw,32rem)] bg-[var(--card-bg)] border border-[var(--muted-border)] rounded-xl shadow-lg p-3 z-50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${categoryToSlug(cat)}`}
                        onClick={() => setCatOpen(false)}
                        className="px-3 py-2 text-sm text-[var(--foreground)] rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition"
                      >
                        {tCategories(cat as any)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/skills" className={isSkills ? navActive : navIdle}>{t('nav.skills')}</Link>
            <Link href="/mcp" className={isMcp ? navActive : navIdle}>{t('nav.mcp')}</Link>
            <Link href="/ranking" className={isRanking ? navActive : navIdle}>{t('nav.ranking')}</Link>
            <Link href="/blog" className={isBlog ? navActive : navIdle}>{t('nav.blog')}</Link>
            <Link href="/tutorials" className={isTutorials ? navActive : navIdle}>{t('nav.tutorials')}</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--muted-bg)] rounded-full border border-[var(--muted-border)] focus-within:border-[var(--primary)] transition">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
              <input
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-40 lg:w-48 bg-transparent border-0 outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
              />
            </div>

            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{currentLang.short}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[var(--card-bg)] border border-[var(--muted-border)] rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                  {locales.map((l) => (
                    <Link
                      key={l.code}
                      href={pathname}
                      locale={l.code as any}
                      onClick={() => setLangOpen(false)}
                      className={`block px-4 py-2 text-sm hover:bg-[var(--primary)]/10 transition ${l.code === locale ? 'text-[var(--primary)] font-medium' : 'text-[var(--foreground)]'}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />

            {/* Submit */}
            <Link
              href="/submit"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-full transition shadow-sm"
            >
              {t('nav.submit')}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 text-[var(--muted)] hover:text-[var(--foreground)] transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--muted-bg)] border border-[var(--muted-border)] rounded-full text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-[var(--header-border)] pt-3 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.home')}
            </Link>
            <Link href="/skills" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.skills')}
            </Link>
            <Link href="/mcp" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.mcp')}
            </Link>
            <Link href="/ranking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.ranking')}
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.blog')}
            </Link>
            <Link href="/tutorials" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition">
              {t('nav.tutorials')}
            </Link>

            {/* Mobile categories */}
            <div className="px-3 pt-3">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">{t('nav.categories')}</p>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${categoryToSlug(cat)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-[var(--foreground)] rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition"
                  >
                    {tCategories(cat as any)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-3 pt-2">
              <Link
                href="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-full transition"
              >
                {t('nav.submit')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}