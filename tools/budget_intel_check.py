"""Budget Intelligence: checks on the data behind the centre, run by hand (it is not part of the daily refresh and
changes nothing).

    python tools/budget_intel_check.py --data path/to/site/data [--json report.json] [--md report.md]

--data is a folder holding the site's built budget.json and tax.json (a copy of calgaryinsight.ca/data/, or the data/
folder of a local build). Without it only the checks on the files kept in the repository are run.

Each check has a result: pass, note (true, and worth knowing), gap (data the City does not publish), or FAIL (something
is wrong and must be looked at). The script exits 1 if any check FAILs. Nothing in a source is ever corrected to make a
check pass.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
Y4 = ['2027', '2028', '2029', '2030']
RATINGS = {None, 'Low', 'Slight', 'Medium', 'High', 'Extensive'}
STAGES = {'Stage 1: Identify', 'Stage 2: Assess & Select', 'Stage 3: Plan & Design', 'Stage 4: Execute'}
KINDS = {'Program', 'Annual Investment Program', 'Project'}


def load(*path):
    with open(os.path.join(*path), encoding='utf-8') as f:
        return json.load(f)


def s(a):
    return sum(v or 0 for v in a)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data')
    ap.add_argument('--json')
    ap.add_argument('--md')
    a = ap.parse_args()
    out = []

    def add(res, title, detail, **meta):
        out.append({'result': res, 'check': title, 'detail': detail, **meta})

    bc = load(ROOT, 'ui', 'budget-intel', 'business-cases.json')
    xw = load(ROOT, 'ui', 'budget-intel', 'crosswalk.json')
    C = bc['cases']
    cap = [c for c in C if c['type'] == 'capital']
    op = [c for c in C if c['type'] == 'operating']

    # ---- the business-case file itself
    ns = sorted(c['n'] for c in C)
    add('pass' if ns == list(range(1, len(C) + 1)) and len(C) == bc['counts']['cases'] else 'FAIL', 'Every business case is present',
        f'{len(C)} cases, numbered 1 to {len(C)}; {len(op)} operating, {len(cap)} capital.')
    bad = []
    for c in C:
        need = ['n', 'title', 'theme', 'page', 'pages', 'type', 'dept', 'bu', 'rationale']
        need += ['cap_k', 'needs_k', 'budget_id', 'kind', 'wards', 'stage', 'new', 'funding', 'service_area', 'priority', 'split', 'required'] if c['type'] == 'capital' \
            else ['one_time_m', 'ongoing_m', 'ftes', 'footnotes']
        miss = [k for k in need if k not in c or c[k] in ('', None)]
        if miss:
            bad.append(f"case {c['n']}: missing {', '.join(miss)}")
        if c['theme'] not in bc['themes']:
            bad.append(f"case {c['n']}: unknown Council priority")
        if not (1 <= c['page'] <= bc['source']['pages']):
            bad.append(f"case {c['n']}: page out of range")
        if c['type'] == 'capital':
            if len(c['cap_k']) != 6 or len(c['needs_k']) != 5 or len(c['split']) != 4:
                bad.append(f"case {c['n']}: wrong number of figures")
            if c['stage'] not in STAGES or c['kind'] not in KINDS:
                bad.append(f"case {c['n']}: stage or kind not one of the City's")
            if not (c['wards'] == 'all' or (isinstance(c['wards'], list) and all(isinstance(w, int) and 1 <= w <= 14 for w in c['wards']))):
                bad.append(f"case {c['n']}: wards not read")
        else:
            if any(len(c[k]) != 4 for k in ('one_time_m', 'ongoing_m', 'ftes')):
                bad.append(f"case {c['n']}: wrong number of figures")
            if c.get('risk') not in RATINGS:
                bad.append(f"case {c['n']}: risk rating not one of the City's")
    add('FAIL' if bad else 'pass', 'Every case has every field, in the City\'s own categories', '; '.join(bad[:12]) or 'All fields present; stages, kinds, wards and ratings are within the City\'s lists.')
    pages = [c['page'] for c in sorted(C, key=lambda c: c['n'])]
    add('pass' if all(x <= y for x, y in zip(pages, pages[1:])) else 'FAIL', 'Cases are in page order', 'Page numbers rise with the case numbers.')
    bad = [c['n'] for c in cap if abs((c['cap_k'][0] or 0) - s(c['cap_k'][1:])) > 3]
    add('FAIL' if bad else 'pass', 'Each capital total equals its years', f'Cases that do not add up: {bad}' if bad else f'All {len(cap)} totals equal 2027 + 2028 + 2029 + 2030 + later, within $3,000 of rounding.',
        formula='|total - sum of years| <= 3 ($000s)')
    bad = [c['n'] for c in cap if s(c['split']) not in (99, 100, 101)]
    add('FAIL' if bad else 'pass', 'Each capital request\'s four purposes add to 100%', f'Cases: {bad}' if bad else f'All {len(cap)} do.')
    neg = [c['n'] for c in C if any((v or 0) < 0 for k in ('cap_k', 'needs_k', 'one_time_m', 'ongoing_m', 'ftes') for v in c.get(k, []))]
    add('note' if neg else 'pass', 'No negative amounts', f'Cases with a negative figure: {neg}' if neg else 'None.')
    tot = bc['totals']
    same = tot['capital_k'] == [s(c['cap_k'][i] for c in cap) for i in range(6)] and tot['ftes'] == [round(s(c['ftes'][i] for c in op), 1) for i in range(4)]
    add('pass' if same else 'FAIL', 'The stored totals equal the sum of the cases', f"Capital total ${tot['capital_k'][0] / 1e6:,.3f} billion; positions {tot['ftes']}.")
    dup = [k for k in set(c['title'] for c in C) if sum(1 for c in C if c['title'] == k) > 1]
    part = [c for c in op if c.get('full_one_time_m') is not None]
    low = [c['n'] for c in part if c['full_one_time_m'] + 0.05 < sum(v or 0 for v in c['one_time_m']) or not c.get('footnotes')]
    add('FAIL' if low else 'note' if part else 'pass', 'One-time requests only partly in the proposed budget',
        f'A stated full request smaller than its table, or without a starred row: {low}' if low else
        f"{len(part)} requests: ${sum(sum(v or 0 for v in c['one_time_m']) for c in part):,.1f} million in their tables, ${sum(c['full_one_time_m'] for c in part):,.1f} million "
        'stated as the full requests in the City\'s notes. One-time totals add the tables.' if part else 'None.')
    add('note' if dup else 'pass', 'Titles used more than once', f'{len(dup)} titles appear on more than one case (the City uses the same title for separate requests): {sorted(dup)[:6]}' if dup else 'None.')

    # ---- the crosswalk
    depts = {c['dept'] for c in C}
    bus = {c['bu'] for c in C}
    stray = [k for k in xw['departments'] if k not in depts] + [k for k in xw['business_units'] if k not in bus] + [k for k in xw['business_units_unmatched'] if k not in bus]
    add('FAIL' if stray else 'pass', 'Every crosswalk entry matches a name in the document', f'Entries that match nothing: {stray}' if stray else
        f"{len(xw['departments'])} department and {len(xw['business_units'])} business-unit matches, {len(xw['business_units_unmatched'])} recorded as unmatched.")
    areas = {c['service_area'] for c in cap}
    miss = sorted(areas - set(xw['service_areas']['areas']))
    add('FAIL' if miss else 'pass', 'Every service area has an entry (a link or a stated gap)', f'No entry for: {miss}' if miss else f'{len(areas)} service areas.')
    idx = open(os.path.join(ROOT, 'ui', 'index.html'), encoding='utf-8').read()
    views = set(re.findall(r'<section id="view-([a-z0-9-]+)"', idx))
    dead = sorted({l[0] for ls in xw['service_areas']['areas'].values() for l in ls if '/' not in l[0]} - views)
    add('FAIL' if dead else 'pass', 'Every linked screen exists', f'Links to screens that do not exist: {dead}' if dead else 'All linked screens are in ui/index.html.')

    # ---- the screen is wired in once, and nothing else was removed
    wired = [idx.count('id="view-budget-intelligence"') == 1, idx.count('data-view="budget-intelligence"') == 1,
             idx.count('<script src="budget-intel.js"></script>') == 1, idx.count('href="budget-intel.css"') == 1,
             idx.count('id="view-budget"') == 1, idx.count('<script src="budget.js"></script>') == 1]
    add('pass' if all(wired) else 'FAIL', 'The screen is wired into the site once, beside the City budget screen', 'One section, one tab, one script, one stylesheet; the City budget screen and its script are still there.')

    # ---- against the built data
    if a.data:
        b = load(a.data, 'budget.json')
        P = b['proposed']
        od = [(P['totals'][y]['capital'] or {}).get('proposed') or 0 for y in Y4]
        sums = [s(c['cap_k'][i] for c in cap) / 1000 for i in (1, 2, 3, 4)]
        worst = max(abs(x - y) / y * 100 for x, y in zip(sums, od))
        add('pass' if worst < 0.5 else 'FAIL', 'The capital requests add up to the City\'s open data, year by year',
            f"Cases {[round(x, 1) for x in sums]} against open data {od} ($ millions, 2027 to 2030); largest difference {worst:.2f}%.",
            formula='sum of cases for the year / 1,000 against open-data rows with fund = Capital, status = Proposed', inputs=f"{P['dataset']} read {P['fetched']}")
        o, c2 = {}, {}
        for y in Y4:
            for d in P['by_department'][y].get('capital', []):
                for u in d.get('units', []):
                    if u.get('status') == 'proposed':
                        o[u['name']] = o.get(u['name'], 0) + u['value']
        key = lambda n: xw['business_units'].get(n, {}).get('open_data', n)
        for c in cap:
            c2[key(c['bu'])] = c2.get(key(c['bu']), 0) + s(c['cap_k'][1:5]) / 1000
        names = sorted(set(o) | set(c2))
        off = [(n, round(c2.get(n, 0) - o.get(n, 0), 1)) for n in names if abs(c2.get(n, 0) - o.get(n, 0)) > 1]
        add('note' if off else 'pass', 'The same, business unit by business unit',
            f"{len(names) - len(off)} of {len(names)} match within $1 million. Differing ($ millions, cases minus open data): {off}; net {round(sum(v for _, v in off), 1)}.",
            note='The differences nearly cancel, which suggests the two sources file some of the same projects under different business units. An inference; the City has not published a mapping.')
        bad = []
        for y in b['years']:
            for f in ('operating', 'capital'):
                t, L = b['totals'].get(y, {}).get(f), b['by_department'].get(y, {}).get(f)
                if t and L and abs(sum(d['value'] for d in L) - t['value']) > 0.6:
                    bad.append(f'{y} {f}')
        add('FAIL' if bad else 'pass', 'Open budget: departments add up to each year\'s total', f'Not for: {bad}' if bad else f"For every year and fund, {b['years'][0]} to {b['years'][-1]}.")
        add('gap', 'Budget against actual spending cannot be compared', 'The open budget gives one figure per year and fund (approved or actual), never both: '
            + '; '.join(f"{y} operating {b['totals'][y].get('operating', {}).get('status', 'not published')}, capital {b['totals'][y].get('capital', {}).get('status', 'not published')}" for y in b['years'] if int(y) <= 2026))
        rows = [(y, b['totals'][y]['capital']['value'], P['totals'][y]['capital'].get('approved')) for y in Y4 if b['totals'].get(y, {}).get('capital') and P['totals'][y]['capital'].get('approved') is not None]
        diff = [(y, round(n - o_, 1)) for y, o_, n in rows if abs(n - o_) > 1]
        add('note' if diff else 'pass', 'Capital already approved for 2027 to 2030: two City datasets', f"{b['dataset']} against {P['dataset']} ($ millions, newer minus older): {diff}. Neither is changed; the centre uses the newer for those years."
            if diff else 'The two datasets agree.')
        R = b.get('revenue')
        if R:
            bad = [y for i, y in enumerate(R['years']) if abs(sum(l['values'][i] for l in R['lines']) - R['total'][i]) > 2]
            add('FAIL' if bad else 'pass', 'Revenue sources add up to the total', f'Not for {bad}' if bad else f"{R['years'][0]} to {R['years'][-1]}, within $2 million of rounding.")
        tx = os.path.join(a.data, 'tax.json')
        if os.path.exists(tx):
            T = load(tx)
            w = sum(v['municipal'] for v in T['by_ward'].values())
            d = (T['city']['municipal']['total'] - w) / T['city']['municipal']['total'] * 100
            add('pass' if abs(d) < 0.5 else 'FAIL', 'Property tax by ward adds up to the citywide levy', f"Wards hold {100 - d:.2f}% of ${T['city']['municipal']['total'] / 1e6:,.1f} million ({T['year']}).")
        ob = {u['name'] for y in Y4 for f in ('operating', 'capital') for d in P['by_department'][y].get(f, []) for u in d.get('units', [])}
        miss = sorted(n for n in bus if key(n) not in ob)
        add('note' if miss else 'pass', 'Business-unit names found in the open data', f"Not matched: {miss} (recorded in the crosswalk)." if miss else f'All {len(bus)} names match.')
    else:
        add('note', 'Checks against the built data were not run', 'No --data folder was given.')

    fails = [c for c in out if c['result'] == 'FAIL']
    counts = {k: sum(1 for c in out if c['result'] == k) for k in ('pass', 'note', 'gap', 'FAIL')}
    for c in out:
        print(f"{c['result']:5} {c['check']}: {c['detail']}")
    print(counts)
    if a.json:
        with open(a.json, 'w', encoding='utf-8') as f:
            json.dump({'counts': counts, 'source': bc['source'], 'checks': out}, f, ensure_ascii=False, indent=1)
    if a.md:
        with open(a.md, 'w', encoding='utf-8') as f:
            f.write('| Result | Check | Detail |\n|---|---|---|\n' + '\n'.join(f"| {c['result']} | {c['check']} | {c['detail'].replace('|', '/')} |" for c in out) + '\n')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
