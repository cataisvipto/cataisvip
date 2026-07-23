/**
 * 品牌调色板 —— CATAITO Logo / 字标的唯一色值来源（single source of truth）。
 *
 * 这些色值是「主题无关」的：品牌标识在亮色/暗色模式下保持一致，且 SVG 渐变
 * stop 无法引用 CSS 主题变量，因此它们不纳入 CSS 变量系统。此文件位于 src/lib，
 * 不在硬编码色值检查（check-css-vars.js 仅扫描 src/components 与 src/app）范围内，
 * 是品牌色值的集中存放处。切勿在组件中直接写死品牌 hex，统一从此处导入。
 */

export type GradientStop = { offset: string; color: string };

/** 纯白（用于浅色/彩色背景上的图标与字标） */
export const BRAND_WHITE = '#FFFFFF';
/** 半透明白（浅色背景上的 tagline 文字） */
export const BRAND_WHITE_85 = 'rgba(255,255,255,0.85)';

/** 图标渐变预设：vivid = 青→蓝→紫（品牌主渐变），default = 蓝→靛→紫 */
export const ICON_GRADIENT_VIVID: GradientStop[] = [
  { offset: '0%', color: '#22D3EE' },
  { offset: '48%', color: '#4F6BF6' },
  { offset: '100%', color: '#A855F7' },
];
export const ICON_GRADIENT_DEFAULT: GradientStop[] = [
  { offset: '0%', color: '#2563EB' },
  { offset: '52%', color: '#4F46E5' },
  { offset: '100%', color: '#7C3AED' },
];

/** 字标两个 "A" 的强调圆点色（左/右） */
export const WORDMARK_DOTS_VIVID: [string, string] = ['#22D3EE', '#A855F7'];
export const WORDMARK_DOTS_DEFAULT: [string, string] = ['#2563EB', '#7C3AED'];

/** tagline 渐变文字（background-clip: text） */
export const TAGLINE_GRADIENT_VIVID =
  'linear-gradient(90deg,#22D3EE 0%,#6366F1 50%,#A855F7 100%)';
export const TAGLINE_GRADIENT_DEFAULT =
  'linear-gradient(90deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)';

/** 字标渐变预设：Footer 用 vivid 深色渐变（浅底可读） */
export const WORDMARK_GRADIENT_VIVID: GradientStop[] = [
  { offset: '0%', color: '#22D3EE' },
  { offset: '50%', color: '#4F6BF6' },
  { offset: '100%', color: '#A855F7' },
];
/** 字标渐变预设：Hero 用浅色渐变（白→浅青→浅紫），避免与 .brand-gradient 横幅底色撞色 */
export const WORDMARK_GRADIENT_HERO: GradientStop[] = [
  { offset: '0%', color: '#FFFFFF' },
  { offset: '48%', color: '#67E8F9' },
  { offset: '100%', color: '#C4B5FD' },
];
