"""Where the 2027 new money would go (proposed).

Reads the City's 2027-2030 operating budget requests (as extracted to
ui/budget-intel/business-cases.json from the City's 792-page PDF) and the
study's own fig_budget.json, and writes fig_where.json. A pinned copy of
business-cases.json sits next to this script in the taxstudy-v1.4 snapshot.

Usage: python analysis_where.py <path to business-cases.json> [fig_budget.json]
"""
import json, sys, collections, os

src = sys.argv[1]
fb = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'fig_budget.json')
B = json.load(open(src))
F = json.load(open(fb))

op = [c for c in B['cases'] if c['type'] == 'operating']
assert len(op) == B['counts']['operating'] == 124


def y27(c):
    return (c['ongoing_m'][0] or 0) + (c['one_time_m'][0] or 0)


ongoing = round(sum(c['ongoing_m'][0] or 0 for c in op), 1)
one_time = round(sum(c['one_time_m'][0] or 0 for c in op), 1)
total = round(ongoing + one_time, 1)
assert abs(ongoing - B['totals']['ongoing_m'][0]) < 0.05
assert abs(one_time - B['totals']['one_time_m'][0]) < 0.05

def group(key):
    g = collections.Counter()
    for c in op:
        g[c[key]] += y27(c)
    return [[k, round(v, 1), round(100 * v / total, 1)] for k, v in g.most_common() if v > 0]  # shares to one decimal; do not re-round

top = sorted(op, key=lambda c: -y27(c))[:12]
top_rows = [{
    'n': c['n'], 'title': c['title'], 'bu': c['bu'], 'theme': c['theme'],
    'm_2027': round(y27(c), 1),
    'kind': 'ongoing' if (c['ongoing_m'][0] or 0) and not (c['one_time_m'][0] or 0)
            else 'one-time' if (c['one_time_m'][0] or 0) and not (c['ongoing_m'][0] or 0) else 'mixed',
    'rationale': c['rationale'], 'page': c['page'],
    'full_one_time_m': c.get('full_one_time_m'),
} for c in top]

# Rationale groups
rat = collections.Counter()
for c in op:
    rat[c['rationale']] += y27(c)
council = rat['Explicit Direction from Council'] + rat['Implicit Direction from Council']

levy_step = F['scenarios']['15']['revenue_m']

out = {
    'source': B['source'],
    'status': B['status'],
    'n_operating_requests': len(op),
    'n_with_2027_money': sum(1 for c in op if y27(c) > 0),
    'total_2027_m': total, 'ongoing_2027_m': ongoing, 'one_time_2027_m': one_time,
    'ongoing_share_pct': round(100 * ongoing / total, 1),
    'ftes_2027': B['totals']['ftes'][0],
    'levy_step_2027_m': levy_step,
    # The requests carry no funding source, so they are NOT subtracted from the levy step.
    'maintain_services_pct_reported': 5.4,  # Global News, Sept 2 2026 (City July documents)
    'per_point_m_reported': 25.6,           # LiveWire Calgary, Nov 10 2026
    'maintain_services_m_approx': round(5.4 * 25.6, 0),
    'rationale_pct': {k: round(100 * v / total, 1) for k, v in rat.most_common()},
    'by_theme': group('theme'),
    'by_bu': group('bu')[:10],
    'by_dept': group('dept'),
    'top': top_rows,
    'top3_share_pct': round(100 * sum(r['m_2027'] for r in top_rows[:3]) / total, 1),
    'rationale': {k: round(v, 1) for k, v in rat.most_common()},
    'council_direction_pct': round(100 * council / total, 1),
    'ongoing_later_years_m': B['totals']['ongoing_m'][1:],
    'one_time_later_years_m': B['totals']['one_time_m'][1:],
}
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fig_where.json'), 'w'), indent=1)
print(json.dumps({k: out[k] for k in ('total_2027_m', 'ongoing_2027_m', 'one_time_2027_m', 'ongoing_share_pct',
                                      'levy_step_2027_m', 'maintain_services_m_approx', 'council_direction_pct', 'top3_share_pct')}))
print('themes', out['by_theme'])
for r in top_rows:
    print(r['m_2027'], r['kind'], r['title'][:70], 'p', r['page'], r['full_one_time_m'])
