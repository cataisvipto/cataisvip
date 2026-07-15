import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Send, ArrowRight } from 'lucide-react';

export default function SubmitCTA() {
  const t = useTranslations('cta');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-cyan-500 p-8 sm:p-12 text-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t('title')}
          </h2>
          <p className="text-white/80 text-lg mb-6 max-w-lg mx-auto">
            {t('description')}
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-50 transition shadow-lg"
          >
            {t('button')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
