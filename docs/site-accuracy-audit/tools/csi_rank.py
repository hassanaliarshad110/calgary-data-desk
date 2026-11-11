"""Safest cities ranking from Statistics Canada 35-10-0077 alone (police services: population and Crime Severity Index)."""
import sys, csv, json, collections
F = json.load(open(sys.argv[2]))
v = collections.defaultdict(dict)
with open(sys.argv[1], encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        if r['Statistics'] in ('Population', 'Crime severity index') and r['VALUE'] and r['REF_DATE'] >= '2021':
            v[r['GEO']][(r['REF_DATE'], r['Statistics'])] = float(r['VALUE'])
def rank(y):
    L = []
    for g, d in v.items():
        if not g.endswith(', municipal') or (y, 'Crime severity index') not in d: continue
        ps = [d[(str(yy), 'Population')] for yy in range(int(y), int(y) - 3, -1) if (str(yy), 'Population') in d]
        if ps and ps[0] >= 10000: L.append((d[(y, 'Crime severity index')], g, ps[0]))
    return sorted(L)
for y, site_n, site_rank in (('2025', F['cities_ranked'], F['calgary']['rank']), ('2024', F['cities_ranked_prev'], F['calgary']['rank_prev'])):
    L = rank(y); cal = [i + 1 for i, x in enumerate(L) if x[1].startswith('Calgary, Alberta')]
    ties = [i + 1 for i, x in enumerate(L) if abs(x[0] - L[cal[0] - 1][0]) < 1e-9]
    print(y, 'ranked', len(L), 'site', site_n, '| Calgary', cal, 'site', site_rank, '| tied places', ties)
L = rank('2025'); s = [round(x['csi'], 2) for x in F['top50']]; m = [round(x[0], 2) for x in L[:50]]
print('top 50 index values identical in order:', s == m)
sn = [x['name'] for x in F['top50']]; mn = [x[1].split(',')[0] for x in L[:50]]
print('names in a different order (ties only?):', [(i + 1, a, b) for i, (a, b) in enumerate(zip(sn, mn)) if a != b][:6])
lg = [x for x in L if x[2] >= 100000]; print('100,000+', len(lg), 'site', F['large_ranked'], '| Calgary', [i + 1 for i, x in enumerate(lg) if x[1].startswith('Calgary, Alberta')], 'site', F['calgary']['rank_large'])
cal = F['calgary']['csi']
mine = {x[1].split(',')[0].strip(): (x[0], x[1], x[2]) for x in L if x[0] < cal}
site = {x['name']: x for x in F['cities'] if x['csi'] < cal}
print('below Calgary: mine', len(mine), 'site', len(site))
only_m = sorted((v[0], k, v[1].split(',', 1)[1].strip()[:50], v[2]) for k, v in mine.items() if k not in site)
only_s = sorted((v['csi'], k, v.get('police'), v.get('population')) for k, v in site.items() if k not in mine)
print('only in mine:', only_m[:20]); print('only on the site:', only_s[:20])
