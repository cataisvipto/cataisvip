# CATAI - AI 生态门户

一个面向全球用户的 **AI Ecosystem Portal**，收录 77 款 AI 工具，支持 5 种语言，帮助用户发现和了解 AI 工具。

## 🌐 技术栈

- **框架**: [Next.js](https://nextjs.org) 16.2.10 (App Router + Turbopack)
- **语言**: TypeScript 5.x + React 19
- **样式**: Tailwind CSS 4.x + CSS 变量（亮/暗双模式）
- **国际化**: next-intl 4.x（5 种语言: en/zh/ja/es/fr）
- **图标**: Lucide React
- **部署**: Vercel（自动构建，连接 GitHub）
- **DNS**: Cloudflare（catai.cc.cd）

## 🚀 快速开始

```bash
npm install
npm run dev      # 开发服务器 → http://localhost:3000
npm run build    # 构建验证
npm run start    # 生产模式运行
```

## 📂 项目结构

```
src/
├── app/              # 页面（多语言路由）
│   ├── [locale]/     #   zh/en/ja/es/fr
│   └── ...
├── components/       # 15 个可复用组件
├── data/             # 数据文件（JSON）
│   ├── tools.json         # 77 款工具
│   ├── toolDetails.json   # 77 款详情
│   └── blogPosts.json     # 博客文章
├── i18n/             # 国际化配置
├── lib/seo.ts        # SEO 工具函数
└── proxy.ts          # 中间件（语言路由）
```

## ✨ 核心功能

- 77 款 AI 工具导航（11 大分类，5 种标签）
- 工具详情页（功能/定价/优缺点/教程/社交分享）
- 5 种语言全面支持
- 暗色模式（系统偏好 + 手动切换）
- 博客系统（列表 + 详情 + 封面兜底）
- 分类聚合页（55 个多语言页面）
- SEO 优化（hreflang/canonical/JSON-LD/sitemap）
- Newsletter 邮件订阅
- 资源提交 → 邮件通知

## 🚢 部署

```bash
npm run build                    # 先验证构建
git add .
git commit -m "描述"
git push origin main             # Vercel 自动部署
```

## 📄 内部文档

以下文件为本地运营文件，不上传 Git：
- `CATAI-项目技术文档.html` - 完整技术文档
- `CATAI-运营手册.md/.html` - 运营操作指南
- `快速操作卡片.md/.html` - 日常操作速查
- `tool-editor.html` - 工具可视化编辑器
- `blog-editor.html` - 博客可视化编辑器
- `AGENTS.md` - AI 代理指令
