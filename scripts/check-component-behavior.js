#!/usr/bin/env node
/**
 * 高频改动组件行为级检查（最小断言集）
 *
 * 背景：Header.tsx 与 ToolCard.tsx 是近 30 天 churn 最高的 UI 组件，
 * 针对 AGENTS.md 踩坑清单中的两类已知回归，各做一条行为级断言：
 *
 *   1. 五语言键完整性（行为级）：组件源码中实际引用的翻译键
 *      （useTranslations 命名空间 + t('key') 字面量调用）必须在
 *      messages/{en,zh,ja,es,fr}.json 五个文件中全部存在。
 *      （check-i18n.js 只保证五个文件互相一致，不保证组件用的键真实存在）
 *   2. CSS 变量有效性：组件中引用的每个 var(--xxx) 必须在
 *      src/app/globals.css 中有定义（未定义的变量会静默失效导致样式丢失），
 *      且组件必须至少引用一个设计变量（防止被整体替换成硬编码 Tailwind 色板）。
 *
 * 附加断言：禁止 locale === 'xx' ? '文案A' : '文案B' 二元硬编码文案
 * （会导致 ja/es/fr 回退错误，见 AGENTS.md 踩坑清单第 1 条）。
 *
 * 退出码 0 = 全部通过，1 = 存在回归。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT, 'messages');
const GLOBALS_CSS = path.join(ROOT, 'src', 'app', 'globals.css');

// 受检组件（近 30 天最高 churn）。extraKeys 用于捕获非 t() 形式的键引用。
const TARGETS = [
  {
    file: 'src/components/Header.tsx',
    extraKeys: [],
  },
  {
    file: 'src/components/ToolCard.tsx',
    // PLATFORM_META 的 labelKey 位于 messages.common（见组件内注释）
    extraKeys: [{ pattern: /labelKey:\s*'([^']+)'/g, namespace: 'common' }],
  },
];

const LOCALES = fs.readdirSync(MESSAGES_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.basename(f, '.json'))
  .sort();

/** 按 '.' 路径查询嵌套对象中键是否存在 */
function hasKeyPath(obj, keyPath) {
  let cur = obj;
  for (const part of keyPath.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(part in cur)) return false;
    cur = cur[part];
  }
  return true;
}

/**
 * 从组件源码提取实际使用的翻译键路径
 * - const t = useTranslations('ns') → t('key') → ns.key
 * - const t = useTranslations()     → t('nav.home') → nav.home
 * 仅提取字面量参数，动态参数（如 tCategories(tool.category)）跳过。
 */
function extractUsedKeys(source, extraKeys) {
  const keys = new Set();

  // 1. 收集 useTranslations 绑定：变量名 → 命名空间
  const bindingRe = /(?:const|let|var)\s+(\w+)\s*=\s*useTranslations\(\s*(?:'([^']*)')?\s*\)/g;
  const bindings = [];
  let m;
  while ((m = bindingRe.exec(source)) !== null) {
    bindings.push({ varName: m[1], namespace: m[2] || '' });
  }

  // 2. 收集每个绑定变量的字面量调用
  for (const { varName, namespace } of bindings) {
    const callRe = new RegExp(`\\b${varName}\\(\\s*'([^']+)'`, 'g');
    while ((m = callRe.exec(source)) !== null) {
      keys.add(namespace ? `${namespace}.${m[1]}` : m[1]);
    }
  }

  // 3. 组件特有的额外键模式（如 ToolCard 的 labelKey）
  for (const { pattern, namespace } of extraKeys) {
    pattern.lastIndex = 0;
    while ((m = pattern.exec(source)) !== null) {
      keys.add(namespace ? `${namespace}.${m[1]}` : m[1]);
    }
  }

  return [...keys].sort();
}

// ---- 主流程 ----

let hasError = false;

// 读取五语言文件
const messages = {};
for (const locale of LOCALES) {
  try {
    messages[locale] = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8'));
  } catch (e) {
    console.error(`[ERROR] 无法读取 messages/${locale}.json — ${e.message}`);
    hasError = true;
  }
}

// 读取 globals.css 中已定义的 CSS 变量集合
let definedCssVars = new Set();
try {
  const css = fs.readFileSync(GLOBALS_CSS, 'utf8');
  for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) definedCssVars.add(m[1]);
} catch (e) {
  console.error(`[ERROR] 无法读取 src/app/globals.css — ${e.message}`);
  hasError = true;
}

if (hasError) {
  console.error('\n✘ 组件行为级检查失败：基础文件缺失');
  process.exit(1);
}

let checkedComponents = 0;
let checkedKeys = 0;
let checkedVars = 0;

for (const target of TARGETS) {
  const filePath = path.join(ROOT, target.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] 受检组件不存在: ${target.file}（若已改名请同步更新本脚本 TARGETS）`);
    hasError = true;
    continue;
  }
  checkedComponents++;
  const source = fs.readFileSync(filePath, 'utf8');

  // 断言 1：组件实际引用的翻译键在五个语言文件中全部存在
  const usedKeys = extractUsedKeys(source, target.extraKeys);
  checkedKeys += usedKeys.length;
  for (const key of usedKeys) {
    const missingIn = LOCALES.filter((locale) => !hasKeyPath(messages[locale], key));
    if (missingIn.length > 0) {
      hasError = true;
      console.error(`[ERROR] ${target.file} 引用的翻译键 "${key}" 缺失于: ${missingIn.map((l) => `messages/${l}.json`).join(', ')}`);
    }
  }

  // 断言 2a：组件引用的每个 CSS 变量必须在 globals.css 中有定义
  const usedVars = new Set();
  for (const m of source.matchAll(/var\((--[\w-]+)\)/g)) usedVars.add(m[1]);
  checkedVars += usedVars.size;
  for (const v of usedVars) {
    if (!definedCssVars.has(v)) {
      hasError = true;
      console.error(`[ERROR] ${target.file} 引用了未定义的 CSS 变量 ${v}（globals.css 中不存在，会静默失效）`);
    }
  }

  // 断言 2b：组件必须至少引用一个设计变量（防整体退化为硬编码色板）
  if (usedVars.size === 0) {
    hasError = true;
    console.error(`[ERROR] ${target.file} 未引用任何 CSS 设计变量（应使用 var(--card-bg)、var(--foreground) 等）`);
  }

  // 附加断言：禁止 locale 二元硬编码文案（ja/es/fr 会回退错误）
  const binaryRe = /locale\s*===\s*'[a-z]{2}'\s*\?\s*'[^']*'\s*:\s*'[^']*'/g;
  for (const m of source.matchAll(binaryRe)) {
    hasError = true;
    console.error(`[ERROR] ${target.file} 存在 locale 二元硬编码文案（应改用 next-intl 五语言键）: ${m[0].substring(0, 80)}`);
  }
}

if (hasError) {
  console.error('\n✘ 高频组件行为级检查失败');
  process.exit(1);
} else {
  console.log(`✔ 高频组件行为级检查通过（${checkedComponents} 个组件，${checkedKeys} 个翻译键 × ${LOCALES.length} 语言，${checkedVars} 个 CSS 变量）`);
}
