"""15% tax study: ward figures. Growth since 2021 (the growth model), City property tax billed per resident, 311 and
amenities per 1,000, named-ward capital, and an indicative 2027 bill change by ward from each ward's mix of home types.
Inputs: probe 1 (dashboard.build ward 0 under three counting methods, proptax by community), probe 3 (2026 roll by
roll number and home type), fig_budget.json (the implied rate multiplier) and business-cases.json."""
import os, json, gzip, csv, collections, statistics as st
S = os.environ.get('STUDY', '.')
J = lambda p: json.load(open(p))
D = {m: J(f'{S}/p1/city_{m}.json') for m in ('city_actual', 'model', 'census2021')}
T = J(f'{S}/p1/tax.json'); FB = J(f'{S}/fig_budget.json')
W = {r['ward']: r for r in D['city_actual']['wards_summary']['wards']}
CITY = D['city_actual']['wards_summary']['city']
comm_ward = {c['code']: c['ward'] for c in D['city_actual']['communities']}
for c, e in T['by_comm'].items():
    comm_ward.setdefault(c, e.get('ward'))
F = {'as_of': D['city_actual']['population']['as_of'], 'period': D['city_actual']['period'], 'prev_period': D['city_actual']['prev_period'],
     'city_now': D['city_actual']['population']['city_now'], 'census_total_residential': D['city_actual']['population']['census_total']}

# municipal residential tax billed by ward (2026 bylaw, assessment roll), from communities
mres = collections.Counter(); mall = collections.Counter()
for c, e in T['by_comm'].items():
    w = e.get('ward')
    mres[w] += e['municipal']['residential']; mall[w] += e['municipal']['total']
F['municipal_res_city'] = T['city']['municipal']['residential']

# indicative 2027 change by ward: each home's 2026 municipal tax (value x 2026 rate) moved by its type's value change and R
R = FB['implied_rate_multiplier'][1]
city_typ = FB['typical_value_change_pct']                     # the City's typical home: -2.55% (taken as the detached anchor)
# CREB July 2026, Calgary (city), year over year
creb = {'R110': -1.87, 'R120': -0.30, 'R121': -0.30, 'R401': -6.10, 'R402': -6.10, 'R201': -8.37, 'R202': -8.37, 'R301': -8.37, 'R302': -8.37}
anch = {k: city_typ + (g - creb['R110']) for k, g in creb.items()}  # same gap between types as CREB, detached anchored to the City
other = city_typ + (-2.05 - creb['R110'])                           # other residential codes: CREB total residential gap
rate = T['rates']['municipal']['residential']
before = collections.Counter(); after = collections.Counter(); after_raw = collections.Counter()
types = collections.defaultdict(collections.Counter)
APT = ('R201', 'R202', 'R301', 'R302')
for r in csv.DictReader(gzip.open(f'{S}/p3/homes_2026.csv.gz', 'rt')):
    try: v = float(r['re_assessed_value'])
    except (TypeError, ValueError): continue
    if r['assessment_class'] != 'RE' or v <= 0: continue
    w = comm_ward.get(r['comm_code'])
    if not w: continue
    k = r['sub_property_use']; b = v * rate
    before[w] += b; before[0] += b
    g = anch.get(k, other) / 100; a = b * (1 + g) * R
    after[w] += a; after[0] += a
    g2 = creb.get(k, -2.05) / 100; after_raw[w] += b * (1 + g2) * R; after_raw[0] += b * (1 + g2) * R
    types[w]['apt' if k in APT else 'row' if k in ('R401', 'R402') else 'det' if k in ('R110', 'R111') else 'semi' if k in ('R120', 'R121') else 'other'] += 1
    types[0]['apt' if k in APT else 'row' if k in ('R401', 'R402') else 'det' if k in ('R110', 'R111') else 'semi' if k in ('R120', 'R121') else 'other'] += 1

bc = J(os.environ.get('REPO', '..') + '/ui/budget-intel/business-cases.json')
named = collections.Counter()
for c in bc['cases']:
    if c['type'] == 'capital' and c['wards'] != 'all':
        for w in c['wards']: named[w] += (c['cap_k'][0] or 0) / len(c['wards'])

rows = []
for w in range(1, 15):
    r = W[w]; n = sum(types[w].values())
    gm = r['growth_pct_by_method']
    rows.append({
        'ward': w, 'councillor': r.get('councillor'),
        'residents_now': r['residents'], 'census2021': r['census2021'], 'added': r['residents'] - r['census2021'],
        'growth_pct': r['growth_pct'], 'growth_model_pct': gm.get('model'), 'growth_city_pace_pct': gm.get('city_pace'),
        'homes_now': r['homes_now'], 'homes_2021': r['homes_census'], 'homes_added': r['homes_now'] - r['homes_census'],
        'homes_growth_pct': r['homes_growth_pct'],
        'share_of_city_growth_pct': None,
        'muni_res_tax_m': round(mres[w] / 1e6, 1), 'muni_res_tax_per_resident': round(mres[w] / r['residents']),
        'muni_res_tax_per_home': round(mres[w] / r['homes_now']) if r['homes_now'] else None,
        'muni_all_tax_m': round(mall[w] / 1e6, 1),
        'extra_15pct_m': round(mres[w] * 0.15 / 1e6, 1),
        'bill_change_2027_pct': round((after[w] / before[w] - 1) * 100, 1),
        'bill_change_2027_raw_creb_pct': round((after_raw[w] / before[w] - 1) * 100, 1),
        'apt_share_pct': round(types[w]['apt'] / n * 100, 1), 'det_share_pct': round(types[w]['det'] / n * 100, 1),
        'requests_per_1000': r['requests_per_1000'], 'requests_per_1000_prev': r['requests_per_1000_prev'],
        'infra_per_1000': r['infra_per_1000'], 'open_per_1000': r['open_per_1000'],
        'closed_7_days_pct': r.get('closed_7_days_pct'),
        'transit_stops_per_1000': (r.get('amenities') or {}).get('transit_stops'),
        'playgrounds_per_1000_kids': r.get('playgrounds_per_1000_kids'),
        'rec_facilities_per_1000': (r.get('amenities') or {}).get('rec_facilities'),
        'local_park_ha_per_1000': (r.get('amenities') or {}).get('local_park_ha'),
        'libraries_per_1000': (r.get('amenities') or {}).get('libraries'),
        'named_capital_m': round(named[w] / 1000, 1),
        'rec_facilities_count': (r.get('amenity_counts') or {}).get('rec_facilities'), 'transit_stops_count': (r.get('amenity_counts') or {}).get('transit_stops'),
    })
tot_added = sum(x['added'] for x in rows)
for x in rows:
    x['share_of_city_growth_pct'] = round(x['added'] / tot_added * 100, 1)
    x['named_capital_per_new_resident'] = round(x['named_capital_m'] * 1e6 / x['added']) if x['added'] > 0 else None
F['wards'] = rows
F['growth_like_for_like_pct'] = round((CITY['residents'] / 1321600 - 1) * 100, 1)  # City April 2021 estimate
F['five_share_homes_only_pct'] = round(sum(x['homes_added'] for x in sorted(rows, key=lambda x: -x['growth_pct'])[:5]) / sum(x['homes_added'] for x in rows) * 100, 1)
F['city'] = {'residents_now': CITY['residents'], 'census2021': CITY['census2021'], 'growth_pct': CITY['growth_pct'],
             'growth_model_pct': CITY['growth_pct_by_method'].get('model'), 'homes_now': CITY['homes_now'], 'homes_2021': CITY['homes_census'],
             'homes_growth_pct': CITY['homes_growth_pct'], 'requests_per_1000': CITY['requests_per_1000'],
             'requests_per_1000_prev': CITY['requests_per_1000_prev'],
             'muni_res_tax_per_resident': round(sum(mres[w] for w in range(1, 15)) / CITY['residents']),
             'bill_change_2027_pct': round((after[0] / before[0] - 1) * 100, 1),
             'bill_change_2027_raw_creb_pct': round((after_raw[0] / before[0] - 1) * 100, 1),
             'apt_share_pct': round(types[0]['apt'] / sum(types[0].values()) * 100, 1),
             'amenities': D['city_actual']['wards_summary'].get('amenities_city')}
F['type_value_change_used_pct'] = {k: round(v, 2) for k, v in anch.items()}
F['type_bill_change_pct'] = {k: round(((1 + v / 100) * R - 1) * 100, 1) for k, v in anch.items()}
F['rate_multiplier'] = R
# correlation: growth vs 311 change, growth vs amenities
def corr(xs, ys):
    mx, my = st.mean(xs), st.mean(ys)
    sx = sum((x - mx) ** 2 for x in xs) ** .5; sy = sum((y - my) ** 2 for y in ys) ** .5
    return round(sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy), 2)
g = [x['growth_pct'] for x in rows]
F['corr_growth_vs_transit'] = corr(g, [x['transit_stops_per_1000'] for x in rows])
F['corr_growth_vs_rec'] = corr(g, [x['rec_facilities_per_1000'] for x in rows])
F['corr_growth_vs_311'] = corr(g, [x['requests_per_1000'] for x in rows])
F['corr_growth_vs_named_capital'] = corr([x['added'] for x in rows], [x['named_capital_m'] for x in rows])
F['corr_apt_vs_bill'] = corr([x['apt_share_pct'] for x in rows], [x['bill_change_2027_pct'] for x in rows])
json.dump(F, open(f'{S}/fig_wards.json', 'w'), indent=1)
print({k: v for k, v in F.items() if k != 'wards'})
cols = ['ward', 'residents_now', 'census2021', 'growth_pct', 'growth_model_pct', 'homes_added', 'share_of_city_growth_pct', 'muni_res_tax_per_resident',
        'extra_15pct_m', 'bill_change_2027_pct', 'bill_change_2027_raw_creb_pct', 'apt_share_pct', 'requests_per_1000', 'requests_per_1000_prev',
        'transit_stops_per_1000', 'rec_facilities_per_1000', 'local_park_ha_per_1000', 'named_capital_m', 'named_capital_per_new_resident']
print('\t'.join(c[:10] for c in cols))
for x in rows: print('\t'.join(str(x[c]) for c in cols))
# Section 6: the five fastest-growing wards against the other nine, weighted by residents
FAST = sorted(rows, key=lambda x: -x['growth_pct'])[:5]
REST = [x for x in rows if x not in FAST]
wavg = lambda xs, k: sum(x[k] * x['residents_now'] for x in xs) / sum(x['residents_now'] for x in xs)
F['fast_vs_rest'] = {'fast_wards': [x['ward'] for x in FAST], 'fast_residents': sum(x['residents_now'] for x in FAST), 'fast_rec_count': sum(x['rec_facilities_count'] or 0 for x in FAST),
                     **{k: {'fast': round(wavg(FAST, k), 4), 'rest': round(wavg(REST, k), 4), 'gap_pct': round((wavg(FAST, k) / wavg(REST, k) - 1) * 100, 1)}
                        for k in ('transit_stops_per_1000', 'rec_facilities_per_1000', 'local_park_ha_per_1000', 'requests_per_1000')}}
json.dump(F, open(f'{S}/fig_wards.json', 'w'), indent=1)
print(F['fast_vs_rest'])
