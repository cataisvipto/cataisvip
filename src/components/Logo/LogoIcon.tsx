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
 * Brand icon: the letter "C" cradling a cat paw that fills its counter
 * (the "cat" in Cataito), with a blue-to-purple gradient.
 * Pure inline SVG so it inherits currentColor / CSS for theme flexibility.
 * Use tone="white" on dark or colored backgrounds (e.g. the hero).
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
        {/* C: bold open ring, opening to the right — reads as the letter C */}
        <path
          d="M 75.9 34.4 A 31 31 0 1 0 75.9 61.6"
          stroke={paint}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cat paw centered in the C's counter: lighter pad + four separated toe beans */}
        <g fill={paint}>
          <ellipse cx="48" cy="55.5" rx="11" ry="8" />
          <ellipse cx="37" cy="43" rx="3.8" ry="4.7" />
          <ellipse cx="44" cy="39" rx="3.8" ry="4.7" />
          <ellipse cx="52" cy="39" rx="3.8" ry="4.7" />
          <ellipse cx="59" cy="43" rx="3.8" ry="4.7" />
        </g>
      </g>
    </svg>
  );
}
