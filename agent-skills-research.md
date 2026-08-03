# AI Agent Skills Research Report — Content Creator Workflow

Research date: 2026-08-02
Source: GitHub API + skills.sh

---

## 1. Horizon — 每天热点和趋势简报，资讯雷达

| Field | Detail |
|-------|--------|
| **GitHub** | [Thysrael/Horizon](https://github.com/Thysrael/Horizon) |
| **Description** | 📡 AI-powered news radar. Generates daily briefings in English & Chinese. Fetches from Hacker News, RSS, Reddit, Telegram, Twitter/X, GitHub releases, OpenBB financial news — deduplicates, scores, filters, and enriches with background context. |
| **Stars** | ⭐ 8,594 |
| **Forks** | 1,303 |
| **Language** | Python |
| **License** | MIT |
| **Install** | `git clone https://github.com/Thysrael/Horizon.git && cd Horizon && uv sync` (or `pip install -e .`) — also available via Docker |
| **Use Cases** | Daily tech news briefings, multi-source news aggregation, bilingual (zh/en) content curation, automated newsletter delivery, community discussion summaries, Feishu/DingTalk/Slack/Discord/webhook notifications |
| **Notes** | Supports multiple LLM backends (Claude, GPT, Gemini, DeepSeek, Doubao, MiniMax, Ollama). Can be deployed as a GitHub Pages daily site. |

---

## 2. huashu-design — 生成 HTML、原型、可编辑 PPT、动画

| Field | Detail |
|-------|--------|
| **GitHub** | [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) |
| **Description** | HTML-native design skill for AI agents. High-fidelity prototypes, slides, animations + 20 design philosophies + 5-dimension review + MP4 export. Agent-agnostic (works with Claude Code, Codex, Cursor, Hermes, etc.) |
| **Stars** | ⭐ 22,331 |
| **Forks** | 2,634 |
| **Language** | HTML |
| **License** | MIT |
| **Install** | `npx skills add alchaincyf/huashu-design` |
| **Use Cases** | Interactive iOS/Web prototypes with real iPhone bezels, HTML slide decks with editable PPTX export, motion design animations (MP4/GIF), infographics/data visualization, 3+ design direction exploration, 5-dimension expert design review, brand asset management |
| **Notes** | From the same author as nuwa-skill. 40 built-in HTML native style libraries. Includes a junior designer workflow for early validation. |

---

## 3. Auto-Redbook-Skills — 自动写文案、长文章、生成配图

| Field | Detail |
|-------|--------|
| **GitHub** | [comeonzhj/Auto-Redbook-Skills](https://github.com/comeonzhj/Auto-Redbook-Skills) |
| **Description** | 自动撰写小红书笔记、生成多主题卡片、可选自动发布的 Skills. Auto-writes Xiaohongshu (RedNote) posts, generates multi-theme image cards, with optional auto-publishing. |
| **Stars** | ⭐ 2,083 |
| **Forks** | 246 |
| **Language** | Python |
| **License** | None |
| **Install** | `git clone https://github.com/comeonzhj/Auto-Redbook-Skills.git` + `pip install -r requirements.txt` + `playwright install chromium` (or npm equivalent) |
| **Use Cases** | Xiaohongshu content automation, AI-generated copywriting, 8 theme skins (minimalist, geometric, neo-brutalism, botanical, professional, retro, terminal, sketch), 4 pagination modes, auto-publishing via browser automation |
| **Notes** | Plugin install via Claude Code: `/plugin marketplace add comeonzhj/Auto-Redbook-Skills`. Includes cookie-based publishing to Xiaohongshu. |

---

## 4. Generative-Media-Skills — 图片、视频、音频生成工作流

| Field | Detail |
|-------|--------|
| **GitHub** | [SamurAIGPT/Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills) |
| **Description** | Multi-modal Generative Media Skills for AI Agents (Claude Code, Cursor, Gemini CLI). High-quality image, video, and audio generation powered by muapi.ai. |
| **Stars** | ⭐ 3,962 |
| **Forks** | 445 |
| **Language** | Shell |
| **License** | MIT |
| **Install** | `npm install -g muapi-cli` → `muapi auth configure` → `npx skills add SamurAIGPT/Generative-Media-Skills --all` |
| **Use Cases** | Image generation (Midjourney v7, Flux Kontext, Flux Dev), video generation (Kling 3.0, Seedance 2.0, Veo3), cinematic product ads, UGC video factory, social media content packs (Instagram, RedNote, YouTube Shorts), logo/branding, interior design visualization, 41+ ready-to-run workflow recipes |
| **Notes** | Requires muapi.ai API key. Includes MCP server for Claude Desktop. Cinema Director, Nano-Banana, and UI Designer expert libraries. 100+ AI models available. |

---

## 5. nuwa-skill — 固定文风，统一账号表达风格

| Field | Detail |
|-------|--------|
| **GitHub** | [alchaincyf/nuwa-skill](https://github.com/alchaincyf/nuwa-skill) |
| **Description** | 蒸馏任何人的思维方式——心智模型、决策启发式、表达DNA。Distill how anyone thinks. Cast anyone's thinking patterns as an AI skill. |
| **Stars** | ⭐ 29,478 |
| **Forks** | 4,122 |
| **Language** | Python |
| **License** | MIT |
| **Install** | `npx skills add alchaincyf/nuwa-skill` |
| **Use Cases** | Distill thinking patterns of famous people (Steve Jobs, Elon Musk, Naval, Paul Graham, Charlie Munger, Richard Feynman, etc.), fixed writing style for content accounts, unified brand voice, cognitive framework extraction, decision-making heuristic modeling |
| **Notes** | From the same author as huashu-design. 14 pre-distilled personalities + 1 theme. Works across Claude Code, Codex, Cursor, Hermes, Gemini CLI, etc. Extracts 5 layers: expression DNA, mental models, decision heuristics, anti-patterns, and honesty boundaries. |

---

## 6. guizang-social-card-skill — 生成图文卡片和封面图

| Field | Detail |
|-------|--------|
| **GitHub** | [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) |
| **Description** | 🪧 Claude Code / Codex skill — generate Xiaohongshu carousels & WeChat 21:9+1:1 cover pairs. Editorial × Swiss visual systems, 28 layouts, 10 themes, single-file HTML → PNG. |
| **Stars** | ⭐ 5,794 |
| **Forks** | 466 |
| **Language** | HTML |
| **License** | AGPL-3.0 |
| **Install** | `npx skills add https://github.com/op7418/guizang-social-card-skill --skill guizang-social-card-skill` |
| **Use Cases** | RedNote (Xiaohongshu) carousel image sets, WeChat public account 21:9 header + 1:1 share card, Live Photo dynamic cards, social media image cards, editorial/Swiss design systems, 28 layout templates, 10 theme presets |
| **Notes** | Dual visual system (Editorial magazine style + Swiss International style). Supports 28 layout skeletons, 10 theme presets, image sourcing from Unsplash/Pexels/Wallhaven. Includes Playwright-based validation script. |

---

## 7. social-auto-upload — 多平台内容自动上传

| Field | Detail |
|-------|--------|
| **GitHub** | [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload) |
| **Description** | 自动化上传视频到社交媒体：抖音、小红书、视频号、tiktok、youtube、bilibili. Automates video/image uploads to multiple social media platforms. |
| **Stars** | ⭐ 13,927 |
| **Forks** | 2,403 |
| **Language** | Python |
| **License** | None |
| **Install** | `pip install -r requirements.txt` or use the `sau` CLI. See [docs/install.md](https://github.com/dreammis/social-auto-upload/blob/main/docs/install.md) |
| **Use Cases** | Multi-platform video/image auto-upload, scheduled publishing, cross-platform content distribution, supports Douyin (TikTok China), Bilibili, Xiaohongshu, Kuaishou, Video Account (微信视频号), Baijiahao, TikTok, YouTube |
| **Notes** | Uses browser automation (Playwright/patchright). CLI + Skill interfaces for agents. Has specific skills for each platform (douyin-upload, kuaishou-upload, xiaohongshu-upload, bilibili-upload). 13k+ stars, very active community. |

---

## Summary Table

| # | Skill | GitHub | Stars | Lang | Install Command |
|---|-------|--------|-------|------|----------------|
| 1 | **Horizon** | Thysrael/Horizon | 8,594 | Python | `git clone` + `uv sync` |
| 2 | **huashu-design** | alchaincyf/huashu-design | 22,331 | HTML | `npx skills add alchaincyf/huashu-design` |
| 3 | **Auto-Redbook-Skills** | comeonzhj/Auto-Redbook-Skills | 2,083 | Python | `git clone` + `pip install -r requirements.txt` |
| 4 | **Generative-Media-Skills** | SamurAIGPT/Generative-Media-Skills | 3,962 | Shell | `npm i -g muapi-cli` + `npx skills add` |
| 5 | **nuwa-skill** | alchaincyf/nuwa-skill | 29,478 | Python | `npx skills add alchaincyf/nuwa-skill` |
| 6 | **guizang-social-card-skill** | op7418/guizang-social-card-skill | 5,794 | HTML | `npx skills add ...op7418/guizang-social-card-skill` |
| 7 | **social-auto-upload** | dreammis/social-auto-upload | 13,927 | Python | `pip install -r requirements.txt` |

## Workflow Pipeline

These 7 skills form a complete content creator workflow:

1. **Horizon** → News monitoring & trend discovery (content sourcing)
2. **nuwa-skill** → Fixed writing style & brand voice (content strategy)
3. **Auto-Redbook-Skills** → Copywriting & long-form content (content writing)
4. **huashu-design** → HTML prototypes, slides, animations (visual design)
5. **Generative-Media-Skills** → Image/Video/Audio generation (media production)
6. **guizang-social-card-skill** → Social media cards & covers (formatting)
7. **social-auto-upload** → Multi-platform publishing (distribution)