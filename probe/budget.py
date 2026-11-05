import os, re, sys, urllib.request, urllib.parse, json, time
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (civic data dashboard)'}
seen, log = set(), []
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120) as r:
        return r.read(), r.geturl(), r.headers.get('Content-Type', '')
def save(u, b):
    p = re.sub(r'^https?://', '', u).replace('/', '__')[:180]
    open(os.path.join(OUT, p), 'wb').write(b)
starts = ['https://budget.canada.ca/2026/home-accueil-en.html', 'https://budget.canada.ca/2026/report-rapport/toc-tdm-en.html',
          'https://budget.canada.ca/2026/report-rapport/budget-2026.pdf', 'https://budget.canada.ca/2026/report-rapport/budget-2026-en.pdf',
          'https://www.canada.ca/en/department-finance/programs/federal-transfers/major-federal-transfers.html',
          'https://budget.canada.ca/2026/report-rapport/overview-apercu-en.html']
queue = list(starts)
while queue and len(seen) < 120:
    u = queue.pop(0)
    if u in seen: continue
    seen.add(u)
    try:
        b, final, ct = get(u)
    except Exception as e:
        log.append([u, 'ERR', str(e)[:120]]); continue
    save(final, b); log.append([u, final, ct, len(b)])
    if 'html' in ct and ('budget.canada.ca/2026' in final):
        t = b.decode('utf-8', 'replace')
        for h in re.findall(r'href="([^"#]+)"', t):
            v = urllib.parse.urljoin(final, h)
            if v.startswith('https://budget.canada.ca/2026/') and (v.endswith('-en.html') or v.endswith('.pdf') or v.endswith('.csv') or v.endswith('.xlsx')) and v not in seen:
                if v.endswith('.pdf') and 'en' not in v.split('/')[-1]: continue
                queue.append(v)
    time.sleep(0.3)
json.dump(log, open(os.path.join(OUT, '_log.json'), 'w'), indent=0)
print(len(seen), sum(1 for l in log if l[1] != 'ERR'))
