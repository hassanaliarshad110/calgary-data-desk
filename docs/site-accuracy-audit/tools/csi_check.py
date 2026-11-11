"""Safest cities: Statistics Canada's police-service tables, ranked independently. usage: csi_check.py <statcan dir> <safety_rank.json>"""
import sys, csv, json, os, re, collections
D = sys.argv[1]; F = json.load(open(sys.argv[2]))
csi = collections.defaultdict(dict)
for t in ('35100186', '35100187', '35100188', '35100189', '35100190', '35100191', '35100192', '35100193'):
    with open(os.path.join(D, t + '.csv'), encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            if r['REF_DATE'] in ('2024', '2025') and r['Statistics'] in ('Crime severity index', 'Violent crime severity index') and r['VALUE']:
                csi[r['GEO']][(r['REF_DATE'], r['Statistics'])] = float(r['VALUE'])
pop = collections.defaultdict(dict)
with open(os.path.join(D, '35100077.csv'), encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        if r['Statistics'] == 'Population' and r['REF_DATE'] in ('2022', '2023', '2024', '2025') and r['VALUE']:
            pop[r['DGUID']][r['REF_DATE']] = int(float(r['VALUE']))
geo_dguid = {}
for t in ('35100186', '35100187', '35100188', '35100189', '35100190', '35100191', '35100192', '35100193'):
    with open(os.path.join(D, t + '.csv'), encoding='utf-8-sig') as f:
        for r in csv.DictReader(f): geo_dguid[r['GEO']] = r['DGUID']
def latest_pop(g, year):
    p = pop.get(geo_dguid.get(g), {}); ys = [y for y in p if int(y) <= int(year)][-3:]
    ys = sorted(p)
    ys = [y for y in ys if int(year) - 2 <= int(y) <= int(year)]
    return p[ys[-1]] if ys else None
def rank(year):
    L = []
    for g, v in csi.items():
        if ', municipal' not in g or (year, 'Crime severity index') not in v: continue
        p = latest_pop(g, year)
        if p and p >= 10000: L.append((v[(year, 'Crime severity index')], g, p))
    L.sort(); return L
L25, L24 = rank('2025'), rank('2024')
pos = [i + 1 for i, x in enumerate(L25) if x[1].startswith('Calgary, Alberta')]
print('2025: services ranked', len(L25), '(site', F['cities_ranked'], ')', '| Calgary', pos, '(site', F['calgary']['rank'], ')')
pos24 = [i + 1 for i, x in enumerate(L24) if x[1].startswith('Calgary, Alberta')]
print('2024:', len(L24), '(site', F['cities_ranked_prev'], ')', '| Calgary', pos24, '(site', F['calgary']['rank_prev'], ')')
cal = [v for g, v in csi.items() if g.startswith('Calgary, Alberta, municipal')][0]
print('Calgary CSI 2025', cal.get(('2025', 'Crime severity index')), 'site', F['calgary']['csi'], '| violent', cal.get(('2025', 'Violent crime severity index')), 'site', F['calgary']['violent'], '| 2024', cal.get(('2024', 'Crime severity index')), 'site', F['calgary']['csi_prev'])
# the site's 50 safest against these values
site = [(x['csi'], x['name']) for x in F['top50']]
mine = [(round(x[0], 2), x[1]) for x in L25[:50]]
print('top 50 values equal (in order):', [a for a, b in site] == [a for a, b in mine])
print('first 8 mine:', [(a, b.split(',')[0]) for a, b in mine[:8]]); print('first 8 site:', site[:8])
diff = [(i + 1, s, m[1].split(',')[0], m[0]) for i, (s, m) in enumerate(zip(site, mine)) if abs(s[0] - m[0]) > 0.005]
print('positions that differ:', diff[:10])
large = [x for x in L25 if x[2] >= 100000]
print('100,000+:', len(large), '(site', F['large_ranked'], ') Calgary', [i + 1 for i, x in enumerate(large) if x[1].startswith('Calgary, Alberta')])
mun = [g for g, v in csi.items() if ', municipal' in g and ('2025', 'Crime severity index') in v]
nop = [g for g in mun if latest_pop(g, '2025') is None]
print('municipal with a 2025 index', len(mun), '| without a population found', len(nop), nop[:6])
print('site names missing from mine:', [x['name'] for x in F['cities'] if not any(g.startswith(x['name'] + ',') for g, _, _ in [(y[1], 0, 0) for y in L25])][:15])
oak = [(g, v) for g, v in csi.items() if g.startswith('Oak Bay')]; print(oak[:3])
byname = {}
for g, v in csi.items():
    if ', municipal' in g: byname.setdefault(g.split(',')[0], []).append(v)
chk = bad = 0; badl = []
for x in F['cities']:
    vs = byname.get(x['name'])
    if not vs: continue
    chk += 1
    if not any(abs(v.get(('2025', 'Crime severity index'), -9) - x['csi']) < 0.006 and abs(v.get(('2025', 'Violent crime severity index'), -9) - x['violent']) < 0.006 for v in vs):
        bad += 1; badl.append((x['name'], x['csi'], [v.get(('2025', 'Crime severity index')) for v in vs]))
print('site cities found in the downloaded tables', chk, 'of', len(F['cities']), '| index values that differ', bad, badl[:5])
cma = {}
with open(os.path.join(D, '35100026.csv'), encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        if r['REF_DATE'] == '2025' and r['Statistics'] == 'Crime severity index' and r['VALUE']: cma[r['GEO'].split(' [')[0]] = float(r['VALUE'])
badc = [(x['name'], x['csi'], cma.get(x['name'])) for x in F['cmas'] if cma.get(x['name']) is None or abs(cma[x['name']] - x['csi']) > 0.006]
print('metropolitan areas checked', len(F['cmas']), '| differ', badc[:5])
print('Canada 2025', cma.get('Canada'), 'site', F['canada'])
