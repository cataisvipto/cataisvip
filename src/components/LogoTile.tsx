'use client';

import { useState } from 'react';
import Image from 'next/image';

export type LogoTheme = 'light' | 'dark' | 'fill';

interface LogoTileProps {
  /** logo 图片路径（同源 /logos/...） */
  logo: string;
  /** 无障碍替代文本，同时用于加载失败时的首字母兜底 */
  alt: string;
  /**
   * 显示模式：
   * - light（默认）：白底 + 留白 + object-contain（深色/彩色透明字形）
   * - dark：深底 #0d1117 + 留白 + object-contain（浅色/白色字形，避免白底隐形）
   * - fill：无留白 + object-cover 铺满圆角框（自带背景的方形图标）
   */
  theme?: LogoTheme;
  /** 尺寸 + 圆角，如 'w-12 h-12 rounded-xl' */
  className?: string;
  /** light/dark 模式下的留白（fill 模式忽略），如 'p-1.5' / 'p-2.5' */
  pad?: string;
  /** next/image 固有像素尺寸 */
  imgPx?: number;
  /** 兜底首字母的字号类 */
  fallbackClassName?: string;
}

export default function LogoTile({
  logo,
  alt,
  theme = 'light',
  className = 'w-12 h-12 rounded-xl',
  pad = 'p-1.5',
  imgPx = 40,
  fallbackClassName = 'text-lg',
}: LogoTileProps) {
  const [error, setError] = useState(false);

  const bg = theme === 'dark' ? 'bg-[#0d1117]' : theme === 'fill' ? '' : 'bg-white';
  const padCls = theme === 'fill' ? 'p-0' : pad;
  const fit = theme === 'fill' ? 'object-cover' : 'object-contain';

  return (
    <div
      className={`${className} ${bg} ${padCls} border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm`}
    >
      {error ? (
        <span className={`${fallbackClassName} font-bold text-[var(--primary)] select-none`}>
          {alt.charAt(0).toUpperCase()}
        </span>
      ) : (
        <Image
          src={logo}
          alt={alt}
          width={imgPx}
          height={imgPx}
          className={`w-full h-full ${fit}`}
          unoptimized
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
