"""The proposal, broken down: capital plan and delivery (v1.5).

Reads the City's 2027-2030 capital budget requests (business-cases.json, pinned
in the taxstudy snapshot) and the City's budget-vs-actual figures
(budget-vs-actual.json, read from the City's financial reports), and writes
fig_capital.json. Figures that come from news reports or City web pages are
hard-coded below with their source.

Usage: python analysis_capital.py business-cases.json budget-vs-actual.json
"""
import json, sys, os, collections, statistics as st

B = json.load(open(sys.argv[1]))
V = json.load(open(sys.argv[2]))
cap = [c for c in B['cases'] if c['type'] == 'capital']
assert len(cap) == B['counts']['capital'] == 260


def m(c, i=0):
    return (c['cap_k'][i] or 0) / 1000  # $M; i=0 total, 1..4 = 2027..2030, 5 = 2031+


total = sum(m(c) for c in cap)
assert abs(total * 1000 - B['totals']['capital_k'][0]) < 1
by_year = [round(sum(m(c, i) for c in cap), 1) for i in range(1, 6)]


def group(key, i=0, top=None):
    g, n = collections.Counter(), collections.Counter()
    for c in cap:
        if i and not m(c, i):
            continue  # count only requests with money in that year
        g[c[key]] += m(c, i); n[c[key]] += 1
    tot = sum(g.values())
    rows = [[k, round(v, 1), round(100 * v / tot, 1), n[k]] for k, v in g.most_common()]
    return rows[:top] if top else rows


def fund_class(f):
    f = f or ''
    if 'Self-Supported' in f:
        return 'Includes self-supported debt (repaid from utility rates or, for fleet, charges to other City units)'
    if 'Tax-Supported' in f:
        return 'Includes tax-supported debt (repaid from property tax)'
    return 'Reserves, grants or developer contributions only'

fund = collections.Counter()
for c in cap:
    fund[fund_class(c['funding'])] += m(c)
fund_rows = [[k, round(v, 1), round(100 * v / total, 1)] for k, v in fund.most_common()]

purpose = [0.0] * 4
for c in cap:
    for j in range(4):
        purpose[j] += m(c) * (c['split'][j] or 0) / 100
purpose_rows = [[n, round(v, 1), round(100 * v / total, 1)] for n, v in
                zip(['Maintenance or replacement', 'Growth', 'Service enhancement', 'Transformative'], purpose)]

sizes = sorted((m(c) for c in cap), reverse=True)
s27 = sorted((m(c, 1) for c in cap if m(c, 1) > 0), reverse=True)
top = sorted(cap, key=lambda c: -m(c))[:12]
top_rows = [{'n': c['n'], 'title': c['title'], 'bu': c['bu'], 'service_area': c['service_area'],
             'total_m': round(m(c), 1), 'm_2027': round(m(c, 1), 1), 'stage': c['stage'],
             'funding': c['funding'], 'page': c['page']} for c in top]

over_needs = sum(1 for c in cap if sum((c['cap_k'][i] or 0) for i in range(1, 5)) > sum((c['needs_k'][i] or 0) for i in range(4)))
water_ww = sum(m(c) for c in cap if c['service_area'] == 'Water Utilities' and 'Stormwater' not in c['title'])
green_line_new = sum(m(c) for c in cap if 'green line' in c['title'].lower())
top10_share_of_2027 = 100 * sum(m(c, 1) for c in top[:10]) / sum(m(c, 1) for c in cap)
fte_bu = collections.Counter()
for c in B['cases']:
    if c['type'] == 'operating' and c.get('ftes'):
        fte_bu[c['bu']] += sum(x or 0 for x in c['ftes'])
needs_27_30 = sum(sum((c['needs_k'][i] or 0) for i in range(4)) for c in cap) / 1000
budget_27_30 = sum(by_year[:4])

# City budget vs actual (from the City's financial reports, see budget-vs-actual.json)
cap23 = [r for r in V['capital']['2023']['rows'] if r['name'] == 'Total City'][0]
cap24 = [r for r in V['capital']['2024']['rows'] if r['name'] == 'Total'][0]
ops = {}
for y in ('2023', '2024', '2025'):
    t = [r for r in V['consolidated'][y]['expenses']['rows'] if r['name'] == 'Total'][0]
    ops[y] = round(100 * t['actual'] / t['budget'], 1)
surplus = {s['year']: round(s['value'] / 1000, 1) for s in V['operating_surplus']}

REPORTED = {  # value, source
    'cap_2025_budget_b': (2.7, 'City Quarterly Report 2025 Q2-Q3: $2.7 billion capital budget'),
    'cap_2025_forecast_rate': (0.91, 'City Quarterly Report 2025 Q2-Q3: forecast year-end spend rate 91%'),
    'cap_2026_budget_approved_b': (3.668, 'City Budget 2026 as approved Dec 3 2025: $3,668M ("$3.7 billion")'),
    'cap_2026_budget_june_b': (4.467, 'City Quarterly Report 2026 Q2 (p.14): $4.467 billion capital budget at June 30 2026'),
    'cap_2026_spent_june_b': (1.375, 'City Quarterly Report 2026 Q2 (p.14): spent $1.375 billion (31%) as of June 30 2026'),
    'cap_2026_forecast_b': (4.183, 'City Quarterly Report 2026 Q2 (p.14): year-end forecast $4,183 million (94%)'),
    'cap_2025_forecast_history': ('101% (Q2), 91% (Q3)', 'LiveWire Calgary Jul 22 2025 (Q2 forecast 101%); City Quarterly Report 2025 Q2-Q3 (91%)'),
    'cap_2027_b': (4.4, 'Global News, Nov 10 2026: $4.4 billion in capital funding in 2027'),
    'cap_2027_2030_b': (21.0, 'calgary.ca/our-finances/2027-budget: 2027-2030 capital budget $21 billion'),
    'cap_new_b': (13.0, 'calgary.ca: $13 billion for new infrastructure'),
    'recast_2025_m': (893, 'City capital budget recast, Feb 2025: $893M moved from 2025 to future years'),
    'debt_2027_b': (4.2, 'Global News, Nov 10 2026'), 'debt_2030_b': (10.0, 'Global News, Nov 10 2026'),
    'debt_capacity_pct': (80, 'Global News, Nov 10 2026'),
    'ftes_by_2030': (1800, 'Global News / CTV, Nov 10 2026: about 1,800 positions by 2030'),
    'city_employees': (16846, 'LiveWire Calgary, Jul 27 2026, citing calgary.ca'),
    'staff_2022': (13483, 'CBC, City data: Dec 31 2022'), 'staff_2024q3': (15751, 'CBC, City data: Sept 30 2024'),
    'ab_construction_workers_needed_2035': (48800, 'BuildForce Canada, Jul 20 2026'),
    'ab_construction_retirements_2035': (43700, 'BuildForce Canada 2026-2035 outlook: about 43,700 retirements'),
    'fish_creek_award_m': (547.1, 'Alberta Purchasing Connection via LiveWire Calgary: awarded Jan 29 2025'),
    'green_line_awarded_m': (200, 'City Green Line, Year One update: $200M+ awarded'),
}
cap25 = REPORTED['cap_2025_budget_b'][0] * REPORTED['cap_2025_forecast_rate'][0]

out = {
    'n_capital_requests': len(cap),
    'new_capital_total_m': round(total, 1),
    'new_capital_by_year_m': dict(zip(['2027', '2028', '2029', '2030', '2031+'], by_year)),
    'by_service_area': group('service_area'),
    'by_service_area_2027': group('service_area', 1),
    'by_stage': group('stage'), 'by_stage_2027': group('stage', 1),
    'by_kind': group('kind'),
    'funding': fund_rows,
    'purpose_weighted': purpose_rows,
    'size': {'median_m': round(st.median(sizes), 1), 'mean_m': round(st.mean(sizes), 1),
             'n_under_10m': sum(1 for x in sizes if x < 10), 'n_100m_plus': sum(1 for x in sizes if x >= 100),
             'n_500m_plus': sum(1 for x in sizes if x >= 500),
             'top10_share_pct': round(100 * sum(sizes[:10]) / total, 1),
             'n_with_2027': len(s27), 'median_2027_m': round(st.median(s27), 1),
             'top10_share_2027_pct': round(100 * sum(s27[:10]) / sum(s27), 1)},
    'top': top_rows,
    'needs_2027_2030_m': round(needs_27_30, 1), 'budget_2027_2030_m': round(budget_27_30, 1),
    'needs_funded_pct': round(100 * budget_27_30 / needs_27_30, 1),
    'n_budget_above_own_needs': over_needs,
    'water_wastewater_excl_stormwater_m': round(water_ww, 1),
    'green_line_in_new_requests_m': round(green_line_new, 1),
    'top10_overall_share_of_2027_pct': round(top10_share_of_2027, 1),
    'ftes_4y_by_bu_top': [[k, round(v)] for k, v in fte_bu.most_common(5)],
    'ftes_in_capital_requests': sum(sum(x or 0 for x in (c.get('ftes') or [])) for c in cap),
    'history': {'cap_2023': {'budget_m': cap23['budget'], 'actual_m': cap23['actual'], 'rate_pct': round(100 * cap23['actual'] / cap23['budget'], 1)},
                'cap_2024': {'budget_m': round(cap24['budget'] / 1000, 1), 'actual_m': round(cap24['actual'] / 1000, 1), 'rate_pct': round(100 * cap24['actual'] / cap24['budget'], 1)},
                'cap_2025_forecast_m': round(cap25 * 1000, 0),
                'cap_2026_budget_approved_m': REPORTED['cap_2026_budget_approved_b'][0] * 1000,
                'cap_2026_budget_june_m': REPORTED['cap_2026_budget_june_b'][0] * 1000,
                'cap_2026_spent_june_m': REPORTED['cap_2026_spent_june_b'][0] * 1000,
                'cap_2026_forecast_m': REPORTED['cap_2026_forecast_b'][0] * 1000,
                'operating_actual_vs_budget_pct': ops, 'operating_surplus_m': surplus},
    'pace': {'cap_2027_vs_2025_x': round(REPORTED['cap_2027_b'][0] / cap25, 2),
             'cap_avg_2027_2030_b': round(REPORTED['cap_2027_2030_b'][0] / 4, 2),
             'cap_avg_vs_2025_x': round(REPORTED['cap_2027_2030_b'][0] / 4 / cap25, 2),
             'cap_at_2025_pace_4y_b': round(cap25 * 4, 1),
             'cap_2027_vs_2026f_x': round(REPORTED['cap_2027_b'][0] / REPORTED['cap_2026_forecast_b'][0], 2),
             'cap_avg_vs_2026f_x': round(REPORTED['cap_2027_2030_b'][0] / 4 / REPORTED['cap_2026_forecast_b'][0], 2),
             'new_ftes_2027': B['totals']['ftes'][0], 'new_ftes_4y': sum(B['totals']['ftes']),
             },
    'reported': {k: {'value': v, 'source': s} for k, (v, s) in REPORTED.items()},
}
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fig_capital.json'), 'w'), indent=1)
print(json.dumps({k: out[k] for k in ('new_capital_total_m', 'new_capital_by_year_m', 'needs_funded_pct', 'size', 'pace')}, indent=1))
print(out['funding']); print(out['purpose_weighted']); print(out['by_stage']); print(out['by_stage_2027']); print(out['history'])
