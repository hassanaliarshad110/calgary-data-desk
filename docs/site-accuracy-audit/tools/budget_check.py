"""City budget screen against the City's open budget rows (fqax-i3nz, nnnm-9sfh), added up independently."""
import sys, json, collections
A = json.load(open(sys.argv[1])); N = json.load(open(sys.argv[2])); B = json.load(open(sys.argv[3]))
K = {'Operating Expenditures Net of Recoveries': 'operating', 'Capital': 'capital'}
tot = collections.defaultdict(float); st = collections.defaultdict(set); dep = collections.defaultdict(float)
for r in A:
    k = K.get(r['fund'])
    if not k: continue
    tot[(r['year'], k)] += float(r['budget']); st[(r['year'], k)].add(r['budget_status']); dep[(r['year'], k, r['budget_department'])] += float(r['budget'])
print('funds in fqax:', collections.Counter(r['fund'] for r in A))
bad = []
for y, kinds in B['totals'].items():
    for k, v in kinds.items():
        if abs(round(tot[(y, k)], 3) - v['value']) > 0.002 or st[(y, k)] != {v['status']}: bad.append((y, k, v, round(tot[(y, k)], 3), st[(y, k)]))
print('fqax totals by year and fund:', 'all match' if not bad else bad)
bad = []
for y, kinds in B['by_department'].items():
    for k, L in kinds.items():
        for d in L:
            if abs(round(dep[(y, k, d['name'])], 3) - d['value']) > 0.002: bad.append((y, k, d['name'], d['value'], round(dep[(y, k, d['name'])], 3)))
print('fqax departments:', 'all match' if not bad else bad[:6])
P = B['proposed']; t2 = collections.defaultdict(float); d2 = collections.defaultdict(float)
for r in N:
    k = K.get(r['fund']) or r['fund']
    t2[(r['year'], k, r['budget_status'].lower())] += float(r['budget_millions'])
    d2[(r['year'], k, r['budget_department'])] += float(r['budget_millions'])
print('funds in nnnm:', collections.Counter((r['fund'], r['budget_status']) for r in N))
bad = []
for y, kinds in P['totals'].items():
    for k, v in kinds.items():
        for s, val in v.items():
            if abs(round(t2[(y, k, s)], 2) - val) > 0.006: bad.append((y, k, s, val, round(t2[(y, k, s)], 2)))
print('nnnm totals:', 'all match' if not bad else bad)
bad = []
for y, kinds in P['by_department'].items():
    for k, L in kinds.items():
        for d in (L if isinstance(L, list) else []):
            if abs(round(d2[(y, k, d['name'])], 1) - d['value']) > 0.06: bad.append((y, k, d['name'], d['value'], round(d2[(y, k, d['name'])], 2)))
print('nnnm departments:', 'all match' if not bad else bad[:8])
