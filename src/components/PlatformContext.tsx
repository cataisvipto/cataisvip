'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Platform = 'windows' | 'macos' | 'linux';

interface PlatformContextValue {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}

const PlatformContext = createContext<PlatformContextValue>({
  platform: 'windows',
  setPlatform: () => {},
});

/** 自动检测当前操作系统（仅在首次访问、无 localStorage 记忆时使用） */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac') || ua.includes('darwin')) return 'macos';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';
  return 'windows';
}

const STORAGE_KEY = 'cataito-tutorial-platform';

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatformState] = useState<Platform>('windows');

  useEffect(() => {
    // 优先 localStorage 记忆，其次自动检测
    const saved = localStorage.getItem(STORAGE_KEY) as Platform | null;
    if (saved && ['windows', 'macos', 'linux'].includes(saved)) {
      setPlatformState(saved);
    } else {
      setPlatformState(detectPlatform());
    }
  }, []);

  const setPlatform = (p: Platform) => {
    setPlatformState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  };

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
