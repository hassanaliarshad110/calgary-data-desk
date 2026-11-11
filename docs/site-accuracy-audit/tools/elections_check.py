"""Municipal 2025 results added up independently from the City's station-by-station open data (gqvk-p23x)."""
import sys, json, collections
R = json.load(open(sys.argv[1])); E = json.load(open(sys.argv[2]))['municipal']
print(collections.Counter(r['officecategory'] for r in R), collections.Counter(r['votingstationtype'] for r in R))
tot = collections.defaultdict(collections.Counter)
for r in R: tot[(r['officecategory'], r['officetype'])][r['candidatename'].strip().upper()] += int(r['votes'])
def cmp(label, key, race):
    mine = tot.get(key)
    if not mine: return print('NOT FOUND', label, key)
    site = {c['name'].upper(): c['votes'] for c in race['candidates']}
    ok = sum(mine.values()) == race['total']
    diffs = []
    for n, v in site.items():
        m = next((mv for mn, mv in mine.items() if mn.replace('(', '').replace(')', '').split()[-1] == n.replace('(', '').replace(')', '').split()[-1] and mn[0] == n[0]), None)
        if m != v: diffs.append((n, v, m))
    print(('OK  ' if ok and not diffs else 'DIFF'), label, 'total site', race['total'], 'stations', sum(mine.values()), diffs[:4])
keys = sorted(tot)
mk = [k for k in keys if 'Mayor' in k[0] or 'Mayor' in k[1]][0]
cmp('Mayor', mk, E['mayor'])
for w, r in sorted(E['councillors'].items(), key=lambda x: int(x[0])):
    k = [k for k in keys if 'Councillor' in k[0] and k[1].split()[-1] == w]
    cmp(f'Ward {w}', k[0] if k else None, r)
for r in E['public_trustees']:
    k = [k for k in keys if 'CBE' in k[0] and k[1].endswith(' and '.join(str(x) for x in r['wards']))]
    cmp('CBE ' + r['title'], k[0] if k else None, r)
for r in E['separate_trustees']:
    k = [k for k in keys if 'CCSD' in k[0] and all(str(x) in k[1] for x in r['wards'])]
    cmp('CCSD ' + r['title'], k[0] if k else None, r)
print([k for k in keys][:40])
