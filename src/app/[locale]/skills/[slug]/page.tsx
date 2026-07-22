import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import SkillDetailClient from './SkillDetailClient';
import skills from '@/data/skills.json';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const locales = ['en', 'zh', 'ja', 'es', 'fr'];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const skill of skills) {
      params.push({ locale, slug: skill.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'skills' });
  const skill = (skills as any[]).find((s: any) => s.slug === slug);
  if (!skill) return { title: t('notFound') };

  const name = locale === 'zh' && skill.nameZh ? skill.nameZh : skill.name;
  return {
    title: `${name} - ${t('title')}`,
    description: locale === 'zh' ? skill.description : skill.descriptionEn,
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
function parseInstallSection(markdown: string): string | null {
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
    html += `<div class="code-block-wrapper group relative my-3 rounded-lg overflow-hidden border border-[var(--card-border)]">` +
      `<div class="code-block-header flex items-center justify-between px-4 py-1.5 text-xs border-b border-white/5">` +
      `<span class="font-mono">${escapeHtml(langLabel)}</span>` +
      `<button type="button" class="copy-code-btn flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">` +
      `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` +
      `Copy</button></div>` +
      `<pre class="code-block-body p-4 overflow-x-auto m-0"><code class="text-sm font-mono leading-relaxed">${escapedCode}</code></pre></div>\n`;
    codeContent = '';
    inCodeBlock = false;
  };

  for (let rawLine of lines) {
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
async function fetchReadmeInstallHtml(repo: string): Promise<string | null> {
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
        return parseInstallSection(md);
      }
    } catch {
      // try next branch
    }
  }
  return null;
}

/** Fetch live star count from GitHub API at build time */
async function fetchGitHubStars(repo: string): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal, next: { revalidate: 3600 } });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return data.stargazers_count ?? null;
    }
  } catch {
    // fallback to static stars
  }
  return null;
}

export default async function SkillDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const skill = (skills as any[]).find((s: any) => s.slug === slug);
  if (!skill) notFound();

  const [readmeInstallHtml, gitHubStars] = await Promise.all([
    fetchReadmeInstallHtml(skill.repo),
    fetchGitHubStars(skill.repo),
  ]);

  return (
    <SkillDetailClient
      skill={skill as any}
      locale={locale}
      readmeInstallHtml={readmeInstallHtml ?? undefined}
      gitHubStars={gitHubStars ?? undefined}
    />
  );
}
