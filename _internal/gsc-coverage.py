import json, os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

ROOT = os.path.dirname(os.path.abspath(__file__))
client = json.load(open(os.path.join(ROOT, 'gsc-oauth-client.json')))
token_data = json.load(open(os.path.join(ROOT, 'gsc-token.json')))

creds = Credentials(
    token=token_data.get('token'),
    refresh_token=token_data.get('refresh_token'),
    token_uri=client['installed']['token_uri'],
    client_id=client['installed']['client_id'],
    client_secret=client['installed']['client_secret'],
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
if creds.expired and creds.refresh_token:
    creds.refresh(Request())

service = build('searchconsole', 'v1', credentials=creds)
SITE = 'sc-domain:cataito.com'
end = datetime.now().strftime('%Y-%m-%d')
start90 = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')

# 1. 获取所有有展示的页面（近 90 天）→ 已索引的页面
print("=== 获取有展示的页面（近 90 天）===")
resp = service.searchanalytics().query(
    siteUrl=SITE,
    body={'startDate': start90, 'endDate': end, 'dimensions': ['page'], 'rowLimit': 25000}
).execute()
indexed_pages = set()
for r in resp.get('rows', []):
    page = r['keys'][0].replace('https://cataito.com', '')
    page = page.rstrip('/')
    indexed_pages.add(page)

print(f"  有展示的独立页面: {len(indexed_pages)}")

# 2. 加载全站路径清单
data_dir = os.path.join(ROOT, '..', 'src', 'data')
tools = json.load(open(os.path.join(data_dir, 'tools.json')))
skills = json.load(open(os.path.join(data_dir, 'skills.json')))
mcp = json.load(open(os.path.join(data_dir, 'mcp.json')))
tutorials = json.load(open(os.path.join(data_dir, 'tutorials.json')))
blog = json.load(open(os.path.join(data_dir, 'blogPosts.json')))
locales = ['en', 'zh', 'ja', 'es', 'fr']

all_pages = set()
for loc in locales:
    all_pages.add(f'/{loc}')
    for t in tools:
        all_pages.add(f'/{loc}/tool/{t["slug"]}')
    for s in skills:
        all_pages.add(f'/{loc}/skills/{s["slug"]}')
    for m in mcp:
        all_pages.add(f'/{loc}/mcp/{m["slug"]}')
    for b in blog:
        all_pages.add(f'/{loc}/blog/{b["slug"]}')
    for t in tutorials:
        all_pages.add(f'/{loc}/tutorials/{t["slug"]}')
    cats = list(set(t.get('category','') for t in tools))
    for c in cats:
        all_pages.add(f'/{loc}/category/{c}')
    all_pages.add(f'/{loc}/tutorials')

print(f"  全站总页面数: {len(all_pages)}")

# 3. 未索引页面
not_indexed = all_pages - indexed_pages
print(f"  未索引（无展示）: {len(not_indexed)}")

# 4. 按类型分组
by_type = {}
for p in sorted(not_indexed):
    segs = p.split('/')
    typ = segs[2] if len(segs) >= 3 else 'home'
    if typ not in by_type:
        by_type[typ] = []
    by_type[typ].append(p)

print("\n=== 未索引页面按类型分布 ===")
for typ, pages in sorted(by_type.items(), key=lambda x: -len(x[1])):
    print(f"  /{typ:20s}  {len(pages):>4} 页")

# 5. 按语言分布
print("\n=== 未索引页面按语言分布 ===")
by_locale = {}
for p in sorted(not_indexed):
    loc = p.split('/')[1] if p.startswith('/') else '?'
    by_locale[loc] = by_locale.get(loc, 0) + 1
for loc, count in sorted(by_locale.items(), key=lambda x: -x[1]):
    print(f"  /{loc:10s}  {count:>4} 页")

# 6. 各类型索引率
print(f"\n=== 各类型索引率 ===")
CAT_PAGES = {f'/{loc}/tool/{t["slug"]}' for t in tools for loc in locales}
SKILL_PAGES = {f'/{loc}/skills/{s["slug"]}' for s in skills for loc in locales}
MCP_PAGES = {f'/{loc}/mcp/{m["slug"]}' for m in mcp for loc in locales}
BLOG_PAGES = {f'/{loc}/blog/{b["slug"]}' for b in blog for loc in locales}
TUTORIAL_PAGES = {f'/{loc}/tutorials/{t["slug"]}' for t in tutorials for loc in locales}
HOME_PAGES = {f'/{loc}' for loc in locales}

for name, pageset in [('工具页', CAT_PAGES), ('技能页', SKILL_PAGES), ('MCP页', MCP_PAGES),
                        ('博客页', BLOG_PAGES), ('教程页', TUTORIAL_PAGES), ('首页', HOME_PAGES)]:
    idx = len(pageset & indexed_pages)
    total_cat = len(pageset)
    print(f"  {name:10s}  {idx:>3}/{total_cat:>3}  ({idx/total_cat*100:.0f}%)")

# 7. 采样 5 个未索引页面 URL 检查（确认状态）
print("\n=== 采样 URL 检查（5 个）===")
sample = sorted(not_indexed)[:5]
for page in sample:
    try:
        insp = service.urlInspection().index().inspect(
            body={'inspectionUrl': f'https://cataito.com{page}', 'siteUrl': SITE}
        ).execute()
        result = insp.get('inspectionResult', {})
        idx_status = result.get('indexStatusResult', {})
        verdict = idx_status.get('verdict', '?')
        coverage = idx_status.get('coverageState', '?')
        print(f"  {page:50s}  状态: {verdict:15s}  覆盖: {coverage}")
    except Exception as e:
        print(f"  {page:50s}  错误: {str(e)[:60]}")

print("\n✅ 分析完成")