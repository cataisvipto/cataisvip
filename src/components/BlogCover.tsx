'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';

interface BlogCoverProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

// Deterministic gradient picker so each post keeps a stable fallback color
const GRADIENTS = [
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-violet-600 via-indigo-500 to-blue-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
];

const pickGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
};

// Renders a blog cover image with a branded gradient fallback.
// Handles broken/blocked external URLs (e.g. Unsplash unreachable without VPN).
export default function BlogCover({ src, alt, width, height, className = '', priority = false }: BlogCoverProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${pickGradient(alt || src)} ${className}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center text-white/90">
          <Newspaper className="w-8 h-8" />
          <span className="text-sm font-medium line-clamp-2">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
