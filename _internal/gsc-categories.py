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

# 获取近 90 天所有有展示的页面
resp = service.searchanalytics().query(
    siteUrl=SITE,
    body={'startDate': start90, 'endDate': end, 'dimensions': ['page'], 'rowLimit': 25000}
).execute()

# 按 URL 路径分类统计
from collections import defaultdict
cat_stats = defaultdict(lambda: {'pages': set(), 'impressions': 0, 'clicks': 0})

# 16 个分类的 slug
cats = ['chat', 'foundation-models', 'agent', 'code', 'image', 'video', 'avatar',
        'audio', 'music', 'writing', 'design', 'search', 'website-builder',
        'automation', 'api-platform', 'open-source']

for r in resp.get('rows', []):
    page = r['keys'][0].replace('https://cataito.com', '')
    for c in cats:
        if f'/tool/' in page:
            pass
        # 匹配分类页
        if f'/category/{c}' in page:
            cat_stats[c]['impressions'] += r['impressions']
            cat_stats[c]['clicks'] += r['clicks']
            cat_stats[c]['pages'].add(page)
        # 匹配工具页的 slug 前缀无法判断分类，跳过（工具页不直接含分类 slug）

print("=== 分类聚合页流量（近 90 天）===")
for c, s in sorted(cat_stats.items(), key=lambda x: -x[1]['impressions']):
    print(f"  {c:20s}  展示={s['impressions']:>6}  点击={s['clicks']:>3}")

# 工具页按工具分类统计（从 tools.json 映射）
tools = json.load(open(os.path.join(ROOT, '..', 'src', 'data', 'tools.json')))
tool_cat = {t['slug']: t.get('category', '') for t in tools}
tool_stats = defaultdict(lambda: {'impressions': 0, 'clicks': 0, 'pages': 0})

for r in resp.get('rows', []):
    page = r['keys'][0].replace('https://cataito.com', '')
    # /en/tool/<slug> 形式
    parts = page.split('/')
    if len(parts) >= 4 and parts[2] == 'tool':
        slug = parts[3]
        cat = tool_cat.get(slug, '')
        if cat:
            tool_stats[cat]['impressions'] += r['impressions']
            tool_stats[cat]['clicks'] += r['clicks']
            tool_stats[cat]['pages'] += 1

print("\n=== 工具详情页按分类流量（近 90 天）===")
for c, s in sorted(tool_stats.items(), key=lambda x: -x[1]['impressions']):
    print(f"  {c:20s}  {s['pages']:>3} 页  展示={s['impressions']:>6}  点击={s['clicks']:>3}")
