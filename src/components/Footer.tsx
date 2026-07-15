import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Zap, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              CATAI
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 text-center">
            {t('description')}
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="mailto:cataisvip@gmail.com" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition" title={t('contact')}>
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">cataisvip@gmail.com</span>
            </a>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600 transition">
              {t('privacy')}
            </Link>
            <Link href="/disclaimer" className="text-sm text-gray-500 hover:text-indigo-600 transition">
              {t('disclaimer')}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
