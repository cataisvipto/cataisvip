import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import McpDetailClient from './McpDetailClient';
import mcpServers from '@/data/mcp.json';
import mcpDetails from '@/data/mcpDetails.json';
import tutorials from '@/data/tutorials.json';
import { generateAlternates } from '@/lib/seo';
import { routing } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const entry of mcpServers) {
      params.push({ locale, slug: entry.slug });
    }
  }
  return params;
}

/** Pick the description matching the locale (falls back to English) */
function getLocalizedDescription(entry: (typeof mcpServers)[number], locale: string): string {
  switch (locale) {
    case 'zh': return entry.description;
    case 'ja': return entry.descriptionJa || entry.descriptionEn;
    case 'es': return entry.descriptionEs || entry.descriptionEn;
    case 'fr': return entry.descriptionFr || entry.descriptionEn;
    default: return entry.descriptionEn;
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'mcp' });
  const entry = mcpServers.find((s) => s.slug === slug);
  if (!entry) return { title: t('notFound') };

  const name = locale === 'zh' && entry.nameZh ? entry.nameZh : entry.name;
  return {
      title: `${name} - ${t('title')}`,
      description: getLocalizedDescription(entry, locale),
      alternates: generateAlternates(`/mcp/${slug}`, locale),
      openGraph: {
        title: `${name} - Cataito MCP`,
        description: getLocalizedDescription(entry, locale),
        images: [entry.logo],
      },
      twitter: {
        card: 'summary',
        title: name,
        description: getLocalizedDescription(entry, locale),
        images: [entry.logo],
      },
    };
}

/** Escape HTML special characters */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Convert inline markdown (bold, code, links) to HTML */
function parseInlineMarkdown(text: string): string {
  let result = text;
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Links - filter out dangerous protocols
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const safeUrl = url.replace(/^javascript:/i, '#blocked-javascript:').replace(/^data:/i, '#blocked-data:');
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline">${text}</a>`;
  });
  return result;
}

/** Parse the Installation section from GitHub README markdown into HTML */
function parseInstallSection(markdown: string, copyLabel: string): string | null {
  const installMatch = markdown.match(/^## Installation\n([\s\S]*?)(?=\n## )/m);
  if (!installMatch) return null;

  const section = installMatch[1];
  const lines = section.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let codeIndent = 0;
  let inList = false;

  const renderCodeBlock = () => {
    const escapedCode = escapeHtml(codeContent.trimEnd());
    const langLabel = codeLang || 'text';
    html += `<div class="code-block-wrapper group relative my-3 rounded-lg overflow-hidden border border-[var(--muted-border)]">` +
      `<div class="code-block-header flex items-center justify-between px-4 py-1.5 text-xs border-b border-white/5">` +
      `<span class="font-mono">${escapeHtml(langLabel)}</span>` +
      `<button type="button" class="copy-code-btn flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">` +
      `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` +
      `${escapeHtml(copyLabel)}</button></div>` +
      `<pre class="code-block-body p-4 overflow-x-auto m-0"><code class="text-sm font-mono leading-relaxed">${escapedCode}</code></pre></div>\n`;
    codeContent = '';
    inCodeBlock = false;
  };

  for (const rawLine of lines) {
    // Preserve original line for code content indentation, use trimmed for detection
    const trimmed = rawLine.trim();

    // Indented code block detection (e.g. "  ```bash" after bullet points)
    if (!inCodeBlock && trimmed.startsWith('```')) {
      inCodeBlock = true;
      codeLang = trimmed.slice(3).trim();
      codeIndent = rawLine.length - rawLine.trimStart().length;
      continue;
    }

    // End of code block
    if (inCodeBlock && trimmed.startsWith('```')) {
      renderCodeBlock();
      continue;
    }

    if (inCodeBlock) {
      // Strip the common markdown indentation from code content
      codeContent += (rawLine.length > codeIndent ? rawLine.slice(codeIndent) : rawLine.trimStart()) + '\n';
      continue;
    }

    const line = rawLine.trimEnd();

    // Close list when line is not a list item
    if (inList && !line.startsWith('- ') && trimmed !== '') {
      html += '</ul>\n';
      inList = false;
    }

    // Headings
    if (line.startsWith('#### ')) {
      html += `<h4 class="text-base font-semibold text-[var(--foreground)] mt-4 mb-2">${escapeHtml(line.slice(5))}</h4>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3 class="text-lg font-semibold text-[var(--foreground)] mt-5 mb-2">${escapeHtml(line.slice(4))}</h3>\n`;
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul class="list-disc pl-5 space-y-1 my-2 text-[var(--muted)]">\n';
        inList = true;
      }
      html += `  <li>${parseInlineMarkdown(escapeHtml(line.slice(2)))}</li>\n`;
    } else if (trimmed === '') {
      // Empty line - close list if open (allows code block after list)
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
    } else {
      html += `<p class="text-[var(--muted)] leading-relaxed mb-2">${parseInlineMarkdown(escapeHtml(line))}</p>\n`;
    }
  }

  if (inCodeBlock) renderCodeBlock();
  if (inList) html += '</ul>\n';

  return html;
}

/** Fetch the README from GitHub and extract Installation section as HTML */
async function fetchReadmeInstallHtml(repo: string, copyLabel: string): Promise<string | null> {
  const branches = ['main', 'master'];
  for (const branch of branches) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const url = `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } });
      clearTimeout(timeout);
      if (res.ok) {
        const md = await res.text();
        return parseInstallSection(md, copyLabel);
      }
    } catch {
      // try next branch
    }
  }
  return null;
}

/** 星数单一数据源：直接读 mcp.json 的 stars（由 refresh-stars 定时/手动刷新），与列表卡片始终一致 */
export default async function McpDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = mcpServers.find((s) => s.slug === slug);
  if (!entry) notFound();

  const t = await getTranslations({ locale, namespace: 'mcp' });
  const readmeInstallHtml = await fetchReadmeInstallHtml(entry.repo, t('copyCommand'));

  // 关联教程（related.mcp 显式声明），只传渲染需要的字段
  const relatedTutorials = tutorials
    .filter((tut: any) => (tut.related?.mcp || []).includes(slug))
    .map((tut: any) => ({
          slug: tut.slug,
          title: tut.title,
          excerpt: tut.excerpt,
          difficulty: tut.difficulty,
          readTime: tut.readTime,
          coverImage: tut.coverImage,
        }));

  return (
      <McpDetailClient
        server={entry}
        locale={locale}
        details={(mcpDetails as Record<string, any>)[slug]}
        readmeInstallHtml={readmeInstallHtml ?? undefined}
        relatedTutorials={relatedTutorials}
      />
    );
}
