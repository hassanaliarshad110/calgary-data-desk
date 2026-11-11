"""Second-stage financial reconciliation, from the raw sources only. Nothing here changes a source figure.
usage: python3 fin_audit.py <business-cases.json> <crosswalk.json> <nnnm-all.json> <fqax-all.json> <out.json>
  nnnm-all.json / fqax-all.json: every row of the City's open datasets nnnm-9sfh (2027-2030 Budget) and fqax-i3nz
  (2023-2026 Budget), as returned by https://data.calgary.ca/resource/<id>.json?$limit=50000
"""
import sys, json, collections, itertools
bc_f, xw_f, nnnm_f, fqax_f, out_f = sys.argv[1:6]
BC = json.load(open(bc_f)); XW = json.load(open(xw_f)); N = json.load(open(nnnm_f)); F = json.load(open(fqax_f))
C = BC['cases']; cap = [c for c in C if c['type'] == 'capital']; op = [c for c in C if c['type'] == 'operating']
num = lambda x: float(x) if x not in (None, '') else 0.0
r1 = lambda v: round(v, 1); r3 = lambda v: round(v, 3)
Y4 = ['2027', '2028', '2029', '2030']; Y6 = Y4 + ['2031', '2032']
out = {}

# ---- 1. the open data, added up exactly as published (millions of dollars)
t = collections.defaultdict(float)
for r in N: t[(r['fund'], r['budget_status'], r['year'])] += num(r['budget_millions'])
capA = [t[('Capital', 'Approved', y)] for y in Y6]; capP = [t[('Capital', 'Proposed', y)] for y in Y6]
opP = [t[('Operating Expenditures Net of Recoveries', 'Proposed', y)] for y in Y4]
out['open_data_nnnm'] = {'rows': len(N), 'capital_approved_m': dict(zip(Y6, map(r3, capA))), 'capital_proposed_m': dict(zip(Y6, map(r3, capP))), 'operating_proposed_m': dict(zip(Y4, map(r3, opP)))}
a4, p4 = sum(capA[:4]), sum(capP[:4])
out['headline_21_billion'] = {
    'city_statement': '$21 billion in recommended capital over four years, including $13 billion in new capital infrastructure (news release and calgary.ca/our-finances/2027-budget.html, read 2026-11-11)',
    'open_data_2027_2030_m': {'approved_in_earlier_budgets': r3(a4), 'proposed': r3(p4), 'total': r3(a4 + p4)},
    'open_data_all_years_in_the_dataset_m': {'2027_2030': r3(a4 + p4), '2031': r3(capA[4] + capP[4]), '2032': r3(capA[5] + capP[5]), 'total': r3(sum(capA) + sum(capP))},
    'rounded_to_the_nearest_billion': {'2027_2030_only': round((a4 + p4) / 1000), 'with_2031_and_2032': round((sum(capA) + sum(capP)) / 1000)},
    'new_capital_m': {'open_data_proposed_2027_2030': r3(p4), 'open_data_proposed_with_2031': r3(sum(capP)), 'business_cases_stated_totals': r3(sum(c['cap_k'][0] for c in cap) / 1000)},
    'finding': 'The open data for 2027 to 2030 adds to $19.98 billion, which rounds to $20 billion. With the dataset\'s 2031 and 2032 rows it adds to $20.60 billion, which rounds to $21 billion. '
               'That is the only sum of published rows that reproduces "$21 billion"; the City does not say which years its headline covers, so the cause is not confirmed.'}

# ---- 2. capital already approved: the two datasets, business unit by business unit
A = collections.defaultdict(lambda: [0.0] * 6); B = collections.defaultdict(lambda: [0.0] * 6)
for r in N:
    if r['fund'] == 'Capital' and r['budget_status'] == 'Approved': A[r['bu']][Y6.index(r['year'])] += num(r['budget_millions'])
for r in F:
    if r['fund'] == 'Capital' and r['budget_status'] == 'Approved' and r['year'] in Y6: B[r['business_unit']][Y6.index(r['year'])] += num(r['budget'])
names = sorted(set(A) | set(B))
tn = [sum(A[n][i] for n in names) for i in range(6)]; tf = [sum(B[n][i] for n in names) for i in range(6)]
gl_new, gl_old = A['Green Line LRT - SE Project'], B['Green Line']
out['approved_capital_two_datasets'] = {
    'older': 'fqax-i3nz (2023-2026 Budget): figures for 2027 and later are capital already approved when that dataset\'s rows were last updated',
    'newer': 'nnnm-9sfh (2027-2030 Budget): budget_status = Approved',
    'years': Y6, 'newer_total_m': list(map(r3, tn)), 'older_total_m': list(map(r3, tf)), 'difference_m': [r3(x - y) for x, y in zip(tn, tf)],
    'six_year_total_m': {'newer': r3(sum(tn)), 'older': r3(sum(tf)), 'difference': r3(sum(tn) - sum(tf))},
    'green_line': {'newer_name': 'Green Line LRT - SE Project', 'older_name': 'Green Line', 'newer_m': list(map(r3, gl_new)), 'older_m': list(map(r3, gl_old)),
                   'six_year_total_m': {'newer': r3(sum(gl_new)), 'older': r3(sum(gl_old))}, 'difference_m': [r3(x - y) for x, y in zip(gl_new, gl_old)]},
    'everything_else_difference_m': [r3((tn[i] - tf[i]) - (gl_new[i] - gl_old[i])) for i in range(6)],
    'by_business_unit_2028': sorted(({'business_unit': n, 'newer_m': r3(A[n][1]), 'older_m': r3(B[n][1]), 'difference_m': r3(A[n][1] - B[n][1])} for n in names if abs(A[n][1] - B[n][1]) >= 0.05), key=lambda r: -abs(r['difference_m'])),
    'finding': 'For 2028 the newer dataset has $2,569.6 million already approved and the older $1,440.3 million: $1,129.3 million more. $930.2 million of that is the Green Line, whose six-year total is the '
               'same in both datasets ($4,020.9 million) but is spread over the years differently (more in 2027 and 2028, less from 2029 on). The other $199.1 million is spread over other business units. '
               'That the Green Line money was moved between years is read from the figures; the City has not published a reconciliation.'}

# ---- 3. proposed capital by business unit: business cases against the open data
bumap = {k: v['open_data'] for k, v in XW['business_units'].items()}
od = collections.defaultdict(lambda: [0.0] * 4); mine = collections.defaultdict(list)
for r in N:
    if r['fund'] == 'Capital' and r['budget_status'] == 'Proposed' and r['year'] in Y4: od[r['bu']][Y4.index(r['year'])] += num(r['budget_millions'])
for c in cap: mine[bumap.get(c['bu'], c['bu'])].append(c)
v = lambda c: [(c['cap_k'][1 + i] or 0) / 1000 for i in range(4)]
units = []
for bu in sorted(set(od) | set(mine)):
    b = [sum(v(c)[i] for c in mine[bu]) for i in range(4)]; d = [b[i] - od[bu][i] for i in range(4)]
    u = {'business_unit': bu, 'capital_cases': len(mine[bu]), 'business_cases_m': list(map(r3, b)), 'open_data_proposed_m': list(map(r3, od[bu])), 'difference_m': list(map(r3, d)), 'difference_2027_2030_m': r3(sum(d))}
    if abs(sum(d)) > 1 or max(abs(x) for x in d) > 1:
        best = None
        for k in (1, 2, 3):
            for combo in itertools.combinations(mine[bu], k):
                s = [sum(v(c)[i] for c in combo) for i in range(4)]; gap = max(abs(s[i] - d[i]) for i in range(4))
                if sum(s) > 0 and gap <= 0.25 and (best is None or gap < best[0]): best = (gap, combo, s)
            if best: break
        u['exception'] = True
        u['requests_that_equal_the_difference'] = None if not best else {'largest_yearly_gap_m': r3(best[0]), 'requests': [{'n': c['n'], 'title': c['title'], 'page': c['page'], 'by_year_m': list(map(r3, v(c)))} for c in best[1]],
                                                                         'strength': 'one request, every year' if len(best[1]) == 1 else f'a combination of {len(best[1])} requests (weaker evidence)'}
    units.append(u)
exc = [u for u in units if u.get('exception')]
out['proposed_capital_by_business_unit'] = {'years': Y4, 'units': units, 'units_compared': len(units), 'match_within_1_million': len(units) - len(exc), 'exceptions': [u['business_unit'] for u in exc],
    'net_of_exceptions_m': r3(sum(u['difference_2027_2030_m'] for u in exc)), 'net_of_all_units_by_year_m': [r3(sum(u['difference_m'][i] for u in units)) for i in range(4)],
    'finding': 'Read together, the six differences are what would be seen if the open data files under Public Spaces Delivery some requests that the business cases list under the unit that asks for them. '
               'This is an inference from matching amounts; the City has published no mapping.'}

# ---- 4. the $13.05 billion and the four purposes
tot = [sum(c['cap_k'][i] or 0 for c in cap) for i in range(6)]
purpose = [sum(c['cap_k'][0] * c['split'][i] / 100 for c in cap) / 1000 for i in range(4)]
out['new_capital_13_05_billion'] = {'capital_cases': len(cap), 'sum_of_stated_totals_k': tot[0], 'by_year_k': dict(zip(Y4 + ['2031_and_later'], tot[1:])), 'sum_of_the_year_columns_k': sum(tot[1:]),
    'stated_totals_minus_year_columns_k': tot[0] - sum(tot[1:]), 'cases_where_total_differs_from_its_years_by_k': dict(collections.Counter(str(c['cap_k'][0] - sum(c['cap_k'][1:])) for c in cap)),
    'in_billions': round(tot[0] / 1e6, 3),
    'by_purpose_m': dict(zip(['maintenance_or_replacement', 'growth', 'service_enhancement', 'transformative'], map(r1, purpose))), 'purposes_add_to_m': r1(sum(purpose)),
    'purpose_formula': 'for each capital case: stated total ($000s) x the City\'s percentage for the purpose / 100; added over the 260 cases; / 1,000 for millions; rounded once at the end to one decimal',
    'cases_with_one_purpose_only': sum(1 for c in cap if 100 in c['split']), 'cases_with_a_mixed_purpose': sum(1 for c in cap if 100 not in c['split'])}

# ---- 5. the classification
out['classification'] = {'operating': len(op), 'capital': len(cap), 'rule': 'a case is operating if its first page carries the heading "Budget proposal rationale:" and capital if its pages carry "Capital Funding Consideration ($000s)"; none carries both',
    'by_council_priority': {th: {'operating': sum(1 for c in op if c['theme'] == th), 'capital': sum(1 for c in cap if c['theme'] == th)} for th in BC['themes']}}

# ---- 6. positions
fte = [sum(c['ftes'][i] or 0 for c in op) for i in range(4)]
by_dept = collections.Counter()
for c in op: by_dept[c['dept']] += c['ftes'][0] or 0
out['positions'] = {'by_year': dict(zip(Y4, fte)), 'four_years': sum(fte), 'operating_cases': len(op), 'cases_with_positions_in_2027': sum(1 for c in op if c['ftes'][0]),
    'formula': 'sum over the 124 operating cases of the 2027 cell of the row "FTEs" in the City\'s table "Proposed funding amount"; a dash counts as nothing',
    'period': 'each figure is the full-time equivalents the request adds in that year, as the City prints it; years are not cumulative',
    '2027_by_department': dict(by_dept.most_common()),
    'largest_2027': [{'n': c['n'], 'title': c['title'], 'positions_2027': c['ftes'][0], 'page': c['page']} for c in sorted(op, key=lambda c: -(c['ftes'][0] or 0))[:10]],
    'limit': 'Only positions in the FTE rows of the business cases. A request\'s text can describe other staff that are not in its row (request 104 does), so this is not the City\'s whole change in staff.'}

# ---- 7. operating totals and the part-requests
out['operating'] = {'one_time_m_by_year': dict(zip(Y4, [r1(sum(c['one_time_m'][i] or 0 for c in op)) for i in range(4)])), 'one_time_m_four_years': r1(sum(sum(x or 0 for x in c['one_time_m']) for c in op)),
    'ongoing_added_m_by_year': dict(zip(Y4, [r1(sum(c['ongoing_m'][i] or 0 for c in op)) for i in range(4)])),
    'requests_only_partly_in_the_budget': {'count': sum(1 for c in op if 'full_one_time_m' in c), 'in_their_tables_m': r1(sum(sum(x or 0 for x in c['one_time_m']) for c in op if 'full_one_time_m' in c)),
                                           'full_requests_stated_m': r1(sum(c['full_one_time_m'] for c in op if 'full_one_time_m' in c))}}
json.dump(out, open(out_f, 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: (v.get('finding') or '')[:0] or list(v)[:6] for k, v in out.items()}, indent=0)[:600])
