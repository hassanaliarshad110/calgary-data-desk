"""Builds ui/budget-intel/budget-vs-actual.json from the two agreeing readings of the City's reports (read1/read2 and
the year-end update reading). Nothing is typed by hand except the 2023 capital chart labels, which both readers gave
identically. usage: make_bva.py <out.json>"""
import json, sys
R = lambda y: json.load(open(f'r1-{y}.json'))
R2 = lambda y: json.load(open(f'r2-{y}.json'))
FE = json.load(open('fe2024.json'))
n = lambda t: 0 if t == '-' else (-int(t.strip('()').replace(',', '')) if t.startswith('(') else int(t.replace(',', '')))
AFR = {'2023': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/Finance-2023-Annual-Report.pdf',
       '2024': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/Finance-2024-Annual-Report.pdf',
       '2025': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/2025-Annual-Financial-Report.pdf'}
src = {f'afr{y}': {'title': f'{y} City of Calgary Annual Financial Report', 'publisher': 'The City of Calgary', 'url': u, 'audited': True} for y, u in AFR.items()}
for y in AFR: src[f'afr{y}']['short'] = f'{y} Annual Financial Report'
src['ye2024'] = {'title': 'Financial and Economic Update, 2024 Year-End and First Quarter 2025 (EC2025-0414, revised Attachment 2)', 'publisher': 'The City of Calgary',
                 'url': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/financial-economic-update-2024-year-end-Q1-2025.pdf', 'audited': False}
src['ye2024']['short'] = '2024 year-end update'
src['pu2023'] = {'title': '2023 Progress Update Report (EC2024-0291, Attachment 3)', 'publisher': 'The City of Calgary',
                 'url': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/plans-budgets-and-financial-reports/progress-update-report.pdf', 'audited': False}
src['pu2023']['short'] = '2023 Progress Update'
src['ye2025'] = {'title': 'The City\'s Quarterly Report, 2025 Year-End (report to Council)', 'publisher': 'The City of Calgary',
                 'url': 'https://pub-calgary.escribemeetings.com/filestream.ashx?DocumentId=354763', 'audited': False}
OPS = ['Net taxes available for municipal purposes', 'Sales of goods and services', 'Government transfers related to operating', 'Investment income',
       'Fines and penalties', 'Licences, permits and fees', 'Miscellaneous revenue']
cons = {}
for y in ('2023', '2024', '2025'):
    r, r2 = R(y), R2(y)
    assert r2['agree'] == 57 and not r2['differ'] and not r2['arithmetic_failures'], y
    rows = lambda b: [{'name': x['label'], 'budget': x['values'][0], 'actual': x['values'][1], 'favourable': x['values'][2]} for x in b['rows']]
    rev, exp = rows(r['revenues']), rows(r['expenses'])
    for x in rev:
        if x['name'].startswith('Equity in'): x['name'] = 'ENMAX (the City\'s share of its earnings)'
        if x['name'].startswith('Total revenues'): x['name'] = 'Total revenues (before transfers for infrastructure)'
    exp[-1]['name'] = 'Total'
    cons[y] = {'source': f'afr{y}',
               'revenues': {'pdf_page': r['revenues']['pdf_page'], 'printed_page': int(r2['printed_pages']['revenues'][0]), 'rows': rev},
               'expenses': {'pdf_page': r['expenses']['pdf_page'], 'printed_page': int(r2['printed_pages']['expenses'][0]), 'rows': exp}}
out = {
  'title': 'Budget against actual: the City of Calgary, 2023 to 2025',
  'unit': 'thousands of dollars, as the City prints them; favourable = better than budget (spending below budget, or revenue above it)',
  'read': '2026-11-11',
  'sources': src,
  'consolidated': cons,
  'operating_surplus': [
    {'year': '2023', 'value': 236408, 'favourable_variance': 237756, 'timing': -1348, 'source': 'afr2025', 'pdf_page': 120, 'printed_page': 118, 'also': {'source': 'afr2023', 'pdf_page': 121, 'printed_page': 119}},
    {'year': '2024', 'value': 276277, 'source': 'ye2024', 'pdf_page': 1, 'printed_page': 1,
     'note': 'The 2024 Annual Financial Report does not include this reconciliation (the City says the figure went to Council after that report); it is the City\'s year-end update.'},
    {'year': '2025', 'value': 259308, 'favourable_variance': 259308, 'timing': 0, 'source': 'afr2025', 'pdf_page': 120, 'printed_page': 118}],
  'tax_supported_by_department': {'2024': {'source': 'ye2024', 'pdf_page': 1, 'printed_page': 1, 'title': 'Operating Budget Overview, Year-End 2024: Net Budget – comparison to Actuals',
     'rows': [{'name': r[0], 'budget': n(r[1]), 'actual': n(r[2]), 'favourable': n(r[3])} for r in FE['operating']['rows']]}},
  'capital': {
    '2023': {'source': 'pu2023', 'pdf_page': 21, 'printed_page': 21, 'basis': 'service category', 'unit': 'millions of dollars',
             'title': 'Total City 2023 Capital Budget and Spend by Service Categories ($ Million)',
             'rows': [{'name': a, 'budget': b, 'actual': c} for a, b, c in [
               ['Transportation', 1119.8, 556.5], ['Utilities and Environment', 560.7, 364.8], ['Enabling Service', 357.8, 187.0],
               ['Building, Planning and Business', 287.2, 178.1], ['Parks, Recreation and Culture', 188.0, 74.6], ['Public Safety and Bylaws', 162.4, 51.4],
               ['Social Programs and Services', 89.6, 44.5], ['Information and Communication', 9.4, 1.9], ['Tax and Property Assessment', 8.5, 2.6],
               ['Total City', 2783.4, 1461.4]]]},
    '2024': {'source': 'ye2024', 'pdf_page': 4, 'printed_page': 4, 'basis': 'department', 'unit': 'thousands of dollars',
             'title': 'Capital Budget Overview, Year-End 2024: Capital Budget – comparison to Actuals',
             'rows': [{'name': r[0], 'budget': n(r[1]), 'actual': n(r[2]), 'rate_printed': r[3]} for r in FE['capital']['rows']]},
    '2025': {'source': 'ye2025', 'basis': 'department', 'published_only_in': True}},
}
# checks kept with the file
c = out['capital']['2023']['rows']
assert round(sum(r['budget'] for r in c[:-1]), 1) == c[-1]['budget'] and round(sum(r['actual'] for r in c[:-1]), 1) == c[-1]['actual']
json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('ok')
