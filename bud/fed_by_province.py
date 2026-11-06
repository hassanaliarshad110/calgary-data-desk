"""Federal revenue and spending by province and territory, for the Federal Budget 2026 tab.

The budget publishes revenue for Canada only. Statistics Canada's provincial and territorial economic accounts
(table 36-10-0450-01, "Revenue, expenditure and budgetary balance - General governments") give the federal general
government's revenue collected in each province and territory and its spending there, by calendar year. Population:
table 17-10-0009-01 (1 July). The result goes into ui/budget/budget2026.json under "by_province".

    python bud/fed_by_province.py ROWS_36100450.json POP_17100009.json ui/budget/budget2026.json
ROWS: [[year, geo, level, estimate, value, scalar], ...] (the website build's probe of the full table)
"""
import json
import sys

TABLE = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3610045001'
POP_TABLE = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710000901'
GEOS = ['Newfoundland and Labrador', 'Prince Edward Island', 'Nova Scotia', 'New Brunswick', 'Quebec', 'Ontario', 'Manitoba',
        'Saskatchewan', 'Alberta', 'British Columbia', 'Yukon', 'Northwest Territories', 'Nunavut', 'Outside Canada', 'Canada']
CODE = {'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE', 'Nova Scotia': 'NS', 'New Brunswick': 'NB', 'Quebec': 'QC',
        'Ontario': 'ON', 'Manitoba': 'MB', 'Saskatchewan': 'SK', 'Alberta': 'AB', 'British Columbia': 'BC', 'Yukon': 'YT',
        'Northwest Territories': 'NT', 'Nunavut': 'NU', 'Outside Canada': 'XX', 'Canada': 'CA'}
# (key, label, the table's line). The table repeats some names ("From households") under revenue and capital
# transfers, so each is taken at its first appearance in the table's order, which is the revenue side.
REVENUE = [('personal_income_tax', 'Personal income tax', 'Income taxes'),
           ('corporate_income_tax', 'Corporate income tax', 'From corporations and government business enterprises, liabilities'),
           ('non_resident_tax', 'Non-resident withholding tax', 'From non-residents (withholding taxes)'),
           ('ei_premiums', 'Employment Insurance premiums', 'Contributions to social insurance plans'),
           ('gst', 'GST', 'Goods and services tax (GST)'),
           ('excise', 'Excise taxes and duties (fuel, alcohol, tobacco, cannabis, air travel)', 'Excise taxes'),
           ('customs', 'Customs import duties', 'Custom import duties'),
           ('investment', 'Investment income (interest, Crown corporation profits)', 'Investment income'),
           ('sales', 'Sales of goods and services', 'Sales of goods and services')]
SPENDING = [('goods_services', 'Federal operations (goods and services, incl. defence)', 'Final expenditure on goods and services'),
            ('defence', 'of which defence', 'Defence'),
            ('to_households', 'Benefits to people (OAS, EI, Canada Child Benefit, GST credit...)', 'Current transfers to households'),
            ('oas', 'of which Old Age Security', 'Old Age Security'),
            ('ei_benefits', 'of which Employment Insurance benefits', 'Employment Insurance benefits'),
            ('ccb', 'of which Canada Child Benefit', 'Canada Child Benefit'),
            ('to_provinces', 'Transfers to the provincial or territorial government', 'To provincial and territorial general governments'),
            ('cht', 'of which Canada Health Transfer', 'Canada Health Transfer'),
            ('cst', 'of which Canada Social Transfer', 'Canada Social Transfer'),
            ('to_local', 'Transfers to municipalities', 'To local general governments'),
            ('to_indigenous', 'Transfers to Indigenous governments', 'To Indigenous general governments'),
            ('subsidies', 'Subsidies to business and farms', 'Subsidies'),
            ('capital_transfers', 'Capital transfers', 'Capital transfers'),
            ('interest', 'Interest on the federal debt (allocated)', 'Interest on debt')]


def build(rows, pop_rows):
    fed = [r for r in rows if r[2] == 'Federal general government']
    years = sorted({r[0] for r in fed})
    pop = {}
    for d, g, v in pop_rows:
        if d.endswith('-07-01') and v:
            pop[(d[:4], g)] = float(v)
    out = {'years': years, 'source': {'title': 'Revenue, expenditure and budgetary balance - General governments, provincial and '
                                               'territorial economic accounts (table 36-10-0450-01)',
                                      'publisher': 'Statistics Canada', 'url': TABLE, 'population': POP_TABLE},
           'unit': '$ millions', 'by_year': {}}
    for y in years:
        by = {}
        for g in GEOS:
            seq = [(r[3], float(r[4]) if r[4] not in ('', None) else None) for r in fed if r[0] == y and r[1] == g]
            if not seq:
                continue
            first = {}
            for name, v in seq:
                if name not in first:
                    first[name] = v
            # the second "Capital transfers" (spending) comes after "General governments expenditure"
            exp_i = next((i for i, (n, _) in enumerate(seq) if n == 'General governments expenditure'), None)
            after = {}
            if exp_i is not None:
                for name, v in seq[exp_i:]:
                    if name not in after:
                        after[name] = v
            rev = {k: first.get(line) for k, _, line in REVENUE}
            spend = {k: (after.get(line)) for k, _, line in SPENDING}
            tot_r, tot_e = first.get('General governments revenue'), first.get('General governments expenditure')
            rev['other'] = round(tot_r - sum(v or 0 for v in rev.values()), 1) if tot_r is not None else None
            main = ('goods_services', 'to_households', 'to_provinces', 'to_local', 'to_indigenous', 'subsidies', 'capital_transfers', 'interest')
            spend['other'] = round(tot_e - sum(spend[k] or 0 for k in main), 1) if tot_e is not None else None
            p = pop.get((y, g)) or (pop.get((y, 'Canada')) if g == 'Canada' else None)
            by[CODE[g]] = {'name': g, 'revenue': tot_r, 'spending': tot_e, 'balance': first.get('General governments surplus or deficit'),
                           'rev': rev, 'spend': spend, 'population': round(p) if p else None}
        tot = (by.get('CA') or {}).get('revenue')
        for c, x in by.items():
            x['share_of_revenue'] = round(x['revenue'] / tot, 4) if tot and x.get('revenue') is not None else None
            if x.get('population'):
                for k in ('revenue', 'spending', 'balance'):
                    x[k + '_per_person'] = round(x[k] * 1e6 / x['population']) if x.get(k) is not None else None
        out['by_year'][y] = by
    out['labels'] = {'rev': [[k, l] for k, l, _ in REVENUE] + [['other', 'Other revenue']],
                     'spend': [[k, l] for k, l, _ in SPENDING] + [['other', 'Other spending']]}
    out['how'] = ('Statistics Canada\'s provincial and territorial economic accounts, federal general government: revenue '
                  'collected from people and businesses in each province or territory, and federal spending there '
                  '(benefits paid to its residents, transfers to its government, federal operations, and an allocated '
                  'share of interest on the debt). Calendar years, national accounts basis, so totals differ from the '
                  'budget\'s fiscal-year (April to March) figures. "Outside Canada" is revenue and spending that belong to no '
                  'province (non-resident taxes, foreign aid and the like). Balance = revenue minus spending in the province: '
                  'positive means more federal revenue was collected there than was spent there.')
    return out


if __name__ == '__main__':
    rows = json.load(open(sys.argv[1]))
    pop = json.load(open(sys.argv[2]))
    pop = pop.get('17100009', pop) if isinstance(pop, dict) else pop
    path = sys.argv[3]
    b = json.load(open(path, encoding='utf-8'))
    d = build([[r[0], r[1], r[2], r[3], r[4]] for r in rows], pop)
    rev = next((r['v'] for r in b['fiscal']['Table A1.8']['rows'] if r['label'] == 'Budgetary revenues'), None)
    cols = b['fiscal']['Table A1.8']['cols']
    if rev:
        y = d['years'][-1]
        d['estimate_2026_27'] = {'national_revenue_billions': rev[cols.index('2026-27')], 'basis_year': y,
                                 'how': f'Budget 2026\'s budgetary revenue for 2026-27 (Table A1.8) shared out by each province\'s '
                                        f'share of federal revenue in {y} (Statistics Canada). An estimate: the budget itself '
                                        'does not split revenue by province.',
                                 'by': {c: round(x['share_of_revenue'] * rev[cols.index('2026-27')], 1)
                                        for c, x in d['by_year'][y].items() if x.get('share_of_revenue') is not None and c != 'CA'}}
    b['by_province'] = d
    json.dump(b, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    a = d['by_year'][d['years'][-1]]['AB']
    print(d['years'], 'AB', a['revenue'], a['spending'], a['balance'], a['share_of_revenue'], a.get('balance_per_person'))
