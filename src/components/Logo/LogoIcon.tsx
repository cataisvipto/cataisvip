'use client';

import { CSSProperties } from 'react';
import { BRAND_WHITE, ICON_GRADIENT_VIVID, ICON_GRADIENT_DEFAULT } from '@/lib/brandColors';

export interface LogoIconProps {
  /** Pixel size of the icon (square). Default 40. */
  size?: number;
  /** Optional className for the wrapping <svg> */
  className?: string;
  /** Optional inline style */
  style?: CSSProperties;
  /** Decorative aria label; defaults to "Cataito" */
  ariaLabel?: string;
  /** If true, disables hover animation */
  static?: boolean;
  /** Color treatment: "gradient" (brand blue→purple), "vivid" (cyan→blue→purple, richer) or "white" (dark/colored backgrounds). */
  tone?: 'gradient' | 'vivid' | 'white';
}

/**
 * Brand icon: the letter "A" — two round-capped legs meeting at the apex with
 * a node dot in place of the crossbar (the "AI Gateway" mark). Blue→cyan/purple
 * gradient. Pure inline SVG so it inherits currentColor / CSS for theme
 * flexibility. Use tone="white" on dark or colored backgrounds (e.g. the hero).
 */
export default function LogoIcon({
  size = 40,
  className,
  style,
  ariaLabel = 'Cataito',
  static: isStatic = false,
  tone = 'gradient',
}: LogoIconProps) {
  const gradId = `ca-grad-${tone}-${size}`;
  const paint = tone === 'white' ? BRAND_WHITE : `url(#${gradId})`;
  // "vivid" mirrors the brand mockup (cyan→blue→purple); "gradient" is the core blue→purple.
  const stops = tone === 'vivid' ? ICON_GRADIENT_VIVID : ICON_GRADIENT_DEFAULT;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="0"
          y1="0"
          x2="96"
          y2="96"
          gradientUnits="userSpaceOnUse"
        >
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        className={isStatic ? '' : 'transition-transform duration-300 group-hover:scale-105'}
        filter={`url(#${gradId}-glow)`}
      >
        {/* A: wide splayed legs meeting at the apex — same stance as the CATAITO wordmark's "A" */}
        <path
          d="M 14 80 L 48 18 L 82 80"
          stroke={paint}
          fill="none"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI node: low dot in place of the A's crossbar (mirrors the wordmark motif) */}
        <circle cx="48" cy="73" r="8" fill={paint} />
      </g>
    </svg>
  );
}
