"""The complete list of the 384 business cases, from ui/budget-intel/business-cases.json, as a CSV file and a Markdown table.
usage: python3 list_cases.py <business-cases.json> <third-reading.json> <out.csv> <out.md>"""
import sys, json, csv
BC = json.load(open(sys.argv[1])); T = {r['n']: r for r in json.load(open(sys.argv[2]))['cases']}
C = BC['cases']; s = lambda a: sum(v or 0 for v in a)
cols = ['No.', 'Title', 'Kind', 'First page', 'Pages', 'Department (as printed)', 'Business unit (as printed)', 'Council priority', 'Reason given',
        'Capital total ($000s)', 'Capital 2027', 'Capital 2028', 'Capital 2029', 'Capital 2030', 'Capital 2031 and later',
        'Maintenance or replacement %', 'Growth %', 'Service enhancement %', 'Transformative %',
        'One-time 2027 ($M)', 'One-time 2028', 'One-time 2029', 'One-time 2030', 'Ongoing 2027 ($M)', 'Ongoing 2028', 'Ongoing 2029', 'Ongoing 2030',
        'FTEs 2027', 'FTEs 2028', 'FTEs 2029', 'FTEs 2030', 'Full one-time request in the City note ($M)', 'City note under the table',
        'Ward(s)', 'Stage', 'New or existing', 'Funding source', 'Service area', 'Budget ID', 'Marked Required', 'Status',
        'Third reading: comparisons', 'Third reading: differences']
b = lambda v: '' if v is None else v
with open(sys.argv[3], 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(cols)
    for c in C:
        t = T[c['n']]; cap = c['type'] == 'capital'
        w.writerow([c['n'], c['title'], c['type'], c['page'], c['pages'], c['dept'], c['bu'], c['theme'], c['rationale']]
                   + ([b(v) for v in c['cap_k']] + c['split'] if cap else [''] * 10)
                   + ([''] * 12 if cap else [b(v) for v in c['one_time_m']] + [b(v) for v in c['ongoing_m']] + [b(v) for v in c['ftes']])
                   + ['' if cap else b(c.get('full_one_time_m')), '' if cap else ('yes' if c['footnotes'] else 'no'),
                      ('All wards' if c['wards'] == 'all' else '; '.join(map(str, c['wards']))) if cap else '', c.get('stage', ''), ('new' if c['new'] else 'existing') if cap else '',
                      c.get('funding', ''), c.get('service_area', ''), c.get('budget_id', ''), ('yes' if c.get('required') else 'no') if cap else '', 'Proposed, not approved',
                      len(t['checks']), sum(1 for v in t['checks'].values() if not v)])
m = lambda v: f'{v:,.1f}'
with open(sys.argv[4], 'w', encoding='utf-8') as f:
    f.write('# All 384 business cases\n\nFrom `ui/budget-intel/business-cases.json` (the City of Calgary\'s "2027-2030 budget request business cases", 792 pages, '
            f"file last changed by the City {BC['source']['modified']}, sha256 `{BC['source']['sha256']}`). Every figure is **proposed, not approved**. "
            'The same list with every column (amounts by year, purposes, wards, stage, funding source, Budget ID) is `all-384-cases.csv` beside this file.\n\n'
            'Funding: for a capital request, the City\'s "4-Year Capital Budget Consideration" total; for an operating request, the one-time amounts added over 2027 to 2030, '
            'the ongoing additions to the base budget added over the four years (as the City adds them in its own notes), and the positions in the FTE row for 2027. '
            'A dash is nil in the City\'s table. Names are as the City prints them.\n\n'
            '| No. | Title | Kind | Page | Department | Business unit | Funding ($ millions) |\n|---:|---|---|---:|---|---|---|\n')
    for c in C:
        if c['type'] == 'capital': fund = f"capital {m(c['cap_k'][0] / 1000)}"
        else:
            fund = f"one-time {m(s(c['one_time_m'])) if s(c['one_time_m']) else '–'}; ongoing {m(s(c['ongoing_m'])) if s(c['ongoing_m']) else '–'}; positions 2027: {c['ftes'][0] if c['ftes'][0] else '–'}"
            if 'full_one_time_m' in c: fund += f" (City note: full one-time request {m(c['full_one_time_m'])})"
        f.write(f"| {c['n']} | {c['title'].replace('|', '/')} | {c['type']} | {c['page']} | {c['dept']} | {c['bu']} | {fund} |\n")
    cap = [c for c in C if c['type'] == 'capital']; op = [c for c in C if c['type'] == 'operating']
    f.write(f"\n**Totals:** {len(C)} cases: {len(op)} operating, {len(cap)} capital. Capital: ${s(c['cap_k'][0] for c in cap) / 1000:,.1f} million. "
            f"Operating one-time: ${s(s(c['one_time_m']) for c in op):,.1f} million over four years. Positions in 2027: {s(c['ftes'][0] for c in op):,}.\n")
print('written', len(C))
