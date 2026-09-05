// Google AdSense 配置 — 单一来源。
//
// 这两个值本身不敏感：渲染后的 HTML 会把它们发给每个访客的浏览器，
// 放环境变量还是硬编码，暴露程度一样（AdSense 的 ca-pub / slot 设计如此）。
// 因此直接硬编码，省去 GitHub Actions Secrets 配置，push 即生效。
//
// 如需轮换 ID：改这两个常量 → commit → push。
// 如需临时关停广告：把 ADSENSE_UNIT 置空即可（组件会 return null，
// 页面不渲染任何广告元素，不影响站点其他部分）。
export const ADSENSE_CLIENT = 'ca-pub-7103529190038161';
export const ADSENSE_UNIT = '3980460186';
