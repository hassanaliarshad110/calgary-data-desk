"""Home-type labels for R401 and R402 are inferred from values, zoning and building age (no City code list cited).
Paired assessment changes (same roll number, same home type) by home type, 2023-2026, from the City's rolls (probe 3)."""
import os
import gzip, csv, statistics as st, json, collections
MAP = {'RE0110': 'R110', 'RE0111': 'R111', 'RE0120': 'R120', 'RE0121': 'R121', 'RE0201': 'R201', 'RE0210': 'R202',
       'RE0301': 'R301', 'RE0310': 'R302', 'RE0401': 'R401', 'RE0410': 'R402'}
def load(y):
    out = {}
    for r in csv.DictReader(gzip.open(os.environ.get('STUDY', '.') + f'/p3/homes_{y}.csv.gz', 'rt')):
        if r['assessment_class'] not in ('RE', None, ''): continue
        try: v = float(str(r['re_assessed_value']).replace(',', ''))
        except ValueError: continue
        code = r['sub_property_use'] or ''
        code = MAP.get(code, code)                                # historical roll codes -> current roll codes (checked by pairing)
        out[(r['roll_number'] or '').lstrip('0')] = (code, r['comm_code'], v)   # historical roll drops leading zeros
    return out
Y = {y: load(y) for y in (2023, 2024, 2025, 2026)}
T = {'R110': 'Detached house', 'R120': 'Semi-detached / duplex', 'R401': 'Row house / townhouse (code R401)', 'R402': 'Townhouse condo (code R402)',
     'R201': 'Low-rise condo apartment', 'R301': 'High-rise condo apartment'}
def paired(a, b, k=None):
    return [b[r][2] / a[r][2] - 1 for r in b if r in a and a[r][2] > 0 and b[r][2] > 0 and a[r][0] == b[r][0] and (k is None or b[r][0] == k)]
F = {'pairs': {}}
for (y0, y1) in ((2023, 2024), (2024, 2025), (2025, 2026), (2023, 2026)):
    row = {}
    for k, lab in [*T.items(), (None, 'All homes')]:
        ch = paired(Y[y0], Y[y1], k)
        row[lab] = {'n': len(ch), 'median_pct': round(st.median(ch) * 100, 1), 'p25': round(sorted(ch)[len(ch) // 4] * 100, 1),
                    'p75': round(sorted(ch)[3 * len(ch) // 4] * 100, 1)}
    F['pairs'][f'{y0}-{y1}'] = row
# share of homes whose value moved less than the residential base (sum of paired values), 2025-2026
a, b = Y[2025], Y[2026]
common = [r for r in b if r in a and a[r][2] > 0 and b[r][2] > 0]
base = sum(b[r][2] for r in common) / sum(a[r][2] for r in common) - 1
F['base_change_2025_2026_pct'] = round(base * 100, 2)
F['homes_2026'] = len(b); F['paired_2025_2026'] = len(common)
by = collections.defaultdict(list)
for r in common: by[b[r][0]].append(b[r][2] / a[r][2] - 1 > base)
F['share_above_base_2025_2026'] = {T[k]: round(sum(v) / len(v) * 100, 1) for k, v in by.items() if k in T}
F['share_above_base_all'] = round(sum(sum(v) for v in by.values()) / sum(len(v) for v in by.values()) * 100, 1)
# 2026 medians by type
F['median_value_2026'] = {T[k]: st.median(v[2] for v in b.values() if v[0] == k) for k in T}
F['count_2026'] = {T[k]: sum(1 for v in b.values() if v[0] == k) for k in T}
json.dump(F, open(os.environ.get('STUDY', '.') + '/fig_assess.json', 'w'), indent=1)
print(json.dumps(F, indent=1))
# Back-test of the Section 5 method: CREB July 2025 year-over-year gaps, anchored to the actual detached median,
# against the actual 2025 -> 2026 paired medians (the 2026 roll values homes at July 1, 2025).
# CREB July 2025, Calgary (city): detached -0.8, semi-detached +1, row -4, apartment -5 (rounded as published).
creb25 = {'Detached house': -0.8, 'Semi-detached / duplex': 1.0, 'Row house / townhouse (code R401)': -4.0,
          'Townhouse condo (code R402)': -4.0, 'Low-rise condo apartment': -5.0, 'High-rise condo apartment': -5.0}
LAB = {'Detached house': 'Detached house', 'Semi-detached / duplex': 'Semi-detached / duplex',
       'Row house / townhouse (code R401)': 'Row house / townhouse (code R401)', 'Townhouse condo (code R402)': 'Townhouse condo (code R402)',
       'Low-rise condo apartment': 'Low-rise condo apartment', 'High-rise condo apartment': 'High-rise condo apartment'}
act = F['pairs']['2025-2026']; anchor = act['Detached house']['median_pct']
F['backtest_2026'] = {k: {'predicted_pct': round(anchor + g - creb25['Detached house'], 1), 'actual_pct': act[LAB[k]]['median_pct'],
                          'error_pts': round(anchor + g - creb25['Detached house'] - act[LAB[k]]['median_pct'], 1)} for k, g in creb25.items()}
F['same_type_pairs_2025_2026'] = act['All homes']['n']
json.dump(F, open(os.environ.get('STUDY', '.') + '/fig_assess.json', 'w'), indent=1)
print(F['backtest_2026'])
