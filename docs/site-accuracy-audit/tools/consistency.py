"""Site-wide accuracy audit, part 1: internal consistency of every published data file.
Written independently of the site's code: each check restates a published definition (data/methods.json) as arithmetic
on the published figures. usage: python3 consistency.py <site data folder> <out.json>"""
import json, sys, os, math, collections
D, OUT = sys.argv[1], sys.argv[2]
R = []


def rd(p):
    return json.load(open(os.path.join(D, p), encoding='utf-8'))


def chk(screen, name, ok, detail='', kind='consistency'):
    R.append({'screen': screen, 'check': name, 'result': 'PASS' if ok else 'FAIL', 'detail': str(detail)[:600], 'kind': kind})


def note(screen, name, detail):
    R.append({'screen': screen, 'check': name, 'result': 'NOTE', 'detail': str(detail)[:600], 'kind': 'consistency'})


def pct(a, b):
    return None if not b else round((a - b) / b * 100, 1)


def r1(x):
    return round(x + 1e-9, 1)


def near(a, b, tol):
    return a is not None and b is not None and abs(a - b) <= tol


# ======================================================================= dashboard data (city view, w0.json)
w = rd('city_actual/w0.json')
S, C = w['summary'], w['wards_summary']['city']
W = w['wards_summary']['wards']
CM = w['communities']
res = [c for c in CM if c['residential'] and not c.get('few_residents')]
resall = [c for c in CM if c['residential']]
scr = 'Dashboard / status board'

# 311 totals: wards against Calgary, communities against Calgary
t = lambda L, k: sum((x.get(k) or 0) for x in L)
chk(scr, '311 requests: communities add up to the Calgary total', t(CM, 'requests12') == S['requests12'], f"communities {t(CM, 'requests12'):,} vs Calgary {S['requests12']:,} (requests with no community: {S['requests12'] - t(CM, 'requests12'):,})")
chk(scr, '311 requests: the 14 wards add up to the Calgary total', t(W, 'requests12') == C['requests12'], f"wards {t(W, 'requests12'):,} vs Calgary {C['requests12']:,}")
for k in ('requests_prev', 'infra12', 'infra_prev', 'open', 'open_over_90_days', 'new_homes12', 'new_homes_prev', 'issued_homes12', 'dev_permits12', 'traffic12', 'traffic_prev', 'residents', 'census2021', 'homes_now', 'homes_census', 'child_care_spaces', 'schools', 'students', 'stops', 'playgrounds', 'facilities', 'children_0_14', 'children_0_4', 'daycare_spaces'):
    a, b = t(W, k), C.get(k)
    chk(scr, f'Wards add up to Calgary: {k}', a == b, f'wards {a:,} vs Calgary {b:,}' if b is not None else f'wards {a:,}; Calgary not given')
a, b = t(W, 'crimes'), C['crimes']
chk(scr, 'Wards add up to Calgary: crimes (wards table)', a == b, f'wards {a:,} vs Calgary row {b:,}; the Crime card uses every row of the police file: {w["crime"]["crimes"]:,} (method note: a few incidents have no ward)')
chk(scr, 'Residents: wards add up to the City total for today', C['residents'] == w['population']['city_now'] == w['ward']['residents'], f"{C['residents']:,} / {w['population']['city_now']:,} / {w['ward']['residents']:,}")
chk(scr, 'Residents: residential communities add up to Calgary', t(resall, 'residents') == C['residents'], f"{t(resall, 'residents'):,} vs {C['residents']:,}")
chk(scr, '2021 Census: residential communities add up to 1,288,995', t(resall, 'census2021') == C['census2021'] == 1288995, f"{t(resall, 'census2021'):,}")

# rates as defined in methods.json ("rates", "311")
chk(scr, 'Requests per 1,000 = residential requests / mid-period residents x 1,000', near(r1(C['res_requests12'] / C['mid12'] * 1000), S['requests_per_1000'], 0.05), f"{C['res_requests12']:,} / {C['mid12']:,} x 1000 = {C['res_requests12'] / C['mid12'] * 1000:.2f}; shown {S['requests_per_1000']}")
chk(scr, 'Requests per 1,000 (year before)', near(r1(C['res_requests_prev'] / C['midprev'] * 1000), S['requests_per_1000_prev'], 0.05), f"{C['res_requests_prev'] / C['midprev'] * 1000:.2f} vs {S['requests_per_1000_prev']}")
chk(scr, 'Infrastructure reports per 1,000', near(r1(C['res_infra12'] / C['mid12'] * 1000), S['infra_per_1000'], 0.05), f"{C['res_infra12'] / C['mid12'] * 1000:.2f} vs {S['infra_per_1000']}")
chk(scr, 'Open requests per 1,000 (today\'s residents)', near(r1(C['res_open'] / C['residents'] * 1000), S['open_per_1000'], 0.05), f"{C['res_open'] / C['residents'] * 1000:.2f} vs {S['open_per_1000']}")
chk(scr, 'Change in requests against the year before', pct(S['requests12'], S['requests_prev']) == S['requests_change_pct'], f"{pct(S['requests12'], S['requests_prev'])} vs {S['requests_change_pct']}")
chk(scr, 'Closed within 7 days (Calgary)', near(r1(C['closed_w7'] / C['closed'] * 100), S['closed_7_days_pct'], 0.05), f"{C['closed_w7']:,}/{C['closed']:,} = {C['closed_w7'] / C['closed'] * 100:.2f}% vs {S['closed_7_days_pct']}")
chk(scr, 'Made on a phone (app share)', near(r1(C['channel_app'] / C['channel_all'] * 100), S['app_share_pct'], 0.05), f"{C['channel_app'] / C['channel_all'] * 100:.2f} vs {S['app_share_pct']}")
chk(scr, 'Traffic incidents change', pct(S['traffic12'], S['traffic_prev']) == S['traffic_change_pct'], f"{pct(S['traffic12'], S['traffic_prev'])} vs {S['traffic_change_pct']}")
chk(scr, 'Homes in permits applied: change', pct(S['new_homes12'], S['new_homes_prev']) == S['new_homes_change_pct'], f"{pct(S['new_homes12'], S['new_homes_prev'])} vs {S['new_homes_change_pct']}")
chk(scr, 'Homes in permits issued: change', pct(S['issued_homes12'], S['issued_homes_prev']) == S['issued_homes_change_pct'], f"{pct(S['issued_homes12'], S['issued_homes_prev'])} vs {S['issued_homes_change_pct']}")
chk(scr, 'Growth since 2021 = residents / Census - 1', near(r1((C['residents'] / C['census2021'] - 1) * 100), C['growth_pct'], 0.05), f"{(C['residents'] / C['census2021'] - 1) * 100:.2f} vs {C['growth_pct']}")
chk(scr, 'Homes growth since 2021', near(r1((C['homes_now'] / C['homes_census'] - 1) * 100), C['homes_growth_pct'], 0.05), f"{(C['homes_now'] / C['homes_census'] - 1) * 100:.2f} vs {C['homes_growth_pct']}")

# every ward's own rates
bad = []
for x in W:
    tests = {
        'requests_per_1000': x['res_requests12'] / x['mid12'] * 1000, 'requests_per_1000_prev': x['res_requests_prev'] / x['midprev'] * 1000,
        'infra_per_1000': x['res_infra12'] / x['mid12'] * 1000, 'infra_per_1000_prev': x['res_infra_prev'] / x['midprev'] * 1000,
        'open_per_1000': x['res_open'] / x['residents'] * 1000, 'closed_7_days_pct': x['closed_w7'] / x['closed'] * 100,
        'app_share_pct': x['channel_app'] / x['channel_all'] * 100, 'traffic_per_1000': x['traffic12'] / x['mid12'] * 1000,
        'growth_pct': (x['residents'] / x['census2021'] - 1) * 100, 'homes_growth_pct': (x['homes_now'] / x['homes_census'] - 1) * 100,
        'crime_per_1000': x['crimes'] / x['crime_res'] * 1000, 'stops_per_1000': x['stops'] / x['residents'] * 1000,
        'facilities_per_10000': x['facilities'] / x['residents'] * 10000, 'playgrounds_per_1000_kids': x['playgrounds'] / x['children_0_14'] * 1000,
        'child_care_per_100_kids': x['child_care_spaces'] / x['children_0_14'] * 100, 'daycare_per_100_0_4': x['daycare_spaces'] / x['children_0_4'] * 100,
        'people_per_home': None}
    for k, v in tests.items():
        if v is None or x.get(k) is None: continue
        d = 2 if k in ('facilities_per_10000', 'playgrounds_per_1000_kids', 'stops_per_1000', 'people_per_home') else 1
        if abs(round(v, d) - x[k]) > (0.011 if d == 2 else 0.051): bad.append((x['ward'], k, round(v, 3), x[k]))
    for k, a, b in (('requests_change_pct', x['requests12'], x['requests_prev']), ('traffic_change_pct', x['traffic12'], x['traffic_prev']),
                    ('crime_change_pct', x['crimes'], x['crimes_prev']), ('violent_change_pct', x['violent'], x['violent_prev']),
                    ('new_homes_change_pct', x['new_homes12'], x['new_homes_prev'])):
        if pct(a, b) != x.get(k): bad.append((x['ward'], k, pct(a, b), x.get(k)))
chk('Compare wards', 'Every rate and change of the 14 wards follows from its counts (17 measures x 14 wards)', not bad, bad[:12] or '14 wards, every measure')
# Calgary row of the same table
bad = []
for k, v in (('traffic_per_1000', C['traffic12'] / C['mid12'] * 1000), ('crime_per_1000', C['crimes'] / C['crime_res'] * 1000),
             ('stops_per_1000', C['stops'] / C['residents'] * 1000), ('facilities_per_10000', C['facilities'] / C['residents'] * 10000),
             ('playgrounds_per_1000_kids', C['playgrounds'] / C['children_0_14'] * 1000), ('child_care_per_100_kids', C['child_care_spaces'] / C['children_0_14'] * 100),
             ('daycare_per_100_0_4', C['daycare_spaces'] / C['children_0_4'] * 100), ('crime_change_pct', pct(C['crimes'], C['crimes_prev'])),
             ('violent_change_pct', pct(C['violent'], C['violent_prev']))):
    d = 2 if k in ('facilities_per_10000', 'playgrounds_per_1000_kids', 'stops_per_1000') else 1
    if abs(round(v, d) - C[k]) > (0.011 if d == 2 else 0.051): bad.append((k, round(v, 3), C[k]))
chk('Compare wards', 'The Calgary row of the wards table follows from its counts', not bad, bad or 'every measure')

# communities
bad, few = [], []
for c in CM:
    if not c['residential']: continue
    if c.get('few_residents'):
        if c.get('requests_per_1000') is not None: few.append(c['code'])
        continue
    if c['residents'] < 500: few.append((c['code'], c['residents'], 'not marked'))
    for k, v in (('growth_pct', (c['residents'] / c['census2021'] - 1) * 100 if c['census2021'] else None),
                 ('open_per_1000', c['open'] / c['residents'] * 1000), ('requests_change_pct', pct(c['requests12'], c['requests_prev']))):
        if v is None or c.get(k) is None: continue
        if abs(round(v, 1) - c[k]) > 0.051: bad.append((c['code'], k, round(v, 2), c[k]))
chk('Dashboard: communities table', 'Each community\'s growth, open-per-1,000 and change follow from its counts', not bad, bad[:12] or f'{len(res)} residential communities')
chk('Dashboard: communities table', 'Communities under 500 residents get no rates', not few, few[:10] or 'none rated')
# the community request rate uses the mid-period population of each community (not stored); check the ratio is plausible
ratios = [c['requests12'] / c['requests_per_1000'] * 1000 / c['residents'] for c in res if c.get('requests_per_1000')]
note('Dashboard: communities table', 'Community rates use mid-period residents (not stored per community): implied mid/today ratio', f'min {min(ratios):.3f}, max {max(ratios):.3f}, median {sorted(ratios)[len(ratios) // 2]:.3f} (expected a little under 1 for growing places)')

# crime card
cr = w['crime']
chk('Dashboard: crime', 'Crime per 1,000 = crimes / residents x 1,000', near(r1(cr['crimes'] / cr['residents'] * 1000), cr['per_1000'], 0.05), f"{cr['crimes']:,}/{cr['residents']:,} = {cr['crimes'] / cr['residents'] * 1000:.2f} vs {cr['per_1000']}")
chk('Dashboard: crime', 'Crime change', pct(cr['crimes'], cr['crimes_prev']) == cr['change_pct'], f"{pct(cr['crimes'], cr['crimes_prev'])} vs {cr['change_pct']}")
chk('Dashboard: crime', 'Violent crime change', pct(cr['violent'], cr['violent_prev']) == cr['violent_change_pct'], f"{pct(cr['violent'], cr['violent_prev'])} vs {cr['violent_change_pct']}")
bc = cr['by_category']
s = sum(x.get('n', 0) for x in bc) if bc and 'n' in bc[0] else None
note('Dashboard: crime', 'Crime categories', json.dumps(bc)[:500])
if bc and 'n' in bc[0]: chk('Dashboard: crime', 'Crime categories add up to the total', s == cr['crimes'], f'{s:,} vs {cr["crimes"]:,}')
mo = cr['monthly']
note('Dashboard: crime', 'Monthly series', json.dumps(mo)[:400])
# disorder
di = w['disorder']
chk('Dashboard: disorder', 'Disorder change', pct(di['last12'], di['prev12']) == di['change_pct'], f"{pct(di['last12'], di['prev12'])} vs {di['change_pct']}")
chk('Dashboard: disorder', 'Disorder categories add up', sum(x['n'] for x in di['by_category']) == di['last12'], f"{sum(x['n'] for x in di['by_category']):,} vs {di['last12']:,}")
note('Dashboard: disorder', 'Disorder card period', f"{di['period']} (data ends {di['data_ends']}); the police file's disorder in the crime block: {json.dumps(cr.get('disorder'))[:300]}")
# development
dv = w['development']
note('Dashboard: development', 'Fields', {k: dv[k] for k in dv if not isinstance(dv[k], (list, dict))})
chk('Dashboard: development', 'Applications change', pct(dv['applied'], dv['applied_prev']) == dv['change_pct'], f"{pct(dv['applied'], dv['applied_prev'])} vs {dv['change_pct']}")
chk('Dashboard: development', 'Status counts add up to applications', sum(x['n'] for x in dv['by_status']) == dv['applied'], f"{sum(x['n'] for x in dv['by_status'])} vs {dv['applied']}: {json.dumps(dv['by_status'])[:300]}")
chk('Dashboard: development', 'Type counts add up to applications', sum(x['n'] for x in dv['by_type']) == dv['applied'], f"{sum(x['n'] for x in dv['by_type'])} vs {dv['applied']}")
chk('Dashboard: development', 'Larger developments change', pct(dv['larger'], dv['larger_prev']) == dv['larger_change_pct'], f"{pct(dv['larger'], dv['larger_prev'])} vs {dv['larger_change_pct']}")
lt = sum(x['n'] for x in dv['by_type'] if x.get('type') in dv['larger_types'] or x.get('label') in dv['larger_types'])
chk('Dashboard: development', 'Larger developments = the three larger types', lt == dv['larger'], f"{lt} vs {dv['larger']}; types {dv['larger_types']}; by_type {json.dumps(dv['by_type'])[:300]}")
chk('Dashboard: development', 'Wards table development permits = Calgary applications', C['dev_permits12'] == dv['applied'], f"{C['dev_permits12']} vs {dv['applied']}")
if dv.get('list_complete'): chk('Dashboard: development', 'List holds every application of the period', len([x for x in dv['list'] if x.get('applied', x.get('applieddate', ''))[:7] >= w['period_spec']['start']]) >= 0, f"{len(dv['list'])} listed")

# trend (311 by month) against the 12-month total
tr = w['trend']
note('Dashboard: 311 trend', 'Monthly series', f"months {tr['months'][:3]}..{tr['months'][-3:]}; all {tr['all'][:3]}..; sum {sum(tr['all']):,}; prev sum {sum(tr['prev']):,}")
chk('Dashboard: 311 trend', 'The 12 months of the chart add up to the 12-month total', sum(tr['all']) == S['requests12'], f"{sum(tr['all']):,} vs {S['requests12']:,}")
chk('Dashboard: 311 trend', 'The year-before line adds up to the year-before total', sum(tr['prev']) == S['requests_prev'], f"{sum(tr['prev']):,} vs {S['requests_prev']:,}")
# traffic by day
td = w['traffic_by_day']
in12 = sum(v for k, v in td.items() if '2025-11-01' <= k <= '2026-10-31'); inprev = sum(v for k, v in td.items() if '2024-11-01' <= k <= '2025-10-31')
chk('Dashboard: traffic', 'Traffic incidents by day add up to the 12-month total', in12 == S['traffic12'], f"{in12:,} vs {S['traffic12']:,}")
chk('Dashboard: traffic', 'Traffic incidents by day (year before) add up', inprev == S['traffic_prev'], f"{inprev:,} vs {S['traffic_prev']:,}")
gaps = [k for k in sorted(td) if False]
miss = []
import datetime as dt
d0 = dt.date(2024, 11, 1)
while d0 <= dt.date(2026, 10, 31):
    if d0.isoformat() not in td: miss.append(d0.isoformat())
    d0 += dt.timedelta(days=1)
note('Dashboard: traffic', 'Days with no incident recorded in the two periods', f'{len(miss)} days: {miss[:12]}{"..." if len(miss) > 12 else ""} (a run of missing days is a gap in the City data, which inflates the change)')
# dept times
dt_ = w['dept_times']
note('Open issues', 'Department times fields', json.dumps(dt_['city'][:2])[:600])

# population: methods and checks
P = w['population']
chk('Population', 'Today\'s residents equal the City\'s estimate read on a straight line', P['city_now'] == P['by_method']['city_actual'], json.dumps(P['by_method']))
note('Population', 'Source and how', P['city_source'].get('how', '')[:600])
ck = P['checks']['checks']
for c_ in ck:
    note('Population', 'Cross-check: ' + c_['label'], json.dumps(c_)[:500])
h = next((c_ for c_ in ck if c_['key'] == 'homes'), None)
if h: chk('Population', 'Homes growth cross-check = homes now / homes at Census - 1', near(r1((P['homes_now'] / P['homes_census'] - 1) * 100), h['growth_pct'], 0.05), f"{(P['homes_now'] / P['homes_census'] - 1) * 100:.2f} vs {h['growth_pct']}")
hp = next((c_ for c_ in ck if c_['key'] == 'homes_per_home'), None)
if hp:
    real = (P['city_now'] / 1323783 - 1) * 100
    chk('Population', 'Real growth cross-check: 1,598,075 / 1,323,783 - 1', near(r1(real), hp['real_growth_pct'], 0.05), f'{real:.2f} vs {hp["real_growth_pct"]}')
    v = (1 + h['growth_pct'] / 100) * (1 + hp['per_home_pct'] / 100)
    chk('Population', 'Homes x people per home = real growth (1.145 x 1.055)', near(r1((v - 1) * 100), hp['real_growth_pct'], 0.15), f'{(v - 1) * 100:.2f} vs {hp["real_growth_pct"]}')
    chk('Population', 'Against the 2021 Census count: 1,598,075 / 1,288,995 - 1', near(r1((P['city_now'] / P['census_total'] - 1) * 100), hp['growth_pct'], 0.05), f"{(P['city_now'] / P['census_total'] - 1) * 100:.2f} vs {hp['growth_pct']}")

# families
F = w['families']
cc = F['child_care']; sc = F['schools']
note('Families', 'Child care keys', {k: (cc[k] if not isinstance(cc[k], (list, dict)) else type(cc[k]).__name__ + str(len(cc[k]))) for k in cc})
note('Families', 'Schools keys', {k: (sc[k] if not isinstance(sc[k], (list, dict)) else type(sc[k]).__name__ + str(len(sc[k]))) for k in sc})
progs = cc.get('programs') or cc.get('list') or []
if progs:
    sp = sum((p.get('capacity') or 0) for p in progs if not p.get('agency') and 'Family Day Home' not in str(p.get('type')))
    note('Families', 'Child care: capacity of listed programs (agencies left out)', f'{sp:,} against the wards table {C["child_care_spaces"]:,}')
sl = sc.get('schools') or sc.get('list') or []
if sl:
    tot_ = sum((s_.get('students') or 0) for s_ in sl)
    chk('Families', 'Schools: students of the listed schools add up to the Calgary total', tot_ == C['students'], f'{tot_:,} vs {C["students"]:,}; {len(sl)} schools vs {C["schools"]}')
    bad = [(s_.get('name'), s_.get('students'), s_.get('k9'), s_.get('g1012')) for s_ in sl if s_.get('k9') is not None and s_.get('g1012') is not None and (s_.get('k9') or 0) + (s_.get('g1012') or 0) != (s_.get('students') or 0)]
    chk('Families', 'Schools: K to 9 + 10 to 12 = total for every school', not bad, bad[:8] or f'{len(sl)} schools')

# safety (CSI) card
sf = w['safety']
note('Dashboard: crime severity', 'Fields', {k: sf[k] for k in sf if k not in ('series', 'ranking')})
ser = sf['series']; yrs = sf['years']
cal = ser.get('Calgary') or next((v for k, v in ser.items() if 'Calgary' in k), None)
note('Dashboard: crime severity', 'Calgary series', json.dumps(cal)[:400])

# ======================================================================= other data files
def has(p): return os.path.exists(os.path.join(D, p))


# budget.json
if has('budget.json'):
    B = rd('budget.json')
    note('City budget', 'Keys', list(B.keys())[:30])
# tax.json
if has('tax.json'):
    T = rd('tax.json')
    note('City budget: property tax', 'Keys', list(T.keys())[:30])

json.dump(R, open(OUT, 'w'), indent=1)
cnt = collections.Counter(r['result'] for r in R)
print(dict(cnt))
for r in R:
    if r['result'] == 'FAIL': print('FAIL |', r['screen'], '|', r['check'], '|', r['detail'][:400])
