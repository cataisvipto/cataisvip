import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMonthlyReport } from '@/lib/monthly-report';
import { generateAlternates } from '@/lib/seo';
import ScrollReveal from '@/components/ScrollReveal';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'report' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: generateAlternates('/report', locale),
  };
}

export default async function ReportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'report' });
  const report = getMonthlyReport();
  if (!report) {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center text-[var(--muted)]">
        {t('notReady')}
      </main>
    );
  }

  const stats = [
    { label: t('totalStars'), value: fmt(report.totalStarsCur) },
    { label: t('starGrowth'), value: `+${fmt(report.starGrowth)}` },
    { label: t('projectsTracked'), value: fmt(report.projectsCur) },
    { label: t('newEntrants'), value: fmt(report.newEntrants) },
  ];

  const GainerList = ({ items }: { items: typeof report.topGainers }) => (
    <ol className="space-y-2">
      {items.map((g, i) => (
        <li key={g.fullName}>
          <a
            href={`/project/${g.fullName}`}
            className="group flex items-center gap-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-3 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all"
          >
            <span className="w-8 text-sm font-bold text-[var(--muted)]">{i + 1}</span>
            <span className="flex-1 min-w-0 truncate text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition">
              {g.name}
              <span className="ml-2 text-xs text-[var(--muted)] font-normal">{g.fullName}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-emerald-500 tabular-nums">
              +{fmt(g.delta)}
            </span>
            <span className="hidden sm:block shrink-0 text-xs text-[var(--muted)] tabular-nums">
              ★ {fmt(g.current)}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-10">
      {/* 标题 + 可引用 TL;DR */}
      <header className="space-y-4">
        <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
          {t('dataRange', { prev: report.prevDate, cur: report.curDate })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{t('title', { month: report.month })}</h1>
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-6">
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            {t('tldr', {
              growth: fmt(report.starGrowth),
              total: fmt(report.totalStarsCur),
              projects: fmt(report.projectsCur),
              newcomers: fmt(report.newEntrants),
            })}
          </p>
        </div>
      </header>

      {/* 总览四卡 */}
      <ScrollReveal>
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-4 text-center"
            >
              <div className="text-xl font-bold text-[var(--primary)] tabular-nums">{s.value}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </section>
      </ScrollReveal>

      {/* 增量榜 */}
      <ScrollReveal>
        <section>
          <h2 className="text-xl font-bold mb-4">{t('topGainersTitle')}</h2>
          <GainerList items={report.topGainers} />
        </section>
      </ScrollReveal>

      {/* 新面孔榜 */}
      {report.topNewcomers.length > 0 && (
        <ScrollReveal>
          <section>
            <h2 className="text-xl font-bold mb-4">
              {t('newcomersTitle', { count: report.curatedNewEntrants })}
            </h2>
            <GainerList items={report.topNewcomers} />
          </section>
        </ScrollReveal>
      )}

      {/* 方法论 */}
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        {t('methodology')}
      </p>
    </main>
  );
}
