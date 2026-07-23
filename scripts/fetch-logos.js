#!/usr/bin/env node
/*
 * Localize all external tool/skill logos into /public/logos so they load in
 * EVERY network environment (including mainland China) without depending on
 * Google's favicon service, raw.githubusercontent.com, or other blocked hosts.
 *
 * Why: 89/92 tool logos and all skill logos currently load from
 * www.google.com/s2/favicons, which is blocked in China -> blank logos.
 * Same-origin /logos/... assets always load wherever the site itself loads.
 *
 * Usage (run with network access; if you are in China, turn on VPN first):
 *   node scripts/fetch-logos.js
 *
 * The script is idempotent: entries already pointing at /logos/ are skipped,
 * so re-running only fetches newly added tools/skills. Any download that fails
 * keeps its original remote URL (the ToolCard onError fallback covers it).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'logos');

const TARGETS = [
  { file: 'src/data/tools.json', sub: 'tools' },
  { file: 'src/data/skills.json', sub: 'skills' },
];

function pickExt(contentType, url) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('svg')) return 'svg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('icon') || ct.includes('ico')) return 'ico';
  const m = url.split('?')[0].match(/\.(png|jpe?g|svg|ico|webp)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
}

const FETCH_TIMEOUT_MS = 12000;
const RETRIES = 2;

async function download(url) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'User-Agent': 'Mozilla/5.0 (logo-localizer)' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error('empty/too small (' + buf.length + 'B)');
      return { buf, type };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// Resolve the brand domain for an item: prefer the domain= param of the
// existing Google favicon URL, else the hostname of the item URL.
function resolveDomain(item) {
  const l = item.logo || '';
  const m = l.match(/[?&]domain=([^&]+)/);
  if (m) return decodeURIComponent(m[1]);
  if (item.url) { try { return new URL(item.url).hostname; } catch {} }
  try { return new URL(l).hostname; } catch {}
  return null;
}

// Fetch an icon for an item. Order: an existing non-Google image URL, then
// icon.horse by domain (reachable at build time), then the site's own
// /favicon.ico. Google's favicon service is avoided (blocked in some networks).
async function fetchIcon(item) {
  const cur = item.logo || '';
  if (cur && !cur.includes('google.com/s2/favicons')) {
    try { return await download(cur); } catch {}
  }
  const domain = resolveDomain(item);
  if (!domain) throw new Error('no domain');
  try {
    return await download('https://icon.horse/icon/' + domain);
  } catch {
    return await download('https://' + domain + '/favicon.ico');
  }
}

(async () => {
  let localized = 0;
  const failed = [];

  for (const { file, sub } of TARGETS) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) {
      console.log('skip (not found):', file);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const list = Array.isArray(data) ? data : data.skills || data.tools || [];
    const dir = path.join(OUT_DIR, sub);
    fs.mkdirSync(dir, { recursive: true });

    for (const item of list) {
      const cur = item.logo;
      if (!cur || cur.startsWith('/logos/')) continue; // already local

      try {
        const { buf, type } = await fetchIcon(item);
        const ext = pickExt(type, cur);
        const fname = `${item.slug}.${ext}`;
        fs.writeFileSync(path.join(dir, fname), buf);
        item.logo = `/logos/${sub}/${fname}`;
        localized++;
        console.log('OK  ', item.slug.padEnd(24), '->', item.logo, `(${buf.length}B)`);
      } catch (err) {
        failed.push(`${sub}/${item.slug}: ${err.message}`);
        console.log('FAIL', item.slug.padEnd(24), cur, '::', err.message);
      }
      await new Promise((r) => setTimeout(r, 120));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  console.log(`\nLocalized ${localized} logo(s). Failed: ${failed.length}`);
  if (failed.length) {
    console.log('Kept remote URL (onError fallback applies):');
    failed.forEach((f) => console.log('  - ' + f));
  }
  console.log('\nNext: npx next build  ->  git add public/logos src/data  ->  commit & push');
})();
