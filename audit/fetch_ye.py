"""Read only. Downloads the City of Calgary's year-end financial updates (operating and capital budget against actual,
by department) for 2023 to 2025, and the annual financial reports, untouched, with their text. usage: fetch_ye.py <out>"""
import os, sys, time, subprocess, urllib.request, json
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (calgaryinsight budget-vs-actual)'}
LOG = []
def get(url):
    for i in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                return r.read(), r.headers.get('Content-Type', ''), r.headers.get('Content-Disposition', '')
        except Exception as e:
            LOG.append(f'retry {i} {url} {e}'); time.sleep(3)
    return None, '', ''
def keep(name, url):
    b, ct, cd = get(url)
    if not b: LOG.append('FAILED ' + url); return
    if not b[:5] == b'%PDF-': LOG.append(f'not a pdf {url} {ct} {len(b)}'); return
    p = os.path.join(OUT, name + '.pdf'); open(p, 'wb').write(b)
    subprocess.run(['pdftotext', '-layout', p, p[:-4] + '.txt'])
    t = open(p[:-4] + '.txt', errors='replace').read()
    hit = any(k in t for k in ('comparison to Actuals', 'Comparison to Actuals', 'Year-End', 'Year End', 'year-end'))
    first = ' '.join(t.split()[:40])
    LOG.append({'name': name, 'url': url, 'bytes': len(b), 'disposition': cd, 'pages': t.count('\f'), 'year_end_words': hit, 'first_words': first})
    pass       # unrelated large files: keep the text only
D = 'https://www.calgary.ca/content/dam/www/'
F = D + 'cfod/finance/documents/'
Q = D + 'our-organization/our-performance/documents/'
jobs = [('afr-2023', F + 'Finance-2023-Annual-Report.pdf'),
        ('progress-update-2023', F + 'plans-budgets-and-financial-reports/progress-update-report.pdf'),
        ('service-updates-2023', F + 'plans-budgets-and-financial-reports/service-updates.pdf'),
        ('progress-snapshot-2023', F + 'plans-budgets-and-financial-reports/progress-update-snapshot.pdf'),
        ('mid-year-2024', F + 'plans-budgets-and-financial-reports/2024-mid-year-progress-update.pdf'),
        ('q1-2026', Q + 'quarterly-report-2026-q1.pdf'), ('q2-2026', Q + 'quarterly-report-2026-q2.pdf')]
for nm in ('quarterly-report-2025-q4', 'quarterly-report-2025-year-end', 'quarterly-report-2025-ye', '2025-year-end-report', 'quarterly-report-2025', 'year-end-report-2025', 'quarterly-report-2025-q2-q3', 'quarterly-report-2025-q1'):
    jobs.append((nm, Q + nm + '.pdf'))
for nm in ('financial-economic-update-2025-year-end', 'financial-economic-update-2025-year-end-Q1-2026', 'financial-economic-update-2023-year-end', 'financial-economic-update-2023-year-end-Q1-2024',
           'financial-economic-update-2023-year-end-q1-2024', 'financial-economic-update-2025-Q2', 'financial-economic-update-2025-q2', 'financial-economic-update-2025-Q3'):
    jobs.append((nm, F + nm + '.pdf'))
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(6) as ex:
    list(ex.map(lambda j: keep(*j), jobs))
json.dump(LOG, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
for l in LOG: print(l if isinstance(l, str) else f"{l['name']} {l['bytes']} p{l['pages']} ye={l['year_end_words']} :: {l['first_words'][:150]}")
