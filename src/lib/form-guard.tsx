'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// ── 表单防滥用三件套（静态站无后端，客户端能做的是提高机器成本）──
// 1. honeypot：隐藏字段，正常用户不可见不会填；填了即机器人，静默丢弃（假装成功，不告知修复方式）
// 2. 时间陷阱：页面挂载后不足 MIN_SUBMIT_MS 的提交判为机器人（人类填表不会快于 2.5s）
// 3. Turnstile：TURNSTILE_SITE_KEY 非空时渲染人机验证；空 = 未配置时优雅跳过。
//    启用方法：CF Dashboard → Turnstile → 建 Widget（Managed 模式）→
//    把 site key 填到下方常量、secret key 按 Web3Forms 后台说明配置（Newsletter）。

export const MIN_SUBMIT_MS = 2500;

export function useTimeTrap() {
  // react-hooks/purity：渲染期禁用 Date.now()，挂载后惰性记录
  const mountedAt = useRef<number | null>(null);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return () => {
    if (mountedAt.current === null) return true;
    return Date.now() - mountedAt.current >= MIN_SUBMIT_MS;
  };
}

// 渲染进表单的隐藏蜜罐字段（name 取邮箱类诱饵，诱导机器人填写）
export const HONEYPOT_FIELD = 'company_website';

export function useHoneypot() {
  const [value, setValue] = useState('');
  return { value, setValue, triggered: value.trim() !== '' };
}

// ── Turnstile（可选启用）──
// 测试期可用 CF 官方测试 key（必过）：sitekey '1x00000000000000000000AA'
export const TURNSTILE_SITE_KEY = ''; // 留空 = 未启用，表单照常工作

export function useTurnstile(): { token: string; widget: ReactNode } {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const w = window as unknown as { turnstile?: { render: (el: Element, opts: object) => string } };
    const render = () => {
      const el = document.getElementById('cf-turnstile-box');
      if (el && w.turnstile && el.childElementCount === 0) {
        w.turnstile.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
        });
      }
    };
    if (w.turnstile) {
      render();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  const widget = TURNSTILE_SITE_KEY ? (
    <div id="cf-turnstile-box" className="min-h-[65px]" />
  ) : null;

  return { token, widget };
}
