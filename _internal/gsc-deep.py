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
start30 = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
start90 = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')

def query_sa(dimensions, limit=5000, **kw):
    body = {'startDate': kw.get('start', start30), 'endDate': kw.get('end', end), 'dimensions': dimensions, 'rowLimit': limit}
    if 'order' in kw:
        body['orderBy'] = [{'fieldName': kw['order'], 'sortOrder': 'DESCENDING'}]
    return service.searchanalytics().query(siteUrl=SITE, body=body).execute()

# 1. 按查询在搜索结果中的位置分组
print("=== 按排名位置分组 ===")
resp = query_sa(['query'], 5000)
pos_buckets = {'1-3': 0, '4-10': 0, '11-30': 0, '31-50': 0, '51+': 0}
for r in resp.get('rows', []):
    pos = r['position']
    if pos <= 3: pos_buckets['1-3'] += r['impressions']
    elif pos <= 10: pos_buckets['4-10'] += r['impressions']
    elif pos <= 30: pos_buckets['11-30'] += r['impressions']
    elif pos <= 50: pos_buckets['31-50'] += r['impressions']
    else: pos_buckets['51+'] += r['impressions']
for k, v in pos_buckets.items():
    print(f"  排名 {k:>6}: {v:>6} 展示 ({v/(sum(pos_buckets.values()) or 1)*100:.1f}%)")

# 2. 按页面路径分类分析
print("\n=== 按页面类型分析（近 30 天） ===")
resp2 = query_sa(['page'], 5000)
categories = {'/tool/': [], '/blog/': [], '/skills/': [], '/mcp/': [], '/tutorials/': [], '/category/': [], '/ranking/': [], 'homepage': [], 'other': []}
for r in resp2.get('rows', []):
    page = r['keys'][0].replace('https://cataito.com', '')
    found = False
    for cat, pages in categories.items():
        if cat == 'homepage':
            continue
        if page.startswith(cat):
            pages.append(r)
            found = True
            break
    if not found:
        if page in ('/', '/en', '/zh', '/ja', '/es', '/fr'):
            categories['homepage'].append(r)
        else:
            categories['other'].append(r)
for cat, pages in categories.items():
    if not pages:
        continue
    clicks = sum(p['clicks'] for p in pages)
    impr = sum(p['impressions'] for p in pages)
    unique = len(pages)
    print(f"  {cat:20s}  {unique:>3} 页面  {impr:>6} 展示  {clicks:>3} 点击")

# 3. 按语言分析
print("\n=== 按语言路径分析 ===")
langs = {'/en/': [], '/zh/': [], '/ja/': [], '/es/': [], '/fr/': []}
for r in resp2.get('rows', []):
    page = r['keys'][0].replace('https://cataito.com', '')
    for lang, pages in langs.items():
        if lang in page:
            pages.append(r)
            break
for lang, pages in langs.items():
    if not pages:
        continue
    clicks = sum(p['clicks'] for p in pages)
    impr = sum(p['impressions'] for p in pages)
    print(f"  {lang:10s}  {len(pages):>3} 页面  {impr:>6} 展示  {clicks:>3} 点击")

# 4. 近 90 天趋势（周维度）
print("\n=== 近 90 天趋势（周聚合） ===")
resp3 = query_sa(['date'], 90, start=start90)
weekly = {}
for r in resp3.get('rows', []):
    d = r['keys'][0]
    # 按周聚合
    week = datetime.strptime(d, '%Y-%m-%d').isocalendar()
    wk = f"{week[0]}-W{week[1]:02d}"
    if wk not in weekly:
        weekly[wk] = {'clicks': 0, 'impressions': 0, 'days': 0}
    weekly[wk]['clicks'] += r['clicks']
    weekly[wk]['impressions'] += r['impressions']
    weekly[wk]['days'] += 1
for wk in sorted(weekly.keys()):
    w = weekly[wk]
    print(f"  {wk}  {w['impressions']:>6} 展示  {w['clicks']:>3} 点击  ({w['days']} 天数据)")

# 5. 新页面（教程版块）表现
print("\n=== 教程版块页面表现 ===")
tutorial_pages = [r for r in resp2.get('rows', []) if '/tutorials/' in r['keys'][0]]
if tutorial_pages:
    for r in tutorial_pages:
        print(f"  {r['keys'][0]:70s}  展示={r['impressions']:>5}  点击={r['clicks']}")
else:
    print("  （教程版块刚上线，尚无展示数据）")

# 6. 排名靠前的关键词（排名 < 20）
print("\n=== 排名靠前的查询（平均排名 < 20） ===")
top_queries = [r for r in resp.get('rows', []) if r['position'] < 20 and r['impressions'] >= 5]
top_queries.sort(key=lambda x: x['position'])
for r in top_queries[:15]:
    print(f"  排名={r['position']:>5.1f}  {r['keys'][0]:40s}  展示={r['impressions']:>5}  点击={r['clicks']:>3}")

# 7. 尝试 URL 前缀属性获取爬取错误
print("\n=== 爬取错误（URL 前缀属性） ===")
try:
    url_site = 'https://cataito.com/'
    errors = service.urlcrawlerrorscounts().query(siteUrl=url_site).execute()
    for cat in errors.get('countPerTypes', []):
        for entry in cat.get('entries', []):
            print(f"  {cat.get('category','?'):25s}  {entry.get('platform','?'):10s}  错误数: {entry.get('count',0)}")
except Exception as e:
    print(f"  URL 前缀属性也需要在 GSC 中验证此属性: {e}")

# 8. 按搜索结果呈现类型
print("\n=== 搜索结果呈现类型 ===")
resp4 = query_sa(['searchAppearance'], 20)
for r in resp4.get('rows', []):
    if r['impressions'] > 0:
        print(f"  {r['keys'][0]:35s}  展示={r['impressions']:>6}  点击={r['clicks']:>3}")

print("\n✅ 深度分析完成")