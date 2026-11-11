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
    if not hit and len(b) > 3_000_000: os.remove(p)       # unrelated large files: keep the text only
D = 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/'
for n, u in [('fe-2024-ye-q1-2025', D + 'financial-economic-update-2024-year-end-Q1-2025.pdf'),
             ('fe-2023-ye-q1-2024', D + 'financial-economic-update-2023-year-end-Q1-2024.pdf'),
             ('fe-2025-ye-q1-2026', D + 'financial-economic-update-2025-year-end-Q1-2026.pdf'),
             ('fe-2022-ye-q1-2023', D + 'financial-economic-update-2022-year-end-Q1-2023.pdf'),
             ('afr-2025', D + '2025-Annual-Financial-Report.pdf'),
             ('afr-2024', D + 'Finance-2024-Annual-Report.pdf'),
             ('afr-2023', D + 'Finance-2023-Annual-Report.pdf')]:
    keep(n, u)
E='https://pub-calgary.escribemeetings.com/filestream.ashx?DocumentId='
from concurrent.futures import ThreadPoolExecutor
jobs = [(f'escribe-{b + k}', E + str(b + k)) for b in (258098, 282194, 285432, 326758, 331869, 333220, 339038, 339376, 354763, 362131, 366881) for k in range(0, 6)]
with ThreadPoolExecutor(8) as ex:
    list(ex.map(lambda j: keep(*j), jobs))
json.dump(LOG, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
for l in LOG: print(l if isinstance(l, str) else f"{l['name']} {l['bytes']} p{l['pages']} ye={l['year_end_words']} :: {l['first_words'][:150]}")
