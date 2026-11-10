# The City of Calgary's proposed 2027-2030 budget: the open data sets, the budget pages and the documents they link to.
import json, re, requests, os
from urllib.parse import urljoin
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight; hello@calgaryinsight.ca)'}
def get(u, **k):
    try:
        r = requests.get(u, headers=UA, timeout=60, **k); print(r.status_code, len(r.content), u); return r
    except Exception as e: print('ERR', e, u)
for id in ['vju8-isk3', 's4mq-cses', 'nnnm-9sfh', 'fqax-i3nz']:
    m = get(f'https://data.calgary.ca/api/views/{id}.json')
    if m and m.status_code == 200: open(f'out/{id}.meta.json', 'w').write(m.text)
    c = get(f'https://data.calgary.ca/api/views/{id}/rows.csv?accessType=DOWNLOAD')
    if c and c.status_code == 200: open(f'out/{id}.csv', 'wb').write(c.content)
pages = ['https://www.calgary.ca/our-finances/2027-budget.html', 'https://www.calgary.ca/our-finances/budgets.html', 'https://www.calgary.ca/water/water-utility/2027-water-rates-and-billing.html',
         'https://www.calgary.ca/water/water-utility/residential-water-rates-and-billing.html', 'https://newsroom.calgary.ca/', 'https://www.calgary.ca/our-finances/budget-process.html',
         'https://www.calgary.ca/property-owners/taxes/tax-rate.html', 'https://www.calgary.ca/waste/residential/waste-collection-fees.html']
links = {}
for i, u in enumerate(pages):
    r = get(u)
    if not r or r.status_code != 200: continue
    open(f'out/page{i}.html', 'w').write(r.text)
    for h in re.findall(r'href="([^"]+)"', r.text):
        a = urljoin(r.url, h)
        if re.search(r'\.pdf|2027|budget|newsroom\.calgary\.ca/[a-z]', a, re.I) and 'facebook' not in a: links[a] = u
json.dump(links, open('out/links.json', 'w'), indent=1)
pdfs = [a for a in links if a.lower().endswith('.pdf') and ('2027' in a or 'budget' in a.lower() or 'rate' in a.lower())][:30]
import pdfplumber
for a in pdfs:
    r = get(a)
    if not r or r.status_code != 200: continue
    fn = 'out/' + re.sub(r'[^A-Za-z0-9.-]', '_', a.split('/')[-1])[:90]
    open(fn, 'wb').write(r.content)
    try:
        with pdfplumber.open(fn) as p:
            open(fn + '.txt', 'w').write('\n\n=== page\n'.join((pg.extract_text() or '') for pg in p.pages))
            print('  pages', len(p.pages))
    except Exception as e: print('  pdf err', e)
# the newsroom release on the budget
n = get('https://newsroom.calgary.ca/')
if n and n.status_code == 200:
    for a in sorted(set(re.findall(r'href="(https://newsroom\.calgary\.ca/[^"]+)"', n.text))):
        if re.search(r'budget|2027|tax', a, re.I):
            r = get(a)
            if r and r.status_code == 200: open('out/news_' + re.sub(r'[^a-z0-9]+', '_', a.split('/')[-2] or a.split('/')[-1])[:60] + '.html', 'w').write(r.text)
