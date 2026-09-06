#!/usr/bin/env node
/**
 * scripts/indexnow-submit.mjs — 部署后向 IndexNow 提交全站 URL（P3.1）
 * IndexNow 协议：Bing/Yandex 等搜索引擎的即时推送（ChatGPT 搜索数据源是 Bing）。
 * key 是公开标识（public/<key>.txt 证明站点控制权），非机密。
 * 用法：node scripts/indexnow-submit.mjs   （cloudflare-deploy.yml 部署成功后调用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'cataito.com';
const sitemapPath = path.join(ROOT, 'out', 'sitemap.xml');

const keyFile = fs.readdirSync(path.join(ROOT, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('IndexNow key 文件缺失（public/<32hex>.txt）');
  process.exit(1);
}
const key = keyFile.replace('.txt', '');

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).slice(0, 10000);
if (!urls.length) {
  console.error('sitemap.xml 无 URL，跳过提交');
  process.exit(0);
}

const body = JSON.stringify({
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}`,
  urlList: urls,
});

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
});
console.log(`IndexNow 提交 ${urls.length} 个 URL → HTTP ${res.status}（202/200 = 成功；422 = key 校验失败；429 = 限流）`);
if (res.status === 200 || res.status === 202) process.exit(0);
process.exit(1);
