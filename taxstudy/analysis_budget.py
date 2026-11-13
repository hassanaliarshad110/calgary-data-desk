"""15% tax study: budget, household and scenario figures. Every number in sections 2, 4 and 8 comes from here.
Inputs: the repo's data/budget_2027.json, data/tax_rates.json, ui/budget-intel/business-cases.json,
web/studies/what-calgarians-pay/calc.json, and the City's 2027-2030 budget open data (nnnm-9sfh) saved by probe 2."""
import os, json, collections, sys
REPO = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('REPO', '..')
P2 = sys.argv[2] if len(sys.argv) > 2 else os.environ.get('STUDY', '.') + '/p2'
J = lambda p: json.load(open(p))
F = {}

# City population (Spring 2026 Economic Outlook, Table 4; April each year; 2026+ forecast)
POP = {2021: 1321.6, 2022: 1347.8, 2023: 1422.2, 2024: 1509.8, 2025: 1558.7, 2026: 1583.2, 2027: 1608.7,
       2028: 1634.8, 2029: 1662.3, 2030: 1689.4}
# Calgary CMA inflation (Fall 2026 Economic Outlook, Table 1)
CPI = {2021: 3.2, 2022: 7.2, 2023: 3.8, 2024: 3.4, 2025: 2.0, 2026: 2.7, 2027: 2.2, 2028: 2.0, 2029: 2.0, 2030: 1.9}
TAX_PATH = {2027: 15, 2028: 10, 2029: 7.7, 2030: 6}
ONE_PCT_M = 25.6                      # City: each 1% of property tax is about $25.6 million

def compound(pcts):
    x = 1.0
    for p in pcts: x *= 1 + p / 100
    return x

F['tax_path_compound_pct'] = round((compound(TAX_PATH.values()) - 1) * 100, 1)
F['pop_growth_2026_2030_pct'] = round((POP[2030] / POP[2026] - 1) * 100, 1)
F['pop_growth_2021_2026_pct'] = round((POP[2026] / POP[2021] - 1) * 100, 1)
F['cpi_2027_2030_pct'] = round((compound([CPI[y] for y in (2027, 2028, 2029, 2030)]) - 1) * 100, 1)
F['pop_plus_cpi_2026_2030_pct'] = round((POP[2030] / POP[2026] * compound([CPI[y] for y in (2027, 2028, 2029, 2030)]) - 1) * 100, 1)
F['tax_path_2027_2030_pct'] = round((compound([TAX_PATH[y] for y in (2028, 2029, 2030)]) - 1) * 100, 1)
F['pop_plus_cpi_2027_2030_pct'] = round((POP[2030] / POP[2027] * compound([CPI[y] for y in (2028, 2029, 2030)]) - 1) * 100, 1)
F['herald_2026_2030_pct'] = round((7.867 / 5.118 - 1) * 100, 1)
F['cpi_2021_2026_pct'] = round((compound([CPI[y] for y in (2022, 2023, 2024, 2025, 2026)]) - 1) * 100, 1)

# Operating budget, open data (net of recoveries), 2027-2030
rows = J(f'{P2}/budget_2027_2030_rows.json')
op = collections.defaultdict(float); cap = collections.defaultdict(float); dept = collections.defaultdict(lambda: collections.defaultdict(float))
for r in rows:
    v = float(r['budget_millions'] or 0); y = int(r['year'])
    if r['fund'] == 'Capital':
        cap[(r['budget_status'], y)] += v
    else:
        op[y] += v; dept[r['department']][y] += v
F['op_open_m'] = {y: round(op[y], 1) for y in sorted(op)}
F['op_open_growth_pct'] = round((op[2030] / op[2027] - 1) * 100, 1)
F['op_per_resident'] = {y: round(op[y] / POP[y] * 1000) for y in sorted(op)}
F['op_per_resident_growth_pct'] = round((op[2030] / POP[2030] / (op[2027] / POP[2027]) - 1) * 100, 1)
real = op[2030] / POP[2030] / compound([CPI[y] for y in (2028, 2029, 2030)])
F['op_per_resident_real_2030_in_2027_dollars'] = round(real * 1000)
F['op_per_resident_real_growth_pct'] = round((real / (op[2027] / POP[2027]) - 1) * 100, 1)
F['pop_growth_2027_2030_pct'] = round((POP[2030] / POP[2027] - 1) * 100, 1)
F['cpi_2028_2030_pct'] = round((compound([CPI[y] for y in (2028, 2029, 2030)]) - 1) * 100, 1)
F['op_dept'] = sorted([{'dept': d, **{str(y): round(v[y], 1) for y in sorted(v)}, 'change_m': round(v[2030] - v[2027], 1),
                        'change_pct': round((v[2030] / v[2027] - 1) * 100, 1) if v[2027] else None} for d, v in dept.items()],
                      key=lambda x: -x['change_m'])
F['op_increase_2027_2030_m'] = round(op[2030] - op[2027], 1)
bu_op = collections.defaultdict(lambda: collections.defaultdict(float))
for r in rows:
    if r['fund'] != 'Capital': bu_op[r['bu']][int(r['year'])] += float(r['budget_millions'] or 0)
F['op_bu_top_change'] = sorted([{'bu': b, '2027': round(v[2027], 1), '2030': round(v[2030], 1), 'change_m': round(v[2030] - v[2027], 1)}
                                for b, v in bu_op.items()], key=lambda x: -x['change_m'])[:8]
for excl, key in ((('Water Services',), 'ex_water'), (('Water Services', 'Waste & Recycling Services'), 'ex_utilities')):
    o = {y: op[y] - sum(bu_op[b][y] for b in excl) for y in (2027, 2030)}
    pr = {y: o[y] / POP[y] * 1000 for y in o}
    F['op_' + key] = {'2027_m': round(o[2027], 1), '2030_m': round(o[2030], 1), 'growth_pct': round((o[2030] / o[2027] - 1) * 100, 1),
                      'per_resident_2027': round(pr[2027]), 'per_resident_2030': round(pr[2030]),
                      'per_resident_growth_pct': round((pr[2030] / pr[2027] - 1) * 100, 1),
                      'real_per_resident_growth_pct': round((pr[2030] / compound([CPI[y] for y in (2028, 2029, 2030)]) / pr[2027] - 1) * 100, 1)}
F['water_share_of_increase_pct'] = round((bu_op['Water Services'][2030] - bu_op['Water Services'][2027]) / (op[2030] - op[2027]) * 100, 1)
# press figures (Calgary Herald, Nov 10, 2026): total operating $5.118B (2026), $5.963B (2027), $7.867B (end of cycle)
F['op_herald'] = {'2026_b': 5.118, '2027_b': 5.963, '2030_b': 7.867, 'growth_2027_2030_pct': round((7.867 / 5.963 - 1) * 100, 1),
                  'growth_2026_2027_pct': round((5.963 / 5.118 - 1) * 100, 1)}
F['capital_proposed_m'] = {y: round(cap[('Proposed', y)], 1) for y in range(2027, 2032)}
F['capital_approved_m'] = {y: round(cap[('Approved', y)], 1) for y in range(2027, 2033)}
# City/press summary basis: $5.9B (2026) to $7.8B (2030)
F['op_summary'] = {'2026_b': 5.9, '2030_b': 7.8, 'growth_pct': round((7.8 / 5.9 - 1) * 100, 1),
                   'per_resident_2026': round(5900 / POP[2026] * 1000), 'per_resident_2030': round(7800 / POP[2030] * 1000)}
F['op_summary']['per_resident_growth_pct'] = round((F['op_summary']['per_resident_2030'] / F['op_summary']['per_resident_2026'] - 1) * 100, 1)

# Business cases (the City's 792-page book, read into business-cases.json)
bc = J(f'{REPO}/ui/budget-intel/business-cases.json')
C = bc['cases']; capc = [c for c in C if c['type'] == 'capital']; opc = [c for c in C if c['type'] == 'operating']
split = collections.Counter(); total_k = 0
for c in capc:
    k = c['cap_k'][0] or 0; total_k += k
    for lab, p in zip(('maintenance', 'growth', 'enhancement', 'transformative'), c['split'] or []):
        split[lab] += k * (p or 0) / 100
F['bc_counts'] = bc['counts']; F['bc_totals'] = bc['totals']
F['capital_requests_b'] = round(total_k / 1e6, 2)
F['capital_split_b'] = {k: round(v / 1e6, 2) for k, v in split.items()}
F['capital_split_pct'] = {k: round(v / total_k * 100, 1) for k, v in split.items()}
util_k = sum(c['cap_k'][0] or 0 for c in capc if c['bu'] == 'Utilities Delivery')
F['capital_utilities_b'] = round(util_k / 1e6, 2); F['capital_utilities_pct'] = round(util_k / total_k * 100, 1)
split2 = collections.Counter()
for c in capc:
    if c['bu'] == 'Utilities Delivery': continue
    for lab, p in zip(('maintenance', 'growth', 'enhancement', 'transformative'), c['split'] or []):
        split2[lab] += (c['cap_k'][0] or 0) * (p or 0) / 100
F['capital_split_ex_utilities_pct'] = {k: round(v / (total_k - util_k) * 100, 1) for k, v in split2.items()}
F['capital_2031_k'] = bc['totals']['capital_k'][5]
named = [c for c in capc if c['wards'] != 'all']
F['capital_named_ward_b'] = round(sum(c['cap_k'][0] or 0 for c in named) / 1e6, 2)
F['capital_named_ward_pct'] = round(sum(c['cap_k'][0] or 0 for c in named) / total_k * 100, 1)
F['capital_named_ward_cases'] = len(named)
byw = collections.Counter(); cnt = collections.Counter()
for c in named:
    for w in c['wards']:
        byw[w] += (c['cap_k'][0] or 0) / len(c['wards']); cnt[w] += 1
F['capital_by_named_ward_m'] = {w: round(byw[w] / 1000, 1) for w in range(1, 15)}
F['capital_named_ward_case_count'] = {w: cnt[w] for w in range(1, 15)}
F['top_named_ward_projects'] = [{'n': c['n'], 'title': c['title'], 'wards': c['wards'], 'm': round((c['cap_k'][0] or 0) / 1000, 1),
                                 'split': c['split'], 'page': c['page']}
                                for c in sorted(named, key=lambda c: -(c['cap_k'][0] or 0))[:8]]
ong = collections.Counter(); ftes = collections.Counter(); rat = collections.Counter(); bu = collections.Counter()
for c in opc:
    s = sum(x or 0 for x in c['ongoing_m'])
    ong[c['dept']] += s; ftes[c['dept']] += sum(x or 0 for x in c['ftes']); rat[c['rationale']] += s; bu[c['bu']] += s
F['ongoing_requests_m_total'] = round(sum(ong.values()), 1)
F['ongoing_by_dept_m'] = {k: round(v, 1) for k, v in ong.most_common()}
F['ongoing_by_bu_m'] = {k: round(v, 1) for k, v in bu.most_common(10)}
F['ongoing_by_rationale_m'] = {k: round(v, 1) for k, v in rat.most_common()}
F['ftes_total'] = sum(ftes.values()); F['ftes_by_dept'] = dict(ftes.most_common())

# Household: the City's typical single residential property
b = J(f'{REPO}/data/budget_2027.json')
hh = {l['item']: l for l in b['household']['lines']}
t26, t27 = 229.32, hh['Municipal property tax']['m2027']   # 2026: the City's exact $229.32 (2026 budget adjustments); 2027: the City's rounded $266
F['household'] = hh
F['typical_tax_change_pct'] = round((t27 / t26 - 1) * 100, 1)
v26, v27 = 706000, 688000
F['typical_value_change_pct'] = round((v27 / v26 - 1) * 100, 2)
# implied residential rate multiplier: bill ratio / value ratio (bounds from the $1 rounding of the 2027 bill)
R = (t27 / t26) / (v27 / v26)
Rlo = ((t27 - 0.5) / t26) / (v27 / v26); Rhi = ((t27 + 0.5) / t26) / (v27 / v26)
F['implied_rate_multiplier'] = [round(Rlo, 4), round(R, 4), round(Rhi, 4)]
F['implied_rate_change_pct'] = round((R - 1) * 100, 1)
F['implied_base_change_pct'] = round((1.15 / R - 1) * 100, 1)
# a property's bill change for a given assessment change g: (1+g)*R - 1; break-even g where bill change = 15%
F['breakeven_value_change_pct'] = round((1.15 / R - 1) * 100, 2)
proxy = {  # CREB benchmark, Calgary (city), year over year, July 2026 (the assessment valuation date is July 1, 2026)
    'Detached': -1.87, 'Semi-detached': -0.30, 'Row': -6.10, 'Apartment condominium': -8.37, 'Total residential': -2.05}
# anchored: detached = the City's typical home (-2.55%); other types keep CREB's gap to detached
F['who_pays_anchored'] = {k: {'value_change_pct': round(F['typical_value_change_pct'] + g - proxy['Detached'], 2),
                              'bill_change_pct': round(((1 + (F['typical_value_change_pct'] + g - proxy['Detached']) / 100) * R - 1) * 100, 1)}
                          for k, g in proxy.items()}
F['who_pays_proxy'] = {k: {'value_change_pct': g, 'bill_change_pct': round(((1 + g / 100) * R - 1) * 100, 1),
                           'bill_change_lo': round(((1 + g / 100) * Rlo - 1) * 100, 1), 'bill_change_hi': round(((1 + g / 100) * Rhi - 1) * 100, 1)}
                       for k, g in proxy.items()}

# Scenarios: 15 / 10 / 5 per cent in 2027
TYP_FACTOR = t27 / t26 / 1.15           # the typical home's bill rises a little faster than revenue (its value falls less than the base)
F['typical_factor'] = round(TYP_FACTOR, 4)
base_m = 229.32
sc = {}
for p in (15, 10, 5):
    m = base_m * (1 + p / 100) * TYP_FACTOR
    sc[p] = {'revenue_m': round(p * ONE_PCT_M, 1), 'typical_month': round(m, 2), 'typical_month_change': round(m - base_m, 2),
             'typical_year_change': round((m - base_m) * 12), 'gap_vs_15_m': round((15 - p) * ONE_PCT_M, 1)}
F['scenarios'] = sc
F['ongoing_requests_2027_m'] = bc['totals']['ongoing_m'][0]; F['one_time_requests_2027_m'] = bc['totals']['one_time_m'][0]
req27 = bc['totals']['ongoing_m'][0] + bc['totals']['one_time_m'][0]
F['gap_share_of_2027_requests_pct'] = {p: round((15 - p) * ONE_PCT_M / req27 * 100, 1) for p in (10, 5)}
F['gap_share_of_2027_ongoing_pct'] = {p: round((15 - p) * ONE_PCT_M / bc['totals']['ongoing_m'][0] * 100, 1) for p in (10, 5)}
F['bylaw_typical_month_2026'] = round(706000 * 0.0038906 / 12, 2)
F['R_bylaw'] = round((266 / F['bylaw_typical_month_2026']) / (688000 / 706000), 4)
# four-year path on the typical home (no further relative assessment shift after 2027)
path = {2026: base_m}; m = base_m * 1.15 * TYP_FACTOR; path[2027] = m
for y in (2028, 2029, 2030):
    m *= 1 + TAX_PATH[y] / 100; path[y] = m
F['typical_path_month'] = {y: round(v, 2) for y, v in path.items()}
F['typical_2030_year_change'] = round((path[2030] - base_m) * 12)
F['typical_2030_real_change_pct'] = round((path[2030] / base_m / compound([CPI[y] for y in (2027, 2028, 2029, 2030)]) - 1) * 100, 1)

# Tax rates file (2026 levy)
tr = J(f'{REPO}/data/tax_rates.json')['2026']
F['levy_2026'] = tr['levy']; F['rates_2026'] = tr['rates']
F['municipal_res_share_pct'] = round(tr['levy']['municipal']['residential'] / tr['levy']['municipal']['total'] * 100, 1)
F['one_pct_check_m'] = round(tr['levy']['municipal']['total'] / 100 / 1e6, 1)

json.dump(F, open(os.environ.get('STUDY', '.') + '/fig_budget.json', 'w'), indent=1, default=str)
for k, v in F.items():
    if k not in ('household', 'op_dept', 'levy_2026', 'rates_2026', 'top_named_ward_projects'):
        print(k, '=', v)
for d in F['op_dept'][:8]: print(d)
for p in F['top_named_ward_projects']: print(p)
