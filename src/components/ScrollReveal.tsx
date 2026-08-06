'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the animation starts */
  delay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * 轻量入场动画组件。
 * 挂载后先渲染初始位置（translateY 偏移），下一帧动画到最终位置。
 * 始终可见（opacity: 1），无白屏问题。
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    // 延迟一帧，让浏览器先渲染初始偏移位置，再触发动画
    const frame = requestAnimationFrame(() => setAnim(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const getOffset = () => {
    switch (direction) {
      case 'up': return 'translateY(24px)';
      case 'down': return 'translateY(-24px)';
      case 'left': return 'translateX(24px)';
      case 'right': return 'translateX(-24px)';
      default: return 'none';
    }
  };

  return (
    <div
      className={className}
      style={{
        opacity: 1,
        transform: anim ? 'translateY(0)' : getOffset(),
        transition: `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}