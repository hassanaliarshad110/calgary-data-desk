"""Site-wide accuracy audit, part 2b: the live Dashboard figures against the independent recalculation.
usage: python3 compare_city.py <fetched out dir> <out.json>"""
import json, sys, os, collections
F, OUT = sys.argv[1], sys.argv[2]
I = json.load(open(os.path.join(F, 'independent-city.json')))
w = json.load(open(os.path.join(F, 'live/city_actual/w0.json')))
S, C, W, CM = w['summary'], w['wards_summary']['city'], w['wards_summary']['wards'], w['communities']
R = []
def res(screen, name, site, mine, tol_abs=0, tol_rel=0.0, why=''):
    d = None if site is None or mine is None else mine - site
    ok = d is not None and (abs(d) <= tol_abs or (site and abs(d) / abs(site) <= tol_rel))
    R.append({'screen': screen, 'check': name, 'result': 'PASS' if ok else 'FAIL', 'site': site, 'independent': mine,
              'difference': d, 'difference_pct': round(d / site * 100, 3) if d is not None and site else None, 'tolerance': f'{tol_abs} or {tol_rel * 100}%', 'why_tolerance': why, 'kind': 'independent'})
def note(screen, name, detail): R.append({'screen': screen, 'check': name, 'result': 'NOTE', 'detail': str(detail)[:800], 'kind': 'independent'})
LATE = 'the window is closed (Nov 2025 to Oct 2026), but the City keeps adding and editing records; the site built at ' + w['built_at'] + ' Calgary time, this read at ' + I['read_at']
NOW = 'counts that change by the hour (open requests), read some hours apart'

i3 = I['311']; L, P = i3['last12'], i3['prev12']
scr = 'Dashboard / status board'
res(scr, '311 requests, last 12 months (with a community)', S['requests12'], L['with_community'], 50, 0.0005, LATE)
res(scr, '311 requests, the 12 months before', S['requests_prev'], P['with_community'], 50, 0.0005, LATE)
note(scr, '311 requests with no community (in the trend chart, not in the total)', f"last 12: {L['all_requests'] - L['with_community']}; before: {P['all_requests'] - P['with_community']}")
months = {r['m'][:7]: int(r['n']) for r in L['by_month']}   # every non-duplicate request; the chart counts requests with a community
nocomm = L['all_requests'] - L['with_community']
tm = dict(zip(w['trend']['months'], w['trend']['all']))
res('311 trend chart', 'The chart\'s 12 months against the City\'s requests with a community', sum(tm.values()), L['with_community'], 60, 0.0005, LATE)
note('311 trend chart', 'Each month: chart vs every non-duplicate request in the City data (the gap is requests with no community)', [(m, tm.get(m), months.get(m)) for m in tm])
# infrastructure types (the 21 named in the method note)
INF = ['Pothole Maintenance', 'Streetlight Maintenance', 'Traffic or Pedestrian Light Repair', 'Sidewalk - Curb and Gutter Repair', 'Roadway Maintenance', 'Backlane Maintenance', 'Debris on Street/Sidewalk/Boulevard', 'Signs - Missing - Damaged', 'Snow and Ice Control', 'Dead Animal Pick-Up', 'Pathway Concerns', 'Pathway Snow and Ice Concerns', 'Catch Basin Concerns', 'Sewage Back-up', 'Sewer Maintenance', 'Water Main Break or Leak', 'Service and Main Valve Issues', 'Tree Concern - GIS', 'Garbage - GIS', 'Maintenance - GIS', 'Infrastructure - GIS']
def inf(rows):
    hit = collections.Counter()
    for r in rows:
        nm = r.get('service_name') or ''; suf = nm.split(' - ', 1)[1] if ' - ' in nm else nm
        for t in INF:
            if suf == t and not nm.startswith('CT - '): hit[nm] += int(r['n'])   # the method lists Snow and Ice Control under Roads
    return hit
h12, hp = inf(L['by_service']), inf(P['by_service'])
res(scr, 'Infrastructure reports (21 types), last 12 months', S['infra12'], sum(h12.values()), 30, 0.0005, LATE)
res(scr, 'Infrastructure reports, 12 months before', S['infra_prev'], sum(hp.values()), 30, 0.0005, LATE)
note(scr, 'Service names matched to the 21 types', sorted(h12))
o = i3['open_now']
res(scr, 'Open requests now (with a community)', S['open_now'], o['with_community'], 0, 0.02, NOW)
res(scr, 'Open more than 90 days', S['open_over_90_days'], o['over_90_days_with_community'], 0, 0.02, NOW)
cl = i3['closed']
res(scr, 'Closed within 7 days (%), 7 x 24 hours', S['closed_7_days_pct'], round(cl['within_7x24h'] / cl['closed'] * 100, 1), 0.3, 0, LATE)
note(scr, 'Closed within 7 days: other readings', f"7 calendar days: {cl['within_7_calendar_days'] / cl['closed'] * 100:.1f}%; closed {cl['closed']:,} (site {C['closed']:,}); within 7x24h {cl['within_7x24h']:,} (site {C['closed_w7']:,})")
src = {r.get('source'): int(r['n']) for r in L['by_source']}
res(scr, 'Made on a phone (%), source = App', S['app_share_pct'], round(src.get('App', 0) / sum(src.values()) * 100, 1), 0.1, 0, LATE)
note(scr, 'Sources', src)
# per community and per ward (311) with an independent community-to-ward map
geo = I['geo']; wo = geo['ward_of']
site_ward = {c['code']: c.get('ward') for c in CM}
diff = {c: (site_ward.get(c), wo.get(c), geo['majority_share'].get(c)) for c in wo if site_ward.get(c) is not None and wo.get(c) != site_ward.get(c)}
R.append({'screen': 'Compare wards', 'check': 'Each community is in the ward holding most of its area (exact areas, independent)', 'result': 'PASS' if not diff else 'FAIL', 'detail': diff or f'{len(wo)} communities', 'kind': 'independent'})
bycomm = {r.get('comm_code'): int(r['n']) for r in L['by_comm']}
wi = collections.Counter(); [wi.__setitem__(wo.get(c), wi[wo.get(c)] + n) for c, n in bycomm.items() if c]
bad = []
for x in W:
    if abs(x['requests12'] - wi[x['ward']]) > max(20, x['requests12'] * 0.0005): bad.append((x['ward'], x['requests12'], wi[x['ward']]))
R.append({'screen': 'Compare wards', 'check': '311 requests by ward, from the City data and the independent ward map', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad or {x['ward']: (x['requests12'], wi[x['ward']]) for x in W[:4]}, 'kind': 'independent'})
bad = [(c['code'], c['requests12'], bycomm.get(c['code'], 0)) for c in CM if abs(c['requests12'] - bycomm.get(c['code'], 0)) > max(5, c['requests12'] * 0.002)]
R.append({'screen': 'Dashboard: communities table', 'check': '311 requests by community', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad[:10] or f'{len(CM)} communities', 'kind': 'independent'})
# closed within 7 days by ward
cc, c7 = collections.Counter(), collections.Counter()
for c, n in cl['by_comm'].items(): cc[wo.get(c)] += n
for c, n in cl['by_comm_w7'].items(): c7[wo.get(c)] += n
bad = [(x['ward'], x['closed_7_days_pct'], round(c7[x['ward']] / cc[x['ward']] * 100, 1)) for x in W if abs(x['closed_7_days_pct'] - c7[x['ward']] / cc[x['ward']] * 100) > 0.4]
R.append({'screen': 'Compare wards', 'check': 'Closed within 7 days by ward', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad or 'all 14 wards within 0.4 points', 'kind': 'independent'})

# permits
pm = I['permits']
def units(rows, only_comm=True): return sum(int(float(r.get('units') or 0)) for r in rows if (r.get('communitycode') or not only_comm))
res(scr, 'Homes in building permits applied for, last 12 months', S['new_homes12'], units(pm['applied_last12']), 10, 0.001, LATE)
res(scr, 'Homes in building permits applied for, 12 months before', S['new_homes_prev'], units(pm['applied_prev12']), 10, 0.001, LATE)
res(scr, 'Homes in building permits issued, last 12 months', S['issued_homes12'], units(pm['issued_last12']), 10, 0.001, LATE)
res(scr, 'Homes in building permits issued, 12 months before', S['issued_homes_prev'], units(pm['issued_prev12']), 10, 0.001, LATE)
note(scr, 'Homes in permits with no community code', f"applied {units(pm['applied_last12'], False) - units(pm['applied_last12'])}, issued {units(pm['issued_last12'], False) - units(pm['issued_last12'])}")
wp = collections.Counter()
for r in pm['issued_last12']: wp[wo.get(r.get('communitycode'))] += int(float(r.get('units') or 0))
bad = [(x['ward'], x['issued_homes12'], wp[x['ward']]) for x in W if abs(x['issued_homes12'] - wp[x['ward']]) > max(5, x['issued_homes12'] * 0.003)]
R.append({'screen': 'Compare wards', 'check': 'Homes in permits issued, by ward', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad or '14 wards', 'kind': 'independent'})
# development permits
dp = I['dp']; dv = w['development']
res('Dashboard: development', 'Development permit applications, last 12 months', dv['applied'], dp['last12']['total'], 5, 0.002, LATE)
res('Dashboard: development', 'Development permit applications, 12 months before', dv['applied_prev'], dp['prev12']['total'], 5, 0.002, LATE)
st = {r.get('statuscurrent'): int(r['n']) for r in dp['last12']['by_status']}
note('Dashboard: development', 'Statuses (independent)', st)
res('Dashboard: development', 'Released', dv['released'], st.get('Released', 0), 5, 0.01, LATE)
res('Dashboard: development', 'Refused', dv['refused'], st.get('Refused', 0), 2, 0.05, LATE)
res('Dashboard: development', 'Cancelled', dv['cancelled'], st.get('Cancelled', 0), 5, 0.01, LATE)
dw = {str(r.get('ward')): int(r['n']) for r in dp['last12']['by_ward']}
bad = [(x['ward'], x['dev_permits12'], dw.get(str(x['ward']), 0)) for x in W if abs(x['dev_permits12'] - dw.get(str(x['ward']), 0)) > 3]
R.append({'screen': 'Compare wards', 'check': 'Development permits by ward (the permit\'s own ward field)', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad or {k: dw[k] for k in list(dw)[:5]}, 'kind': 'independent'})
# traffic
tr = I['traffic']
res(scr, 'Traffic incidents in Calgary, last 12 months (Calgary dates, inside the city)', S['traffic12'], tr['in_city_last12'], 3, 0.001, 'incidents can be added late')
res(scr, 'Traffic incidents, 12 months before', S['traffic_prev'], tr['in_city_prev12'], 3, 0.001, '')
note(scr, 'Traffic: rows / no location / anywhere in the data, last 12', f"{tr['rows']} rows read, {tr['no_location']} without a location, {tr['anywhere_last12']} anywhere in the last 12 months")
bw = tr['by_ward_last12']
bad = [(x['ward'], x['traffic12'], bw.get(str(x['ward']), bw.get(x['ward'], 0))) for x in W if abs(x['traffic12'] - bw.get(str(x['ward']), bw.get(x['ward'], 0))) > 2]
R.append({'screen': 'Compare wards', 'check': 'Traffic incidents by ward (exact boundaries)', 'result': 'PASS' if not bad else 'FAIL', 'detail': bad or '14 wards', 'kind': 'independent'})
td = w['traffic_by_day']; di = tr['by_day']
bad = [(d, td.get(d, 0), di.get(d, 0)) for d in sorted(set(td) | set(di)) if '2024-11-01' <= d <= '2026-10-31' and abs(td.get(d, 0) - di.get(d, 0)) > 1]
R.append({'screen': 'Dashboard: traffic', 'check': 'Traffic incidents day by day', 'result': 'PASS' if len(bad) <= 3 else 'FAIL', 'detail': bad[:10] or 'every day within 1', 'kind': 'independent'})
gap = [d for d in sorted(di) if '2025-05-21' <= d <= '2025-07-01']
note('Dashboard: traffic', 'The City data in May-June 2025 (days with any incident)', f'{len(gap)} days with incidents between 2025-05-21 and 2025-07-01: {gap[:8]}')
# census
cen = I['census']
res('Population', '2021 Census population by community (sum)', 1288995, int(float(cen['community_pop']['n'])), 0, 0, 'the Census does not change')
res('Population', '2021 Census private households (sum)', 500990, int(float(cen['households']['n'])), 0, 0, '')

json.dump(R, open(OUT, 'w'), indent=1, default=str)
print(collections.Counter(r['result'] for r in R))
for r in R:
    if r['result'] != 'PASS': print(r['result'], '|', r['screen'], '|', r['check'], '|', {k: r.get(k) for k in ('site', 'independent', 'difference_pct', 'detail') if r.get(k) is not None})
