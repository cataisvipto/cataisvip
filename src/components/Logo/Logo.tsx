'use client';

import LogoIcon, { LogoIconProps } from './LogoIcon';
import LogoCompact, { LogoCompactProps } from './LogoCompact';
import LogoFull, { LogoFullProps } from './LogoFull';

export type LogoVariant = 'icon' | 'compact' | 'full';

export interface LogoProps {
  variant?: LogoVariant;
  // icon-only props
  size?: number;
  // compact props
  height?: number;
  showText?: boolean;
  href?: string;
  // full props
  maxWidth?: number;
  // common
  className?: string;
}

/**
 * Single entry point for the Cataito brand mark.
 * Renders one of three variants:
 *  - icon      → only the CA monogram (favicon, mobile, app icon)
 *  - compact   → CA + CATAITO (navbar, inner-page header)
 *  - full      → CA + CATAITO + localized tagline (hero, footer)
 */
export default function Logo(props: LogoProps) {
  const { variant = 'compact' } = props;
  switch (variant) {
    case 'icon':
      return <LogoIcon {...(props as LogoIconProps)} />;
    case 'full':
      return <LogoFull {...(props as LogoFullProps)} />;
    case 'compact':
    default:
      return <LogoCompact {...(props as LogoCompactProps)} />;
  }
}

export { LogoIcon, LogoCompact, LogoFull };
export type { LogoIconProps, LogoCompactProps, LogoFullProps };
