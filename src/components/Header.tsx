'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Search, Globe, Send, ChevronDown, Newspaper, Code2, Menu, X, Home, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import LogoCompact from './Logo/LogoCompact';
import LogoIcon from './Logo/LogoIcon';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locale: string;
}

const CATEGORIES = ['Chat', 'Image', 'Code', 'Writing', 'Video', 'Audio', 'Search', 'Agent', 'Developer', 'Design', 'Platform'];

export default function Header({ searchQuery, onSearchChange, locale }: HeaderProps) {
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

  // Active state helpers (pathname is locale-stripped)
  const isHome = pathname === '/';
  const isCategory = pathname.startsWith('/category');
  const isSkills = pathname.startsWith('/skills');
  const isBlog = pathname.startsWith('/blog');

  const navBase = 'inline-flex items-center gap-1.5 px-1 h-11 text-sm border-b-2 transition';
  const navActive = 'text-[var(--primary)] border-[var(--primary)] font-medium';
  const navIdle = 'text-[var(--muted)] border-transparent hover:text-[var(--foreground)]';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Logo + Search + Utilities */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo: compact on desktop (CA + CATAITO), icon-only on mobile */}
          <div className="shrink-0">
            <span className="hidden sm:inline-flex">
              <LogoCompact height={36} />
            </span>
            <span className="sm:hidden inline-flex">
              <Link href="/" aria-label="Cataito — Home" className="inline-flex items-center">
                <LogoIcon size={36} ariaLabel="Cataito" />
              </Link>
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-full text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center justify-center w-9 h-9 text-[var(--muted)] hover:text-[var(--primary)] transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Language Switch */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--card-border)] rounded-full hover:border-[var(--primary)] transition"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang.short}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                  {locales.map((l) => (
                    <Link
                      key={l.code}
                      href={pathname}
                      locale={l.code as any}
                      onClick={() => setLangOpen(false)}
                      className={`block px-4 py-2 text-sm hover:bg-[var(--primary)]/10 transition ${l.code === locale ? 'text-[var(--primary)] font-medium bg-[var(--primary)]/5' : 'text-[var(--foreground)]'}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Submit Button */}
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.submit')}</span>
            </Link>
          </div>
        </div>

        {/* Row 2: Primary Navigation (desktop) */}
        <nav className="hidden sm:flex items-center gap-6 -mt-px">
          <Link href="/" className={`${navBase} ${isHome ? navActive : navIdle}`}>
            <Home className="w-4 h-4" />
            {t('nav.home')}
          </Link>

          {/* Categories Dropdown */}
          <div className="relative" ref={catRef}>
            <button
              onClick={() => setCatOpen(!catOpen)}
              className={`${navBase} ${isCategory ? navActive : navIdle}`}
            >
              <LayoutGrid className="w-4 h-4" />
              {t('nav.categories')}
              <ChevronDown className={`w-3 h-3 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full mt-0 w-[min(90vw,32rem)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl p-3 z-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category/${cat.toLowerCase()}`}
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

          <Link href="/skills" className={`${navBase} ${isSkills ? navActive : navIdle}`}>
            <Code2 className="w-4 h-4" />
            {t('nav.skills')}
          </Link>

          <Link href="/blog" className={`${navBase} ${isBlog ? navActive : navIdle}`}>
            <Newspaper className="w-4 h-4" />
            {t('nav.blog')}
          </Link>
        </nav>

        {/* Mobile Search */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-full text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-[var(--card-border)] pt-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              {t('nav.home')}
            </Link>
            <Link
              href="/skills"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition"
            >
              <Code2 className="w-4 h-4" />
              {t('nav.skills')}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition"
            >
              <Newspaper className="w-4 h-4" />
              {t('nav.blog')}
            </Link>

            {/* Mobile Categories */}
            <div className="px-3 pt-3">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                {t('nav.categories')}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-[var(--foreground)] rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition"
                  >
                    {tCategories(cat as any)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
