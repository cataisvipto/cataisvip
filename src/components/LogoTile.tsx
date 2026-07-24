'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LogoTileProps {
  /** logo 图片路径（同源 /logos/...，统一 256×256 官方 App 图标） */
  logo: string;
  /** 无障碍替代文本，同时用于加载失败时的首字母兜底 */
  alt: string;
  /** 尺寸 + 圆角，如 'w-12 h-12 rounded-xl' */
  className?: string;
  /** next/image 固有像素尺寸 */
  imgPx?: number;
  /** 兜底首字母的字号类 */
  fallbackClassName?: string;
}

/**
 * 统一 logo 渲染：容器底色走 --logo-tile-bg 变量（亮白/暗柔和浅灰）+ object-cover 铺满圆角框。
 * 全部工具 logo 已规范化为 256×256，自带背景的方图铺满、透明字形居中显示于底色。
 * 内置 onError 首字母兜底。
 */
export default function LogoTile({
  logo,
  alt,
  className = 'w-12 h-12 rounded-xl',
  imgPx = 40,
  fallbackClassName = 'text-lg',
}: LogoTileProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={`${className} bg-[var(--logo-tile-bg)] border border-[var(--card-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm`}
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
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
