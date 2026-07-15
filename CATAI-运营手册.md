# CATAI 网站运营手册

> 版本：v1.0  
> 最后更新：2025年7月  
> 适用对象：站长 / 运营人员

---

## 目录

1. [项目概述](#项目概述)
2. [首次部署指南](#首次部署指南)
3. [日常维护](#日常维护)
4. [内容更新](#内容更新)
5. [监控与分析](#监控与分析)
6. [SEO 优化](#seo-优化)
7. [故障排查](#故障排查)
8. [备份与回滚](#备份与回滚)
9. [性能优化](#性能优化)
10. [未来规划](#未来规划)
11. [常用命令速查](#常用命令速查)
12. [联系与支持](#联系与支持)

---

## 项目概述

### 网站信息
- **域名**：catai.cc.cd
- **定位**：AI 生态门户（AI Ecosystem Portal）
- **技术栈**：Next.js 16 + TypeScript + Tailwind CSS
- **部署平台**：Vercel
- **DNS 托管**：Cloudflare
- **代码托管**：GitHub

### 核心功能
- ✅ 37+ AI 工具导航
- ✅ 中英文双语支持
- ✅ 工具详情页（核心功能、定价、使用场景、优缺点）
- ✅ 响应式设计（手机/平板/电脑）
- ✅ SEO 优化（静态生成、结构化数据、sitemap）
- ✅ Google Analytics 数据追踪
- ✅ 隐私政策 & 免责声明（多语言）

### 文件结构
```
catai/
├── src/
│   ├── app/              # 页面
│   │   ├── [locale]/     # 多语言页面
│   │   │   ├── tool/[slug]/  # 工具详情页
│   │   │   ├── privacy/  # 隐私政策
│   │   │   ├── disclaimer/ # 免责声明
│   │   │   └── submit/   # 提交页面
│   │   └── GoogleAnalytics.tsx  # 统计代码
│   ├── components/       # 组件
│   │   ├── Header.tsx    # 顶部导航
│   │   ├── Footer.tsx    # 底部
│   │   ├── ToolCard.tsx  # 工具卡片
│   │   └── ...
│   ├── data/             # 数据文件
│   │   ├── tools.json    # 工具列表 ⭐
│   │   └── toolDetails.json  # 工具详情 ⭐
│   └── i18n/             # 国际化配置
├── messages/             # 翻译文件
│   ├── en.json           # 英文翻译
│   └── zh.json           # 中文翻译
├── tool-editor.html      # 可视化工具编辑器
└── package.json          # 项目配置
```

---

## 首次部署指南

### 第一步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写信息：
   - **Repository name**：`catai`
   - **Description**：`AI Ecosystem Portal - Your gateway to the global AI ecosystem`
   - **Public**（公开）
   - **不要**勾选 "Add a README file"
3. 点击 **Create repository**

### 第二步：推送代码到 GitHub

在本地 catai 文件夹打开终端，运行：

```bash
# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/catai.git

# 推送代码
git branch -M main
git push -u origin main

# 推送版本标签
git push origin v1.0
```

### 第三步：部署到 Vercel

1. 访问 https://vercel.com/signup
2. 使用 **GitHub 账号** 登录
3. 点击 **Add New Project**
4. 选择 `catai` 仓库
5. 配置：
   - **Framework Preset**：Next.js
   - **Root Directory**：`./`（默认）
   - **Build Command**：`npm run build`（默认）
   - **Output Directory**：`.next`（默认）
6. 点击 **Deploy**
7. 等待 1-2 分钟，部署完成

### 第四步：配置域名

#### 4.1 在 Vercel 添加域名

1. 进入项目 → **Settings** → **Domains**
2. 输入 `catai.cc.cd`
3. 点击 **Add**
4. 按提示添加 DNS 记录

#### 4.2 在 Cloudflare 配置 DNS

1. 登录 https://dash.cloudflare.com
2. 选择 `catai.cc.cd` 域名
3. 进入 **DNS** → **Records**
4. 添加记录：
   - **Type**：`CNAME`
   - **Name**：`@`（或留空）
   - **Target**：`cname.vercel-dns.com`
   - **Proxy status**：`DNS only`（关闭代理）
5. 保存，等待 5-10 分钟生效

#### 4.3 验证部署

访问 https://catai.cc.cd，确认网站正常显示。

### 第五步：提交 Google 收录

#### 5.1 Google Search Console

1. 访问 https://search.google.com/search-console
2. 添加资源：`https://catai.cc.cd`
3. 验证方式：选择 **DNS 验证**（在 Cloudflare 添加 TXT 记录）
4. 验证成功后，提交 Sitemap：
   ```
   https://catai.cc.cd/sitemap.xml
   ```

#### 5.2 验证收录

1-2 周后，在 Search Console 查看：
- **覆盖率**：查看已收录页面
- **效果**：查看搜索关键词和排名

---

## 日常维护

### 每日检查（1分钟）

- [ ] 访问网站，确认正常打开
- [ ] 检查中英文切换是否正常
- [ ] 查看 Google Analytics 实时数据

### 每周任务

- [ ] 添加 3-5 个新工具
- [ ] 检查 Google Search Console 是否有错误
- [ ] 查看 Analytics 数据，分析流量来源

### 每月任务

- [ ] 备份数据文件
- [ ] 检查所有链接是否有效
- [ ] 更新工具信息（如有变化）
- [ ] 分析 SEO 效果

---

## 内容更新

### 方法一：使用可视化工具（推荐）

1. 打开 `tool-editor.html`
2. 填写工具信息
3. 点击"生成 JSON"
4. 复制生成的代码
5. 粘贴到对应文件：
   - `src/data/tools.json`：基础信息
   - `src/data/toolDetails.json`：详细信息（可选）
6. 提交代码：
   ```bash
   git add .
   git commit -m "添加新工具：XXX"
   git push
   ```

### 方法二：直接编辑 JSON

#### 添加新工具

**1. 编辑 tools.json**

在最后一个 `}` 后面加逗号，添加：

```json
{
  "slug": "新工具标识",
  "name": "English Name",
  "nameZh": "中文名称",
  "description": "中文描述",
  "descriptionEn": "English description",
  "url": "https://工具官网.com",
  "logo": "https://www.google.com/s2/favicons?domain=工具官网.com&sz=128",
  "category": "分类",
  "tags": ["Free"],
  "featured": false
}
```

**2. 编辑 toolDetails.json（可选）**

```json
"新工具标识": {
  "features": {
    "en": ["Feature 1", "Feature 2"],
    "zh": ["功能1", "功能2"]
  },
  "useCases": {
    "en": ["Use case 1"],
    "zh": ["使用场景1"]
  },
  "pros": {
    "en": ["Pros 1"],
    "zh": ["优点1"]
  },
  "cons": {
    "en": ["Cons 1"],
    "zh": ["缺点1"]
  },
  "latestUpdate": {
    "en": "Latest update",
    "zh": "最新动态"
  }
}
```

**3. 提交并部署**

```bash
git add .
git commit -m "添加新工具：XXX"
git push
```

### 修改现有工具

1. 打开 `tools.json` 或 `toolDetails.json`
2. 找到对应工具的条目
3. 修改内容
4. 提交代码

### 修改页面文案

#### 修改翻译文件

- 英文：`messages/en.json`
- 中文：`messages/zh.json`

修改后提交即可。

---

## 监控与分析

### Google Analytics

**访问地址**：https://analytics.google.com

**查看内容**：
- **实时**：当前在线用户
- **报告**：页面浏览量、用户来源、设备类型
- **获取**：搜索关键词、点击率

**测量 ID**：`G-TZM2023RV7`

### Google Search Console

**访问地址**：https://search.google.com/search-console

**查看内容**：
- **覆盖率**：Google 收录了哪些页面
- **效果**：搜索关键词、排名、点击率
- **站点地图**：sitemap 提交状态

### Vercel Analytics

**访问地址**：https://vercel.com/dashboard

**查看内容**：
- 页面访问量
- 性能指标（Core Web Vitals）
- 访客地区

---

## SEO 优化

### 已实现的优化

- ✅ 静态生成（SSG）- 页面加载快
- ✅ 结构化数据（JSON-LD）- 搜索结果展示丰富
- ✅ Sitemap.xml - 帮助 Google 发现页面
- ✅ Robots.txt - 指导爬虫行为
- ✅ Meta 标签 - 标题、描述、关键词
- ✅ Open Graph - 社交媒体分享优化
- ✅ 语义化 HTML - 清晰的页面结构
- ✅ 多语言支持 - hreflang 标签

### 持续优化建议

1. **内容质量**
   - 每个工具添加详细描述（300+ 字）
   - 添加使用教程和案例
   - 定期更新工具信息

2. **内链建设**
   - 相关工具互相链接
   - 分类页面链接到工具

3. **外链建设**
   - 在 AI 相关论坛分享
   - 提交到导航网站
   - 写客座文章

4. **技术优化**
   - 压缩图片
   - 减少 JavaScript 体积
   - 启用缓存

---

## 故障排查

### 网站无法访问

**检查步骤**：

1. **检查 Vercel 状态**
   ```bash
   # 访问 Vercel Dashboard
   https://vercel.com/dashboard
   ```

2. **检查域名解析**
   ```bash
   # 在终端运行
   ping catai.cc.cd
   ```

3. **检查部署日志**
   - Vercel Dashboard → 项目 → Deployments

### 页面显示异常

**常见原因**：

1. **JSON 格式错误**
   ```bash
   # 验证 JSON 格式
   # 访问 https://jsonlint.com/
   ```

2. **构建失败**
   - 查看 Vercel 部署日志
   - 本地运行 `npm run build` 测试

3. **缓存问题**
   - 清除浏览器缓存
   - 硬刷新：Ctrl + F5

### Logo 不显示

**原因**：Google Favicon 服务可能无法获取某些网站的图标

**解决方案**：
1. 手动上传 Logo 到 `public/logos/` 文件夹
2. 修改 tools.json 中的 logo 路径：
   ```json
   "logo": "/logos/工具名.png"
   ```

### 多语言切换异常

**检查**：
1. 浏览器控制台是否有错误
2. 翻译文件是否完整
3. 路由配置是否正确

---

## 备份与回滚

### 自动备份（GitHub）

所有代码自动保存在 GitHub，无需手动备份。

### 手动备份

**备份数据文件**：
```bash
# 复制数据文件到备份目录
cp src/data/tools.json backups/tools_$(date +%Y%m%d).json
cp src/data/toolDetails.json backups/toolDetails_$(date +%Y%m%d).json
```

### 回滚到上一版本

**方法1：回滚最后一次提交**
```bash
# 查看最近提交
git log --oneline -5

# 回滚到上一版本
git reset --hard HEAD~1
git push --force
```

**方法2：回滚到指定版本**
```bash
# 查看所有版本
git log --oneline

# 回滚到 v1.0
git reset --hard v1.0
git push --force
```

**方法3：只回滚特定文件**
```bash
# 查看文件历史
git log --oneline src/data/tools.json

# 恢复文件到指定版本
git checkout v1.0 -- src/data/tools.json
git commit -m "回滚 tools.json 到 v1.0"
git push
```

---

## 性能优化

### 图片优化

1. **使用 WebP 格式**（体积更小）
2. **压缩图片**（使用 TinyPNG）
3. **使用 CDN**（Vercel 已内置）

### 代码优化

1. **减少依赖**
   ```bash
   # 检查包体积
   npm run analyze
   ```

2. **代码分割**
   - Next.js 自动处理
   - 使用 `dynamic import` 延迟加载

3. **缓存策略**
   - Vercel 自动配置 CDN 缓存
   - 静态资源长期缓存

### 监控性能

**工具**：
- Google PageSpeed Insights
- WebPageTest
- Vercel Analytics

**目标指标**：
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

---

## 未来规划

### 第二期功能（建议）

1. **AI 新闻聚合**
   - 自动抓取 AI 行业新闻
   - 多语言翻译
   - 分类展示

2. **AI Agent 下载中心**
   - Agent 市场
   - 用户评价
   - 一键安装

3. **用户系统**
   - 用户注册/登录
   - 收藏工具
   - 提交工具

4. **评论系统**
   - 工具评价
   - 用户讨论

5. **暗色模式**
   - 自动切换
   - 用户偏好

### 变现方式

1. **Google AdSense**
   - 申请地址：https://www.google.com/adsense
   - 流量达到一定规模后申请

2. **联盟营销**
   - AI 工具推荐链接
   - 佣金收入

3. **付费收录**
   - 工具优先展示
   - 特色标签

4. **赞助内容**
   - 工具评测
   - 专题文章

---

## 常用命令速查

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start

# 代码检查
npm run lint
```

### Git 操作

```bash
# 查看状态
git status

# 添加所有修改
git add .

# 提交
git commit -m "修改说明"

# 推送到 GitHub
git push

# 查看提交历史
git log --oneline

# 创建版本标签
git tag -a v1.1 -m "版本说明"
git push origin v1.1
```

### 回滚操作

```bash
# 回滚到上一版本
git reset --hard HEAD~1
git push --force

# 回滚到指定版本
git reset --hard v1.0
git push --force

# 只回滚特定文件
git checkout v1.0 -- 文件路径
git commit -m "回滚文件"
git push
```

---

## 联系与支持

### 项目联系方式

- **邮箱**：cataisvip@gmail.com
- **网站**：https://catai.cc.cd

### 技术支持

- **Next.js 文档**：https://nextjs.org/docs
- **Vercel 文档**：https://vercel.com/docs
- **next-intl 文档**：https://next-intl-docs.vercel.app

### 相关账号

- **GitHub**：（你的 GitHub 账号）
- **Vercel**：（你的 Vercel 账号）
- **Cloudflare**：（你的 Cloudflare 账号）
- **Google Analytics**：G-TZM2023RV7
- **Google Search Console**：catai.cc.cd

---

## 附录

### A. 工具分类说明

| 分类 | 说明 | 示例 |
|------|------|------|
| Chat | 对话与助手 | ChatGPT, Claude |
| Image | 图像生成 | Midjourney, DALL-E |
| Code | 代码与开发 | GitHub Copilot |
| Writing | 写作与内容 | Jasper, Copy.ai |
| Video | 视频与动画 | Runway, Pika |
| Audio | 音频与语音 | ElevenLabs |
| Search | 搜索与研究 | Perplexity |
| Design | 设计与创意 | Canva AI |
| Agent | AI 智能体 | AutoGPT |
| Developer | 开发者工具 | Cursor |
| Platform | 平台与模型 | Hugging Face |

### B. 标签说明

| 标签 | 说明 |
|------|------|
| Free | 完全免费 |
| Freemium | 有免费额度 |
| Paid | 付费使用 |
| Open Source | 开源项目 |
| API | 提供 API 接口 |

### C. 常见问题解答

**Q: 多久添加一次新工具？**  
A: 建议每周 3-5 个，保持更新频率。

**Q: 如何知道哪些工具受欢迎？**  
A: 查看 Google Analytics 的页面浏览量数据。

**Q: 网站加载慢怎么办？**  
A: 检查图片大小，使用 WebP 格式，启用 CDN 缓存。

**Q: Google 收录慢怎么办？**  
A: 在 Search Console 手动提交 URL，增加高质量内容，建立外链。

**Q: 如何申请 Google AdSense？**  
A: 网站上线 3-6 个月，有一定流量后申请。

---

**文档版本**：v1.0  
**最后更新**：2025年7月  
**维护者**：CATAI 团队
