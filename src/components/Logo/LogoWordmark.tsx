import { CSSProperties } from 'react';

export interface LogoWordmarkProps {
  /** Rendered height in px. Width follows the intrinsic aspect ratio (~5.6:1). */
  height?: number;
  /** Stroke color of the letterforms (e.g. "#FFFFFF" or "var(--foreground)"). */
  color?: string;
  /**
   * Colors for the two "A" dots (the signature crossbar-as-dot detail).
   * Defaults to `color` (monochrome) when omitted.
   */
  dotColors?: [string, string];
  /**
   * Optional horizontal gradient stops for the letterforms. When provided, the
   * strokes (and A-dots, unless `dotColors` is set) paint with this gradient
   * instead of the solid `color`.
   */
  gradient?: { offset: string; color: string }[];
  /** Unique id for the gradient def; auto-derived from height when omitted. */
  gradientId?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * "CATAITO" as a geometric, stroke-drawn wordmark that matches the CA monogram:
 * consistent round-cap strokes, wide tracking, and — the signature detail —
 * each letter "A" uses a dot in place of its middle crossbar.
 *
 * The wordmark is a fixed brand name (not localized); the tagline stays as text.
 * ViewBox: 0 0 560 100. Letters are solid; the two A-dots carry the accent color.
 */
export default function LogoWordmark({
  height = 28,
  color = 'var(--foreground)',
  dotColors,
  gradient,
  gradientId,
  className,
  style,
  ariaLabel = 'CATAITO',
}: LogoWordmarkProps) {
  const width = Math.round(height * 5.6);
  const useGradient = Array.isArray(gradient) && gradient.length > 1;
  const gid = gradientId ?? `wordmark-grad-${height}`;
  const paint = useGradient ? `url(#${gid})` : color;
  const [dotA1, dotA2] = dotColors ?? [paint, paint];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 560 100"
      width={width}
      height={height}
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      {useGradient && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
            {gradient!.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
      )}
      <g
        stroke={paint}
        fill="none"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* C — open ring (perfect-circle radius), facing right */}
        <path d="M 71.8 27.5 A 35 35 0 1 0 71.8 72.5" />

        {/* A — legs only; crossbar replaced by the low dot below */}
        <path d="M 96 85 L 131 15 L 166 85" />

        {/* T */}
        <path d="M 190 15 L 252 15" />
        <path d="M 221 15 L 221 85" />

        {/* A — second one */}
        <path d="M 276 85 L 311 15 L 346 85" />

        {/* I */}
        <path d="M 370 15 L 370 85" />

        {/* T */}
        <path d="M 394 15 L 456 15" />
        <path d="M 425 15 L 425 85" />

        {/* O — perfect circle */}
        <circle cx="515" cy="50" r="35" />
      </g>

      {/* Signature detail: the "A" crossbars rendered as accent dots, low near the baseline */}
      <circle cx="131" cy="77" r="9" fill={dotA1} />
      <circle cx="311" cy="77" r="9" fill={dotA2} />
    </svg>
  );
}
