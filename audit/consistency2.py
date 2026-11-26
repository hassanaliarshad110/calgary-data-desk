"""Site-wide accuracy audit, part 1b: internal consistency of the other screens' data files.
usage: python3 consistency2.py <site data folder> <out.json>"""
import json, sys, os, collections
D, OUT = sys.argv[1], sys.argv[2]
R = []
rd = lambda p: json.load(open(os.path.join(D, p), encoding='utf-8'))
def chk(screen, name, ok, detail=''): R.append({'screen': screen, 'check': name, 'result': 'PASS' if ok else 'FAIL', 'detail': str(detail)[:700], 'kind': 'consistency'})
def note(screen, name, detail): R.append({'screen': screen, 'check': name, 'result': 'NOTE', 'detail': str(detail)[:700], 'kind': 'consistency'})


def race(screen, label, r, bad):
    c = r.get('candidates') or []
    if not c: return
    tot = r.get('total') or r.get('valid')
    s = sum(x['votes'] for x in c)
    if tot is not None and s != tot: bad.append((label, 'votes add to', s, 'total', tot))
    for x in c:
        if x.get('share') is not None and tot and abs(round(x['votes'] / tot, 4) - x['share']) > 0.00011: bad.append((label, x['name'], 'share', x['share'], round(x['votes'] / tot, 4)))
    srt = sorted(c, key=lambda x: -x['votes'])
    el = [x['name'] for x in c if x.get('elected')]
    if el and srt[0]['name'] not in el: bad.append((label, 'elected is not the top vote', el, srt[0]['name']))
    if r.get('margin') is not None and len(srt) > 1 and srt[0]['votes'] - srt[1]['votes'] != r['margin']: bad.append((label, 'margin', r['margin'], srt[0]['votes'] - srt[1]['votes']))
    if r.get('margin_share') is not None and len(srt) > 1 and tot and abs(round((srt[0]['votes'] - srt[1]['votes']) / tot, 4) - r['margin_share']) > 0.00011: bad.append((label, 'margin share', r['margin_share']))


# ================================================================ elections
e = rd('elections.json'); scr = 'Elections'
m = e['municipal']; bad = []
race(scr, 'Mayor', m['mayor'], bad)
for w, r in m['councillors'].items(): race(scr, f'Ward {w}', r, bad)
for r in m['public_trustees']: race(scr, 'CBE ' + r['title'], r, bad)
for r in m['separate_trustees']: race(scr, 'CCSD ' + r['title'], r, bad)
chk(scr, 'Municipal 2025: every race\'s votes add to its total; shares, winners and margins follow', not bad, bad[:10] or f"mayor + {len(m['councillors'])} councillor + {len(m['public_trustees'])} CBE + {len(m['separate_trustees'])} CCSD races")
t = m['turnout']; chk(scr, 'Municipal turnout = voters / electors', abs(round(t['voters'] / t['electors'], 4) - t['share']) < 0.00011, f"{t['voters']:,}/{t['electors']:,} = {t['voters'] / t['electors']:.4f} vs {t['share']}")
note(scr, 'Mayor votes cast vs voters', f"mayor race total {m['mayor']['total']:,}; voters {t['voters']:,}")
mb = m['mayor_by_ward']; bad = []; agg = collections.Counter()
for w, r in mb['by_ward'].items():
    race(scr, f'Mayor in ward {w}', r, bad)
    for x in r['candidates']: agg[x['name']] += x['votes']
tot_station = sum(agg.values())
note(scr, 'Mayor by ward (election-day stations) + advance', f"stations total {tot_station:,} + advance {mb.get('advance_total', 0):,} = {tot_station + mb.get('advance_total', 0):,} vs official mayor total {m['mayor']['total']:,}")
chk(scr, 'Mayor by ward: each ward\'s votes add up and its shares follow', not bad, bad[:8] or f"{len(mb['by_ward'])} wards")
pv = e['provincial']; bad = []
for k, r in pv['general'].items(): race(scr, k, r, bad)
for b in pv.get('byelections', []): race(scr, b['label'] + ' ' + b['ed'], b['race'], bad)
chk(scr, 'Provincial 2023: every Calgary riding\'s votes, shares and winner', not bad, bad[:10] or f"{len(pv['general'])} ridings + {len(pv.get('byelections', []))} by-elections")
fd = e['federal']; bad = []
for k, r in fd['general'].items():
    race(scr, k, r, bad)
    if r.get('ballots') and r.get('electors') and r.get('turnout') is not None and abs(round(r['ballots'] / r['electors'], 3) - r['turnout']) > 0.0011: bad.append((k, 'turnout', r['turnout'], round(r['ballots'] / r['electors'], 3)))
chk(scr, 'Federal 2025: every Calgary riding\'s votes, shares, winner and turnout', not bad, bad[:10] or f"{len(fd['general'])} ridings")
for lab, cs in (('provincial', pv['community_shares']), ('federal', fd['community_shares'])):
    odd = {c: v for c, v in cs.items() if abs(sum(v.values()) - 1) > 0.002}
    chk(scr, f'Community shares of {lab} ridings add to 1', not odd, list(odd.items())[:6] or f'{len(cs)} communities')
    out = sorted({k for v in cs.values() for k in v if not k.startswith('Calgary')})
    note(scr, f'{lab.title()} ridings outside the Calgary names that hold part of a community', out)
q = pv['referendum']['questions']
note(scr, 'Referendum question fields', json.dumps(q[0])[600:1300])

# ================================================================ City budget
B = rd('budget.json'); scr = 'City budget'; bad = []
for y, kinds in B['by_department'].items():
    for k, deps in kinds.items():
        s = round(sum(d['value'] for d in deps), 3); tv = B['totals'][y][k]['value']
        if abs(s - tv) > 0.002: bad.append((y, k, 'departments', s, 'total', tv))
        for d in deps:
            if d.get('units'):
                su = round(sum(u['value'] for u in d['units']), 3)
                if abs(su - d['value']) > 0.002: bad.append((y, k, d['name'], 'units', su, d['value']))
chk(scr, '2023-2032 (open budget fqax-i3nz): departments add to each year\'s total; business units to their department', not bad, bad[:10] or 'every year and fund')
rv = B['revenue']; s = [sum(l['values'][i] for l in rv['lines']) for i in range(len(rv['years']))]
chk(scr, 'Revenue: lines add to the total (2026 Budget, page 24)', all(abs(a - b) <= 2 for a, b in zip(s, rv['total'])), f'lines {s} vs total {rv["total"]}')
pr = B['proposed']; bad = []
for y, kinds in pr['by_department'].items():
    for k, deps in kinds.items():
        if isinstance(deps, dict):
            for st, L in deps.items():
                if isinstance(L, list):
                    s_ = round(sum(d['value'] for d in L), 2); tv = pr['totals'][y][k].get(st)
                    if tv is not None and abs(s_ - tv) > 0.06: bad.append((y, k, st, s_, tv))
        elif isinstance(deps, list):
            note(scr, 'proposed by_department list form', json.dumps(deps[0])[:200])
chk(scr, '2027-2030 (nnnm-9sfh): departments add to each year\'s totals', not bad, bad[:10] or 'every year, fund and status')
pl = B['plan_2027']
note(scr, '2027 plan headline figures (typed from the City\'s pages)', json.dumps(pl['headline']))
tp = pl['tax_path']; note(scr, 'Tax path', json.dumps(tp)[:600])
hh = pl['household']; note(scr, 'Household impact', json.dumps(hh)[:700])
wt = pl['water_2027']; tot_ = wt['total']
chk(scr, 'Water 2027: bill change = 2027 bill - 2026 bill; percent', abs(round(tot_['bill2027'] - tot_['bill2026'], 2) - tot_['change']) < 0.006 and abs(round((tot_['bill2027'] / tot_['bill2026'] - 1) * 100, 1) - tot_['pct']) < 0.06, f"{tot_}; {tot_['bill2027'] - tot_['bill2026']:.2f}, {(tot_['bill2027'] / tot_['bill2026'] - 1) * 100:.2f}%")
s_ = sum(l.get('change', 0) for l in wt['lines']) if wt['lines'] and 'change' in wt['lines'][0] else None
note(scr, 'Water 2027 lines', json.dumps(wt['lines'])[:500])
r27 = pl['revenue_2027_pct']; chk(scr, '2027 revenue shares add to 100%', sum(x[1] for x in r27) == 100, f'{r27} = {sum(x[1] for x in r27)}')

# ================================================================ property tax
T = rd('tax.json'); scr = 'City budget: property tax by ward'
c = T['city']
for kind in ('municipal', 'education'):
    s = sum(v for k, v in c[kind].items() if k != 'total'); chk(scr, f'{kind}: classes add to the total', abs(s - c[kind]['total']) <= 2, f'{s:,} vs {c[kind]["total"]:,}')
    lv = T['levy'][kind]; chk(scr, f'{kind}: the levy shown equals the levy in the bylaw (within $5)', all(abs(c[kind][k] - lv[k]) <= 5 for k in lv), f'{c[kind]} vs {lv}')
bw = T['by_ward']
for kind in ('municipal', 'education', 'total'):
    s = sum(v[kind] for v in bw.values()); cv = c[kind]['total'] if kind != 'total' else c['total']
    chk(scr, f'Wards add up to Calgary: {kind}', abs(s - cv) <= 20, f'{s:,} vs {cv:,} (difference {s - cv:,})')
bc = T['by_comm']; bad = []
for k in ('municipal', 'education', 'total'):
    s = sum((v[k]['total'] if isinstance(v[k], dict) else v[k]) for v in bc.values()); cv = c[k]['total'] if k != 'total' else c['total']
    if abs(s - cv) > 400: bad.append((k, s, cv))
chk(scr, 'Communities add up to Calgary', not bad, bad or 'municipal, education, total')
bad = []
for code, v in bc.items():
    for kind in ('municipal', 'education'):
        for cl in ('residential', 'non_residential', 'farm_land'):
            exp = v['assessed'][cl] * T['factors'][kind][cl] * T['rates'][kind][cl]
            if abs(exp - v[kind][cl]) > max(2, exp * 0.0005): bad.append((code, kind, cl, round(exp), v[kind][cl]))
chk(scr, 'Each community\'s tax = assessed x scaling factor x the bylaw rate', not bad, bad[:8] or f'{len(bc)} communities x 2 levies x 3 classes')
bad = []
for wk, wv in bw.items():
    s = sum(v['total'] for v in bc.values() if str(v.get('ward')) == str(wk))
    if abs(s - wv['total']) > 30: bad.append((wk, s, wv['total']))
chk(scr, 'Each ward = its communities', not bad, bad[:6] or '14 wards')
note(scr, 'Scaling factors (what is left after exempt property, to match the bylaw\'s taxable assessment)', json.dumps(T['factors']))

# ================================================================ infrastructure
I = rd('infra.json'); scr = 'Infrastructure'
ci = I['city']; byc = I['by_comm']
n12 = sum((v['breaks'] or {}).get('n12', 0) for v in byc.values()); nprev = sum((v['breaks'] or {}).get('nprev', 0) for v in byc.values())
chk(scr, 'Water main breaks: communities add up to Calgary (last 12 months)', n12 == ci['breaks_n12'], f'{n12} vs {ci["breaks_n12"]}')
chk(scr, 'Water main breaks: communities add up to Calgary (12 months before)', nprev == ci['breaks_nprev'], f'{nprev} vs {ci["breaks_nprev"]}')
km = sum((v['mains'] or {}).get('km', 0) for v in byc.values())
chk(scr, 'Water mains: communities add up to Calgary km', abs(km - ci['mains_km']) < 1, f'{km:.1f} vs {ci["mains_km"]}')
note(scr, 'A community\'s main and break fields', json.dumps({k: byc['SOV'][k] for k in ('mains', 'paving', 'req')})[:600])
bad = []
for k, v in byc.items():
    b, mn = v.get('breaks') or {}, v.get('mains') or {}
    if b.get('per_100km') is not None and mn.get('km'):
        exp = round(b.get('n12', 0) / mn['km'] * 100, 1)
        if abs(exp - b['per_100km']) > 0.051: bad.append((k, exp, b['per_100km']))
chk(scr, 'Breaks per 100 km = breaks in 12 months / km of main x 100', not bad, bad[:8] or 'every community with mains')
by_year = ci['breaks_by_year']; yrs = sorted(by_year)
note(scr, 'Breaks by year (Calgary)', f"{yrs[0]}..{yrs[-1]}: last five {[(y, by_year[y]) for y in yrs[-6:]]}")
sp = ci['sanitary']; mp = sp.get('materials_pct') or {}
chk(scr, 'Sewer pipe materials add to 100%', abs(sum(mp.values()) - 100) < 0.3, f'{mp} = {sum(mp.values()):.1f}')
pv_ = I['context']['pavement']; chk(scr, 'Pavement condition good + fair + poor = 100%', pv_['good'] + pv_['fair'] + pv_['poor'] == 100, f"{pv_['good']}+{pv_['fair']}+{pv_['poor']}")

# ================================================================ safest cities
F = rd('safety_rank.json'); scr = 'Safest cities'
cities = F['cities']
L = sorted([x for x in cities if x.get('csi') is not None], key=lambda x: x['csi'])
note(scr, 'Fields of one city', json.dumps(cities[0])[:500])
bad = [(x['name'], x['rank'], i + 1) for i, x in enumerate(L) if x.get('rank') is not None and x['rank'] != i + 1]
chk(scr, 'Rank = position by Crime Severity Index, lowest first', not bad or all(abs(a[1] - a[2]) == 0 for a in bad), bad[:8] or f'{len(L)} cities')
chk(scr, 'Cities ranked = cities listed', F['cities_ranked'] == len(L), f"{F['cities_ranked']} vs {len(L)}")
small = [x['name'] for x in cities if (x.get('population') or 0) < F['min_population']]
chk(scr, 'No city under the population floor is ranked', not small, small[:8] or f"floor {F['min_population']:,}")
cg = F['calgary']; chk(scr, 'Calgary change = CSI / CSI the year before - 1', abs(round((cg['csi'] / cg['csi_prev'] - 1) * 100, 2) - cg['change_pct']) < 0.011, f"{(cg['csi'] / cg['csi_prev'] - 1) * 100:.3f} vs {cg['change_pct']}")
lg = sorted([x for x in cities if x.get('population', 0) >= 100000], key=lambda x: x['csi'])
note(scr, 'Large cities', f"{len(lg)} at 100,000+; Calgary's place among them {[x['name'] for x in lg].index('Calgary') + 1 if any(x['name'] == 'Calgary' for x in lg) else None}; stated rank_large {cg['rank_large']} of {F['large_ranked']}")
t50 = F['top50']; chk(scr, 'The top 50 are the 50 lowest', [x['name'] for x in t50] == [x['name'] for x in L[:50]], f'{len(t50)} listed')
cm = F['cmas']; Lc = sorted(cm, key=lambda x: x['csi'])
chk(scr, 'Metropolitan areas: rank = position by CSI', all(x['rank'] == i + 1 for i, x in enumerate(Lc)), [(x['name'], x['rank']) for x in Lc[:5]])
cma = F['calgary_cma']; w0 = rd('city_actual/w0.json')['safety']
chk(scr, 'Calgary CMA on this screen equals the Dashboard crime-severity card', cma['csi'] == w0['calgary']['csi'] and cma['violent'] == w0['calgary']['violent'], f"{cma['csi']}/{cma['violent']} vs {w0['calgary']}")
chk(scr, 'Dashboard crime-severity card: change and 10-year change follow from the series', True, '')
s = w0['series']['Calgary'] if 'Calgary' in w0['series'] else next(iter(w0['series'].values()))
ch = round((s['csi'][-1] / s['csi'][-2] - 1) * 100, 1); ten = round((s['csi'][-1] / s['csi'][0] - 1) * 100, 1)
R[-1].update({'result': 'PASS' if ch == w0['calgary_change_pct']['csi'] and ten == w0['calgary_10yr_pct'] else 'FAIL', 'detail': f"{ch} vs {w0['calgary_change_pct']['csi']}; 10 years {ten} vs {w0['calgary_10yr_pct']} ({w0['years'][0]} to {w0['years'][-1]} is {w0['years'][-1] - w0['years'][0]} years)"})

# ================================================================ capital markets, business, tourism, school tax, visit
for f, scr in (('capmkt.json', 'Calgary capital markets'), ('business.json', 'Invest in Calgary'), ('tourism.json', 'Tourism'), ('school_tax.json', 'School tax study'), ('visit.json', 'Visiting Calgary'), ('accountability.json', 'Accountability (performance measures)')):
    try:
        X = rd(f); note(scr, 'Top-level fields', {k: (type(v).__name__, len(json.dumps(v))) for k, v in X.items()})
    except Exception as ex: note(scr, 'not read', ex)

json.dump(R, open(OUT, 'w'), indent=1)
print(dict(collections.Counter(r['result'] for r in R)))
for r in R:
    if r['result'] == 'FAIL': print('FAIL |', r['screen'], '|', r['check'], '|', r['detail'][:500])
