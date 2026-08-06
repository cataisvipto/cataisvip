import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function SubmitCTA() {
  const t = useTranslations('cta');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative overflow-hidden rounded-2xl brand-gradient p-10 sm:p-14 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-white/80 text-base mb-6 max-w-lg mx-auto">
            {t('description')}
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[var(--primary)] font-semibold rounded-full hover:bg-gray-50 transition shadow-sm text-sm"
          >
            {t('button')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}