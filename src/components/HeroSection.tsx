'use client';

import { useTranslations } from 'next-intl';
import { CSSProperties } from 'react';
import { Search, Bot, Brain, Boxes, Wrench, Sparkles, Newspaper } from 'lucide-react';
import LogoIcon from './Logo/LogoIcon';

interface HeroSectionProps {
  /** Current search query (lifted to the page so the hero search drives the tool grid). */
  searchQuery?: string;
  /** Setter for the search query. */
  onSearchChange?: (query: string) => void;
}

// Popular AI tools — proper nouns, intentionally not localized.
const POPULAR = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Cursor'];

export default function HeroSection({ searchQuery = '', onSearchChange }: HeroSectionProps) {
  const t = useTranslations('hero');

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyQuery = (q: string) => {
    onSearchChange?.(q);
    // Defer scroll so the grid re-renders with the filtered results first.
    requestAnimationFrame(scrollToTools);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background: faint galaxy nebula + twinkling starfield + soft glows */}
      <div className="catai-nebula pointer-events-none absolute inset-0" />
      <div className="catai-stars pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column: copy + search + popular tags */}
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

            {/* Hero search */}
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
                className="shrink-0 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-lg"
              >
                {t('searchButton')}
              </button>
            </form>

            {/* Popular tags */}
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

          {/* Right column: the AI galaxy as the banner's cinematic centerpiece.
              It is enlarged and bled slightly past the right edge (cropped by the section's
              overflow-hidden) so it reads as a vast universe extending beyond the frame,
              and an ambient hub glow ties its light into the deep-space banner background. */}
          <div className="relative hidden lg:flex items-center justify-center lg:-mr-10 xl:-mr-20">
            {/* Ambient hub glow bleeding the galaxy light into the whole banner */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[46rem] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="lg:scale-105 xl:scale-115">
              <div className="catai-galaxy relative isolate w-[32rem] h-[32rem] max-w-full">
              {/* Radiating energy waves rippling outward from the core (in the disk plane) */}
              <span className="catai-wave" style={{ animationDelay: '0s' } as CSSProperties} />
              <span className="catai-wave" style={{ animationDelay: '-2s' } as CSSProperties} />
              <span className="catai-wave" style={{ animationDelay: '-4s' } as CSSProperties} />

              {/* Orbit rings — perspective spacing: rings sit lower (nearer) as they grow,
                  so gaps are sparse in front (bottom) and dense toward the back (top). */}
              <div className="catai-orbit-ring" style={{ '--orbit-r': '106px', width: '212px', height: '212px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />
              <div className="catai-orbit-ring" style={{ '--orbit-r': '132px', width: '264px', height: '264px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />
              <div className="catai-orbit-ring" style={{ '--orbit-r': '158px', width: '316px', height: '316px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />
              <div className="catai-orbit-ring" style={{ '--orbit-r': '184px', width: '368px', height: '368px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />
              <div className="catai-orbit-ring" style={{ '--orbit-r': '210px', width: '420px', height: '420px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />
              <div className="catai-orbit-ring" style={{ '--orbit-r': '236px', width: '472px', height: '472px', top: 'calc(50% + var(--orbit-r) * var(--catai-persp))' } as CSSProperties} />

              {/* Energy core platform beneath the A + soft spotlight from the hub */}
              <div className="catai-core" />
              <div className="catai-core-rim" />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl" style={{ top: 'calc(50% + var(--catai-hub-dy))' }} />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-400/15 blur-3xl" style={{ top: 'calc(50% + var(--catai-hub-dy))' }} />

              {/* Central A — the galaxy's gravity hub, seated at the orbital-band center (z-10) so the
                  planets truly revolve around it; near-half planets pass in front, far-half are occluded behind. */}
              <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ top: 'calc(50% + var(--catai-hub-dy))' }}>
                <div className="absolute w-44 h-44 bg-indigo-400/25 rounded-full blur-2xl" />
                <LogoIcon size={168} tone="vivid" static className="relative drop-shadow-2xl" />
              </div>

              {/* Data particles flowing along the rings */}
              <span className="catai-planet" style={{ '--orbit-r': '132px', '--orbit-dur': '11s', animationDelay: '-4s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '184px', '--orbit-dur': '13s', animationDelay: '-9s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-[0_0_8px_2px_rgba(129,140,248,0.7)]" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '210px', '--orbit-dur': '15s', animationDelay: '-2s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-200 shadow-[0_0_8px_2px_rgba(192,132,252,0.7)]" />
                </span>
              </span>

              {/* Six orbiting AI planets — Models, Tools, Agents, Skills, Blog, Brain */}
              <span className="catai-planet" style={{ '--orbit-r': '106px', '--orbit-dur': '20s', animationDelay: '0s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/40 backdrop-blur-sm shadow-lg">
                  <Brain className="w-5 h-5 text-indigo-200" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '132px', '--orbit-dur': '26s', animationDelay: '-8s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-blue-500/25 border border-blue-400/40 backdrop-blur-sm shadow-lg">
                  <Boxes className="w-5 h-5 text-blue-200" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '158px', '--orbit-dur': '32s', animationDelay: '-16s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-purple-500/25 border border-purple-400/40 backdrop-blur-sm shadow-lg">
                  <Bot className="w-5 h-5 text-purple-200" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '184px', '--orbit-dur': '38s', animationDelay: '-24s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-cyan-500/25 border border-cyan-400/40 backdrop-blur-sm shadow-lg">
                  <Wrench className="w-5 h-5 text-cyan-200" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '210px', '--orbit-dur': '44s', animationDelay: '-32s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-violet-500/25 border border-violet-400/40 backdrop-blur-sm shadow-lg">
                  <Sparkles className="w-5 h-5 text-violet-200" />
                </span>
              </span>
              <span className="catai-planet" style={{ '--orbit-r': '236px', '--orbit-dur': '50s', animationDelay: '-40s' } as CSSProperties}>
                <span className="catai-planet-face flex w-11 h-11 items-center justify-center rounded-full bg-sky-500/25 border border-sky-400/40 backdrop-blur-sm shadow-lg">
                  <Newspaper className="w-5 h-5 text-sky-200" />
                </span>
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
