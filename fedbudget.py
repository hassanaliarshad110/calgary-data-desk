"""Federal Budget 2026 (tabled 5 November 2026) for Data Genie and the Data Scientist.

The data is ui/budget/budget2026.json, read once from the official budget pages (budget.canada.ca) and Finance Canada's
Federal Support to Provinces and Territories tables. Chapter and tax tables are in $ millions; Annex 1 tables in $ billions.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, 'ui', 'budget', 'budget2026.json')
_DATA = None
CODES = {'NL': 'Newfoundland and Labrador', 'PE': 'Prince Edward Island', 'NS': 'Nova Scotia', 'NB': 'New Brunswick',
         'QC': 'Québec', 'ON': 'Ontario', 'MB': 'Manitoba', 'SK': 'Saskatchewan', 'AB': 'Alberta', 'BC': 'British Columbia',
         'YT': 'Yukon', 'NT': 'Northwest Territories', 'NU': 'Nunavut'}
YEARS = ['2026-27', '2027-28', '2028-29', '2029-30', '2030-31', '5-year total']


def load():
    global _DATA
    if _DATA is None:
        with open(PATH, encoding='utf-8') as f:
            _DATA = json.load(f)
    return _DATA


def _row(t, label):
    for r in t.get('rows') or []:
        if r.get('v') and r['label'] == label:
            return r
    for r in t.get('rows') or []:
        if r.get('v') and r['label'].startswith(label):
            return r
    return None


def _table(t):
    return {'caption': t.get('caption'), 'columns': t.get('cols'),
            'rows': [[r['label']] + (r.get('raw') or []) for r in t.get('rows') or []], 'note': t.get('note')}


def items():
    d = load()
    for c in d['chapters']:
        for s in c['sections']:
            for i in s['items']:
                yield c, s, i


def summary():
    d = load()
    a8 = d['fiscal']['Table A1.8']
    return {
        'title': d['title'], 'tabled': d['tabled'], 'tabled_by': d['tabled_by'], 'source': d['source'],
        'units': 'fiscal tables in $ billions; chapter measures, tax measures and transfers in $ millions',
        'summary_statement_A1_8': _table(a8),
        'deficit_change_since_spring_update': _table(d['overview']),
        'measures_by_chapter_millions': [{'chapter': c['n'], 'name': c['name'], 'years': YEARS, 'net_cost': c['net'],
                                          'of_which_capital': c['capital'],
                                          'sections': [{'section': s['id'], 'name': s['name'], 'amounts': s['v'],
                                                        'items': len(s['items'])} for s in c['sections']]}
                                         for c in d['chapters']],
        'strategies': [{'name': s['name'], 'amount': s['amount'], 'points': s['lines']} for s in d['strategies']],
        'defence_core_spending': _table(d['defence']),
        'transfers_by_province_millions': {p['code']: {'name': p['name'],
                                                       'total_2026_27': (_row(p['transfers'], 'Total') or {}).get('v', [None])[-1],
                                                       'per_person_2026_27': (_row(p['transfers'], 'Per Capita') or {}).get('v', [None])[-1]}
                                           for p in d['provinces'] if p.get('transfers')},
        'more': 'part="province" with province (code or name), part="find" with find (any words), '
                'part="tables" for the revenue, expense, operating balance, capital and borrowing tables, '
                'part="tax" for every tax measure, part="chapter" with chapter (1-6) for every line item.'}


def province(name):
    d = load()
    key = (name or 'AB').strip()
    code = key.upper() if key.upper() in CODES else next((c for c, n in CODES.items() if n.lower() == key.lower()
                                                           or key.lower() in n.lower()), None)
    p = next((p for p in d['provinces'] if p['code'] == code), None)
    if not p:
        return {'error': f'No province or territory called {name!r}. Use a name or a code: ' + ', '.join(CODES)}
    out = {k: p[k] for k in ('code', 'name', 'major_projects', 'communities_fund', 'festivals', 'defence')}
    t = p.get('transfers') or {}
    out['transfers_millions'] = {'years': t.get('years'), 'rows': [[r['label']] + r['v'] for r in t.get('rows') or []],
                                 'note': t.get('note'), 'source': d['transfers_source']}
    out['passages'] = [{'where': d['docs'][m['doc']]['name'], 'topic': m['topic'], 'text': m['text']} for m in p['mentions']]
    if code == 'AB':
        out['calgary_passages'] = [m['text'] for m in d['calgary']]
    out['note'] = ('major_projects: projects referred to the Major Projects Office (Budget in brief); communities_fund: '
                   'Build Communities Strong Fund projects the budget proposes to support (Chapter 3); defence: Figure 5.1, '
                   'by region; passages: every paragraph of the budget that names the province or its cities.')
    return out


def find(words, limit=25):
    q = [w for w in (words or '').lower().split() if w]
    d = load()
    hits = []
    for c, s, i in items():
        text = ' '.join([i['name'], s['name'], i.get('desc') or ''] + [x['text'] for x in i.get('text') or []]).lower()
        score = sum(text.count(w) for w in q) if all(w in text for w in q) else 0
        if score:
            hits.append((score + (5 if all(w in i['name'].lower() for w in q) else 0), {
                'measure': i['name'], 'chapter': c['n'], 'section': s['id'] + ' ' + s['name'] if s['id'] != 'add' else s['name'],
                'amounts_millions': dict(zip(YEARS, i['v'])), 'less': i.get('less'), 'capital': i.get('capital'),
                'budget_text': [x['text'] for x in i.get('text') or []] or ([i['desc']] if i.get('desc') else [])}))
    hits.sort(key=lambda x: -x[0])
    tax = [[r['label']] + r['raw'] for r in d['tax_measures']['rows'] if r.get('raw') and all(w in r['label'].lower() for w in q)]
    return {'find': words, 'measures': [h[1] for h in hits[:limit]], 'measures_found': len(hits), 'tax_measures': tax,
            'note': 'Amounts in $ millions, accrual basis; negative = a saving or new revenue. None = no change.'}


def chapter(n):
    d = load()
    c = next((c for c in d['chapters'] if c['n'] == int(n or 1)), None)
    if not c:
        return {'error': 'Chapters are 1 to 6.'}
    return {'chapter': c['n'], 'name': c['name'], 'years': YEARS, 'net_cost': c['net'], 'notes': c['notes'],
            'sections': [{'section': s['id'], 'name': s['name'], 'amounts': s['v'],
                          'items': [{'measure': i['name'], 'amounts': i['v'], 'less': i.get('less')} for i in s['items']]}
                         for s in c['sections']]}


def tables():
    d = load()
    return {k: _table(t) for k, t in d['fiscal'].items()}


def tax():
    d = load()
    return _table(d['tax_measures'])


def answer(part=None, province_=None, find_=None, chapter_=None):
    try:
        if part == 'province' or (province_ and not part):
            return province(province_)
        if part == 'find' or (find_ and not part):
            return find(find_)
        if part == 'chapter':
            return chapter(chapter_)
        if part == 'tables':
            return tables()
        if part == 'tax':
            return tax()
        return summary()
    except FileNotFoundError:
        return {'error': 'The federal budget file is not in this copy yet.'}
