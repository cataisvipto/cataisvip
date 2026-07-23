'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, ArrowRight } from 'lucide-react';
import LogoFull from './Logo/LogoFull';
import { WORDMARK_GRADIENT_HERO } from '@/lib/brandColors';

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden brand-gradient text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Full Logo (CA + CATAITO) — crisp inline SVG; wordmark uses a light gradient sheen on the brand-gradient backdrop */}
          <div className="mb-8 flex justify-center">
            <LogoFull
              maxWidth={380}
              variant="light"
              showTagline={false}
              wordmarkGradient={WORDMARK_GRADIENT_HERO}
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{t('featured')}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold text-base hover:bg-gray-50 transition shadow-lg"
            >
              {t('explore')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
