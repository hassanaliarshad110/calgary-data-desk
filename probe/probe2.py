import io, json, os, re, sys, urllib.request, urllib.parse, zipfile
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'calgary-data-desk-probe'}
rep = {}
def get(url, timeout=180):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read(), r.headers.get('Content-Type'), r.geturl()
def note(key, f):
    try: rep[key] = f()
    except Exception as e: rep[key] = {'error': repr(e)[:300]}
def save(n, b): open(os.path.join(OUT, n), 'wb').write(b)
def text(b): return b.decode('utf-8', 'replace')
def strip(t): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', re.sub(r'(?s)<(script|style).*?</\1>', '', t)))
# City: catalogue limited to Calgary
def cat(q):
    d = json.loads(get(f'https://data.calgary.ca/api/catalog/v1?domains=data.calgary.ca&search_context=data.calgary.ca&q={urllib.parse.quote(q)}&only=datasets&limit=60')[0])
    return [[x['resource']['id'], x['resource']['name'], x['resource'].get('data_updated_at', '')[:10], x['resource'].get('columns_field_name', [])] for x in d['results']]
for q in ('election', 'voting', 'elected', 'councillor'):
    note('cat_' + q, lambda q=q: cat(q))
def meta(ds):
    m = json.loads(get(f'https://data.calgary.ca/api/views/{ds}.json')[0])
    return {'name': m.get('name'), 'desc': (m.get('description') or '')[:800], 'cols': [c.get('fieldName') for c in m.get('columns', [])], 'rows_updated': m.get('rowsUpdatedAt')}
for ds in ('kfwi-frmp', 'gqvk-p23x', 'tty8-276j', 'yfq8-sn8e', 'w2gq-pk2z', 'kiuh-sx23', 'xifx-5erj', 'tz8z-hyaz', 'dzrv-baix'):
    note('meta_' + ds, lambda ds=ds: meta(ds))
def offices():
    q = 'https://data.calgary.ca/resource/gqvk-p23x.json?$select=officecategory,officetype,candidatename,sum(votes)&$group=officecategory,officetype,candidatename&$limit=500'
    return json.loads(get(q)[0])
note('city_totals', offices)
note('city_station_types', lambda: json.loads(get('https://data.calgary.ca/resource/gqvk-p23x.json?$select=votingstationtype,count(*)&$group=votingstationtype')[0]))
note('city_ward_codes', lambda: json.loads(get('https://data.calgary.ca/resource/gqvk-p23x.json?$select=ward,count(*)&$group=ward')[0]))
note('kfwi_sample', lambda: json.loads(get('https://data.calgary.ca/resource/kfwi-frmp.json?$limit=3')[0]))
note('tty8_sample', lambda: json.loads(get('https://data.calgary.ca/resource/tty8-276j.json?$limit=3')[0]))
note('w2gq_sample', lambda: str(json.loads(get('https://data.calgary.ca/resource/w2gq-pk2z.json?$limit=1')[0]))[:1500])
# City results page: turnout
def page(url, name):
    b, ct, u = get(url); save(name, b); t = strip(text(b))
    return {'final': u, 'len': len(t), 'turnout': [m.group(0) for m in re.finditer(r'.{0,160}(turnout|eligible|electors).{0,200}', t, re.I)][:20]}
note('city_results_page', lambda: page('https://www.calgary.ca/election/results/2025-results.html', 'city_2025_results.html'))
note('city_results_page2', lambda: page('https://elections-prd.calgary.ca/results/2025-results.html', 'city_2025_results2.html'))
# Elections Canada GE45 (event 62)
def ec(url, name, keep=None):
    b, ct, u = get(url); save(name, b if keep is None else b[:keep]); t = b.decode('latin-1').splitlines()
    return {'lines': len(t), 'head': t[:3], 'calgary': [l for l in t if 'Calgary' in l.split(',')[1] ] [:80] if len(t) and ',' in t[0] else []}
note('ec62_t12', lambda: ec('https://www.elections.ca/res/rep/off/ovrGE45/62/data_donnees/table_tableau12.csv', 'ec62_table12.csv'))
note('ec62_t11', lambda: ec('https://www.elections.ca/res/rep/off/ovrGE45/62/data_donnees/table_tableau11.csv', 'ec62_table11.csv'))
for code in ('48004', '48010'):
    note('ec62_poll_' + code, lambda code=code: ec(f'https://www.elections.ca/res/rep/off/ovrGE45/62/data_donnees/pollbypoll_bureauparbureau{code}.csv', f'ec62_poll_{code}.csv', 30000))
note('ec62_csvpage', lambda: re.findall(r'href="([^"]+)"', text(get('https://www.elections.ca/res/rep/off/ovrGE45/62/csv_e.html')[0]))[:80])
# House of Commons current members (Alberta)
def hoc():
    b, ct, u = get('https://www.ourcommons.ca/members/en/search/xml'); save('hoc_members.xml', b)
    t = text(b); return {'len': len(t), 'calgary': re.findall(r'<MemberOfParliament>.*?Calgary.*?</MemberOfParliament>', t, re.S)[:20]}
note('hoc', hoc)
# Alberta: referendum ED page, summary, current MLAs, by-election
note('ref_ed01', lambda: (lambda b: (save('ref_ed01.html', b), strip(text(b))[:4000])[1])(get('https://officialresults.elections.ab.ca/orPollResultsReferendum2026.cfm?EventID=202610&ED=01')[0]))
note('ref_exed', lambda: (lambda b: (save('ref_exED.html', b), strip(text(b))[:6000])[1])(get('https://officialresults.elections.ab.ca/orEDResultsReferendum2026.cfm?EventId=202610&MODE=exED')[0]))
note('ref_main', lambda: strip(text(get('https://officialresults.elections.ab.ca/orEDResultsReferendum2026.cfm?EventId=202610')[0]))[:6000])
def mlas():
    b, ct, u = get('https://www.assembly.ab.ca/members/members-of-the-legislative-assembly'); save('mlas.html', b)
    t = strip(text(b)); return {'final': u, 'calgary': [m.group(0) for m in re.finditer(r'.{0,80}Calgary-[A-Za-z\'-]+.{0,60}', t)][:60]}
note('mlas', mlas)
def byel():
    b, ct, u = get('https://www.elections.ab.ca/2026-by-election/who-are-the-candidates/'); save('byel.html', b); return strip(text(b))[:3000]
note('byelection', byel)
note('officialresults_events', lambda: re.findall(r'href="([^"]+)"', text(get('https://officialresults.elections.ab.ca/orResultsPGE.cfm')[0]))[:80])
json.dump(rep, open(os.path.join(OUT, 'probe2.json'), 'w'), indent=1, default=str)
print(json.dumps({k: ('ERR ' + v['error'][:120]) if isinstance(v, dict) and 'error' in v else 'ok' for k, v in rep.items()}, indent=1))
