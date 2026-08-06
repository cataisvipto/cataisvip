'use client';

import { useTranslations } from 'next-intl';
import { CSSProperties } from 'react';
import { Search, Bot, Brain, Boxes, Wrench, Sparkles, Newspaper } from 'lucide-react';
import LogoIcon from './Logo/LogoIcon';

interface HeroSectionProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const POPULAR = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Cursor'];
const ORBITS = [80, 104, 135, 176, 228, 258];

const PARTICLES = [
  { radius: 104, duration: 10, delay: -4 },
  { radius: 176, duration: 14, delay: -9 },
  { radius: 228, duration: 17, delay: -2 },
];

const PLANETS = [
  { radius: 80, duration: 18, delay: 0, className: 'catai-ai-planet-indigo', Icon: Brain },
  { radius: 104, duration: 26, delay: -9.9, className: 'catai-ai-planet-blue', Icon: Boxes },
  { radius: 135, duration: 35, delay: -26.7, className: 'catai-ai-planet-purple', Icon: Bot },
  { radius: 176, duration: 46, delay: -6.7, className: 'catai-ai-planet-cyan', Icon: Wrench },
  { radius: 228, duration: 58, delay: -30.6, className: 'catai-ai-planet-violet', Icon: Sparkles },
  { radius: 258, duration: 72, delay: -65.4, className: 'catai-ai-planet-sky', Icon: Newspaper },
];

export default function HeroSection({ searchQuery = '', onSearchChange }: HeroSectionProps) {
  const t = useTranslations('hero');

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyQuery = (q: string) => {
    onSearchChange?.(q);
    requestAnimationFrame(scrollToTools);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="catai-nebula pointer-events-none absolute inset-0" />
      <div className="catai-stars pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              {t.rich('title', {
                hl: (chunks) => (
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {chunks}
                  </span>
                ),
              })}
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('subtitle')}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyQuery(searchQuery);
              }}
              className="mt-8 flex items-center gap-2 p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm max-w-xl mx-auto lg:mx-0 focus-within:border-indigo-400/60 transition"
            >
              <Search className="ml-3 w-5 h-5 text-white/50 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent border-0 outline-none text-white placeholder-white/40 text-base"
              />
              <button
                type="submit"
                className="shrink-0 px-6 py-2.5 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
              >
                {t('searchButton')}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
              <span className="text-sm text-white/50">{t('popular')}</span>
              {POPULAR.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyQuery(name)}
                  className="px-3 py-1 rounded-full text-sm text-white/80 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:flex items-center justify-center lg:-mr-10 xl:-mr-20">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[46rem] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="lg:scale-105 xl:scale-115">
              <div className="catai-galaxy relative isolate w-[34rem] h-[34rem] max-w-full" aria-hidden="true">
                <div className="catai-system-aura" />
                <span className="catai-wave" style={{ animationDelay: '0s' } as CSSProperties} />
                <span className="catai-wave" style={{ animationDelay: '-2s' } as CSSProperties} />
                <span className="catai-wave" style={{ animationDelay: '-4s' } as CSSProperties} />

                {ORBITS.map((radius, index) => (
                  <div
                    key={radius}
                    className={`catai-orbit-ring${index === 0 ? ' catai-ring-back' : ''}`}
                    style={{
                      '--orbit-r': `${radius}px`,
                      '--ring-delay': `${index * -1.15}s`,
                      '--ring-depth': `${radius / 300}`,
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      top: `calc(50% + ${90 + (radius - 80) * 0.26}px)`,
                    } as CSSProperties}
                  />
                ))}

                <div
                  className="catai-ring-front"
                  style={{
                    width: `${ORBITS[0] * 2}px`,
                    height: `${ORBITS[0] * 2}px`,
                    top: `calc(50% + ${90 + (ORBITS[0] - 80) * 0.26}px)`,
                  } as CSSProperties}
                />

                <div className="catai-core" />
                <div className="catai-core-grid" />
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full bg-indigo-500/15 blur-3xl" style={{ top: 'calc(50% + var(--catai-hub-dy))' }} />
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-400/15 blur-3xl" style={{ top: 'calc(50% + var(--catai-hub-dy))' }} />

                <div className="catai-dot-glow" />

                <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ top: 'calc(50% + var(--catai-hub-dy))', rotate: '10deg' }}>
                  <div className="catai-logo-halo" />
                  <LogoIcon size={178} tone="vivid" static className="relative drop-shadow-2xl" />
                </div>

                {PARTICLES.map((particle) => (
                  <span
                    key={`${particle.radius}-${particle.delay}`}
                    className="catai-planet catai-particle"
                    style={{
                      '--orbit-r': `${particle.radius}px`,
                      '--orbit-dur': `${particle.duration}s`,
                      animationDelay: `${particle.delay}s`,
                    } as CSSProperties}
                  />
                ))}

                {PLANETS.map(({ radius, duration, delay, className, Icon }) => (
                  <span
                    key={radius}
                    className="catai-planet"
                    style={{
                      '--orbit-r': `${radius}px`,
                      '--orbit-dur': `${duration}s`,
                      '--orbit-delay': `${delay}s`,
                      animationDelay: `${delay}s`,
                    } as CSSProperties}
                  >
                    <span className={`catai-planet-face catai-ai-planet ${className}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}