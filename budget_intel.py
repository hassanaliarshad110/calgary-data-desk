"""Budget Intelligence for Data Genie and the Data Scientist: every business case behind the City of Calgary's proposed
2027-2030 budget (the Budget Intelligence screen, ui/budget-intel.js, shows the same file).

The data is ui/budget-intel/business-cases.json: all 384 cases of the City's "2027-2030 budget request business cases"
(792 pages), read from the City's PDF by tools/budget_intel_extract.py, with each case's amounts by year, positions,
department, business unit, Council priority, ward, stage, funding source and the page of the City's document.
Everything in it is PROPOSED (presented to Council on November 10, 2026) and nothing is approved until Council votes.

Amounts: capital in thousands of dollars in the file, given here in millions; operating in millions. "Ongoing" figures
are additions to the base budget in that year (the City adds a request's yearly figures to state its ongoing amount);
no four-year cash cost is worked out. A dash in the City's tables is None here.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = 'https://calgaryinsight.ca/?view=budget-intelligence'
Y4 = ['2027', '2028', '2029', '2030']
PURPOSES = ['Maintenance or replacement', 'Growth', 'Service enhancement', 'Transformative']
HOW = ('Every figure here is PROPOSED, not approved: Council debates the budget from November 23, 2026 and decides in December. '
       'Say so whenever you give one. Describe; never rate the budget, a request, a department or a councillor, and take no side on '
       'what Council should approve. Capital amounts are each request\'s "4-Year Capital Budget Consideration" (2027 to 2030, with '
       'any amount for 2031 and later). Operating "ongoing" amounts are additions to the base budget in that year; do not multiply '
       'them into a four-year cost. Positions are full-time equivalents added in that year. Most capital (about 92% of the dollars) '
       'is for all wards: never divide a citywide amount among wards, communities or residents; a request that names several wards '
       'is counted in each and its dollars are not divided. '
       'One-time totals add what the tables show: for some requests the City\'s note says the budget includes only part of the full '
       'request (one_time_requests_partly_in_the_budget). Positions are those in each request\'s FTE row; a request\'s text can mention '
       'other staff that are not in its row. The City\'s open data does not allow budget against actual spending to '
       'be compared (one figure per year: approved or actual, never both), so do not compute a variance. The City\'s descriptions, '
       'benefits and risk statements are not in this data: give the page of the City\'s document (page_url) for them.')


def _read(name, data_dir=None):
    for d in (data_dir, os.path.join(HERE, 'data'), os.path.join(HERE, 'ui', 'budget-intel')):
        p = os.path.join(d or '', name)
        if d and os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    return None


def load(data_dir=None, can_build=True):
    return _read('business-cases.json', data_dir)


def crosswalk(data_dir=None):
    return _read('crosswalk.json', data_dir) or {}


def _s(a):
    return sum(v or 0 for v in a)


def _r(v, d=1):
    return round(v, d)


def _cap(c):
    return (c['cap_k'][0] or 0) / 1000 if c['type'] == 'capital' else 0.0


def _wards(c):
    return 'all wards' if c.get('wards') == 'all' else ', '.join(str(w) for w in c.get('wards') or [])


def _partly(op):
    """Requests whose City note says the budget includes only part of the full one-time request."""
    L = [c for c in op if c.get('full_one_time_m') is not None]
    return {'requests': len(L), 'in_their_tables_m': _r(_s(_s(c['one_time_m']) for c in L)), 'full_requests_stated_m': _r(_s(c['full_one_time_m'] for c in L)),
            'numbers': [c['n'] for c in L],
            'how': 'One-time totals here add what each table shows (the part in the proposed budget), not the full amounts asked for; '
                   'for these requests the City\'s note under the table states the larger four-year total.'}


def _row(c, src):
    """One request in a list: what it is and what it would cost."""
    o = {'n': c['n'], 'title': c['title'], 'kind': c['type'], 'department': c['dept'], 'business_unit': c['bu'],
         'council_priority': c['theme'], 'page': c['page']}
    if c['type'] == 'capital':
        o.update({'proposed_capital_m': _r(_cap(c)), 'wards': _wards(c), 'stage': c['stage']})
    else:
        o.update({'one_time_m': _r(_s(c['one_time_m'])), 'ongoing_added_m': _r(_s(c['ongoing_m'])),
                  'positions_2027': c['ftes'][0] or 0, 'positions_added_2027_2030': _s(c['ftes'])})
        if c.get('full_one_time_m') is not None:
            o['full_one_time_request_m'] = c['full_one_time_m']      # the City's note: the budget includes only part of it
    return o


def _full(c, src, xw):
    """One request with every figure and category the City states, and where to read the rest."""
    o = _row(c, src)
    o.update({'status': 'Proposed, not approved', 'reason_given': c.get('rationale'),
              'page_url': f"{src['url']}#page={c['page']}", 'pages': c['pages'],
              'read_there': 'The City\'s description, benefits and risk statements for this request are on that page of its document.'})
    if c['type'] == 'capital':
        o.update({
            'proposed_capital_by_year_m': {**{y: _r((c['cap_k'][i + 1] or 0) / 1000, 3) for i, y in enumerate(Y4)},
                                           '2031_and_later': _r((c['cap_k'][5] or 0) / 1000, 3), 'total': _r(_cap(c), 3)},
            'city_10_year_needs_by_year_m': {**{y: _r((c['needs_k'][i] or 0) / 1000, 3) for i, y in enumerate(Y4)},
                                             '2031_and_later': _r((c['needs_k'][4] or 0) / 1000, 3)},
            'budget_id': c['budget_id'], 'request_kind': c['kind'], 'new_or_existing': 'new' if c['new'] else 'existing',
            'funding_source': c['funding'], 'service_area': c['service_area'], 'marked_required_by_the_city': c['required'],
            'purpose_pct': dict(zip(PURPOSES, c['split'])), 'corporate_risk': c.get('corp_risk'), 'operating_risk': c.get('op_risk'),
            'on_calgary_insight': [f'{a[1]}: {a[2]}' for a in (((xw.get('service_areas') or {}).get('areas') or {}).get(c['service_area']) or [])]})
    else:
        o.update({'one_time_by_year_m': dict(zip(Y4, c['one_time_m'])), 'ongoing_added_by_year_m': dict(zip(Y4, c['ongoing_m'])),
                  'positions_by_year': dict(zip(Y4, c['ftes'])), 'city_risk_rating': c.get('risk'),
                  'measure_named_by_the_city': c.get('metric'), 'long_term_plan': c.get('plan'),
                  'city_note_under_the_table': bool(c.get('footnotes'))})
        if c.get('full_one_time_m') is not None:
            o['full_one_time_request_m'] = c['full_one_time_m']
            o['note'] = (f"The City's note under the table gives the full one-time amount as ${c['full_one_time_m']} million and says the "
                         f"2027-2030 budget includes only part of it; the table shows that part (${_r(_s(c['one_time_m']))} million). The rest may or will "
                         'be considered in later budget adjustments; see the page.')
        elif c.get('footnotes'):
            o['note'] = 'The City adds a note under this request\'s table that qualifies the figures (for example how the amount is shared among business units); it is on the page.'
    return o


def _dept(c, xw):
    d = (xw.get('departments') or {}).get(c['dept']) or {}
    return d.get('label') or d.get('open_data') or c['dept']


def _bu(c, xw):
    return ((xw.get('business_units') or {}).get(c['bu']) or {}).get('open_data') or c['bu']


def _group(cases, key):
    out = {}
    for c in cases:
        for k in ([key(c)] if not isinstance(key(c), (list, tuple)) else key(c)):
            g = out.setdefault(k, {'requests': 0, 'capital_requests': 0, 'operating_requests': 0, 'proposed_capital_m': 0.0,
                                   'one_time_m': 0.0, 'ongoing_added_by_year_m': [0.0] * 4, 'positions_2027': 0, 'positions_added_2027_2030': 0})
            g['requests'] += 1
            if c['type'] == 'capital':
                g['capital_requests'] += 1
                g['proposed_capital_m'] += _cap(c)
            else:
                g['operating_requests'] += 1
                g['one_time_m'] += _s(c['one_time_m'])
                g['ongoing_added_by_year_m'] = [a + (b or 0) for a, b in zip(g['ongoing_added_by_year_m'], c['ongoing_m'])]
                g['positions_2027'] += c['ftes'][0] or 0
                g['positions_added_2027_2030'] += _s(c['ftes'])
    rows = []
    for k, g in out.items():
        g['proposed_capital_m'] = _r(g['proposed_capital_m'])
        g['one_time_m'] = _r(g['one_time_m'])
        g['ongoing_added_by_year_m'] = dict(zip(Y4, [_r(v) for v in g['ongoing_added_by_year_m']]))
        rows.append({'name': k, **g})
    return sorted(rows, key=lambda r: -(r['proposed_capital_m'] + r['one_time_m'] + _s(r['ongoing_added_by_year_m'].values())))


def checks(d, data_dir=None):
    """The checks the Budget Intelligence screen runs: the cases themselves, and the capital cases against the City's
    open data (2027-2030 Budget, nnnm-9sfh) when the site's budget file is at hand."""
    C = d['cases']
    cap = [c for c in C if c['type'] == 'capital']
    out = [{'check': 'Every business case was read', 'result': 'pass' if sorted(c['n'] for c in C) == list(range(1, len(C) + 1)) else 'check',
            'detail': f"{len(C)} cases numbered 1 to {len(C)}: {len(C) - len(cap)} operating, {len(cap)} capital."},
           {'check': 'Each capital total equals the sum of its years', 'result': 'pass' if all(abs((c['cap_k'][0] or 0) - _s(c['cap_k'][1:])) <= 3 for c in cap) else 'check',
            'detail': 'Within $3,000 of rounding for every capital request.'}]
    part = [c for c in C if c.get('full_one_time_m') is not None]
    if part:
        out.append({'check': 'Some one-time requests are only partly in the proposed budget', 'result': 'to know',
                    'detail': f"{len(part)} requests: ${_r(_s(_s(c['one_time_m']) for c in part))} million in their tables, ${_r(_s(c['full_one_time_m'] for c in part))} million stated as the "
                              'full requests in the City\'s notes. One-time totals add the tables.',
                    'requests': [{'n': c['n'], 'title': c['title'], 'in_the_table_m': _r(_s(c['one_time_m'])), 'full_request_m': c['full_one_time_m']} for c in part]})
    b = _read('budget.json', data_dir)
    P = (b or {}).get('proposed')
    if P:
        xw = crosswalk(data_dir)
        od = [(P['totals'][y].get('capital') or {}).get('proposed') or 0 for y in Y4]
        bc = [_s(c['cap_k'][i] for c in cap) / 1000 for i in (1, 2, 3, 4)]
        worst = max(abs(x - y) / y * 100 for x, y in zip(bc, od) if y)
        out.append({'check': 'The capital requests add up to the City\'s open data', 'result': 'pass' if worst < 0.5 else 'check',
                    'detail': f"Largest yearly difference {worst:.2f}%.", 'by_year_m': {y: {'business_cases': _r(bc[i]), 'open_data_proposed': od[i], 'difference': _r(bc[i] - od[i])} for i, y in enumerate(Y4)},
                    'formula': 'sum of the cases\' amount for the year / 1,000 against open-data rows with fund = Capital and budget_status = Proposed',
                    'inputs': f"business-cases.json; {P.get('dataset')} read {P.get('fetched')}"})
        o, c2 = {}, {}
        for y in Y4:
            for dep in P['by_department'][y].get('capital', []):
                for u in dep.get('units', []):
                    if u.get('status') == 'proposed':
                        o[u['name']] = o.get(u['name'], 0) + u['value']
        for c in cap:
            c2[_bu(c, xw)] = c2.get(_bu(c, xw), 0) + _s(c['cap_k'][1:5]) / 1000
        names = sorted(set(o) | set(c2))
        off = [{'business_unit': n, 'business_cases_m': _r(c2.get(n, 0)), 'open_data_m': _r(o.get(n, 0)), 'difference_m': _r(c2.get(n, 0) - o.get(n, 0))}
               for n in names if abs(c2.get(n, 0) - o.get(n, 0)) > 1]
        oy = {}
        for i, y in enumerate(Y4):
            for dep in P['by_department'][y].get('capital', []):
                for u in dep.get('units', []):
                    if u.get('status') == 'proposed':
                        oy.setdefault(u['name'], [0, 0, 0, 0])[i] += u['value']
        for r in off:                                   # one request that equals the difference in every year, if there is one
            mine = [c for c in cap if _bu(c, xw) == r['business_unit']]
            dy = [_s(c['cap_k'][i + 1] for c in mine) / 1000 - oy.get(r['business_unit'], [0, 0, 0, 0])[i] for i in range(4)]
            hit = next((c for c in mine if _s(c['cap_k'][1:5]) > 0 and all(abs((c['cap_k'][i + 1] or 0) / 1000 - dy[i]) <= 0.2 for i in range(4))), None)
            if hit:
                r['one_request_equals_the_difference_each_year'] = {'n': hit['n'], 'title': hit['title'], 'amount_m': _r(_s(hit['cap_k'][1:5]) / 1000)}
        out.append({'check': 'The same, business unit by business unit', 'result': 'to know' if off else 'pass',
                    'detail': f"{len(names) - len(off)} of {len(names)} business units match within $1 million; the others net to {_r(sum(r['difference_m'] for r in off))} million, "
                              'which suggests the two City sources file some of the same projects under different business units (an inference; the City has published no mapping). '
                              'Where one request equals a unit\'s difference in every year (within $0.2 million) it is named.',
                    'differences': off})
        rows = {y: {'open_budget_fqax': b['totals'][y]['capital']['value'], 'budget_2027_2030_nnnm': P['totals'][y]['capital'].get('approved')}
                for y in Y4 if (b.get('totals') or {}).get(y, {}).get('capital') and P['totals'][y].get('capital', {}).get('approved') is not None}
        out.append({'check': 'Capital already approved for 2027 to 2030: two City datasets differ', 'result': 'to know', 'millions': rows,
                    'detail': 'Both are the City\'s own figures; neither is changed. The Budget Intelligence screen uses the 2027-2030 dataset for those years.'})
        tot = sum((P['totals'][y]['capital'].get('approved') or 0) + (P['totals'][y]['capital'].get('proposed') or 0) for y in Y4)
        out.append({'check': 'The City\'s headline for four-year capital against its open data', 'result': 'to know',
                    'detail': f"Headline ${((b.get('plan_2027') or {}).get('headline') or {}).get('capital_2027_2030_billion')} billion; open data for 2027 to 2030 adds to ${tot / 1000:.2f} billion "
                              '(approved in earlier budgets plus proposed). The published sources do not explain the difference.'})
        out.append({'check': 'Budget against actual spending', 'result': 'missing',
                    'detail': 'The open budget gives one figure per year and fund (approved or actual, never both), so no variance can be worked out.'})
    else:
        out.append({'check': 'Checks against the City\'s open data', 'result': 'not run', 'detail': 'The site\'s budget file is not at hand here; the Budget Intelligence screen runs them.'})
    return out


def summary(d, part=None, find=None, kind=None, ward=None, data_dir=None):
    """part: 'summary' (default), 'cases' (find, kind 'operating' or 'capital', ward 1 to 14 narrow the list), 'case' (find = the
    case number or words of its title), 'departments', 'priorities', 'service_areas', 'wards', 'checks' or 'sources'."""
    if not d:
        return {'error': 'The business cases are not available here.'}
    C, src, xw = d['cases'], d['source'], crosswalk(data_dir)
    cap = [c for c in C if c['type'] == 'capital']
    op = [c for c in C if c['type'] == 'operating']
    head = {'what': 'The business cases behind the City of Calgary\'s proposed 2027-2030 budget', 'status': d.get('status'), 'screen': PAGE,
            'document': {'title': src['title'], 'publisher': src['publisher'], 'url': src['url'], 'pages': src['pages'],
                         'last_changed_by_the_city': src.get('modified'), 'read': src.get('read')}}
    part = (part or 'summary').lower()
    if part == 'summary':
        purpose = [_s(c['cap_k'][0] * c['split'][i] / 100 for c in cap) / 1000 for i in range(4)]
        return {**head, 'counts': {'requests': len(C), 'operating': len(op), 'capital': len(cap)},
                'capital_m': {'total': _r(_s(_cap(c) for c in cap)), **{y: _r(_s(c['cap_k'][i + 1] for c in cap) / 1000) for i, y in enumerate(Y4)},
                              '2031_and_later': _r(_s(c['cap_k'][5] for c in cap) / 1000)},
                'operating_m': {'one_time_by_year': {y: _r(_s(c['one_time_m'][i] for c in op)) for i, y in enumerate(Y4)},
                                'ongoing_added_by_year': {y: _r(_s(c['ongoing_m'][i] for c in op)) for i, y in enumerate(Y4)}},
                'positions_by_year': {y: _s(c['ftes'][i] for c in op) for i, y in enumerate(Y4)},
                'one_time_requests_partly_in_the_budget': _partly(op),
                'capital_by_purpose_m': {p: _r(v) for p, v in zip(PURPOSES, purpose)},
                'capital_by_purpose_how': 'Each capital request\'s amount times the City\'s own percentage for each purpose, added up.',
                'by_council_priority': _group(C, lambda c: c['theme']),
                'largest_capital_requests': [_row(c, src) for c in sorted(cap, key=lambda c: -_cap(c))[:12]],
                'largest_operating_requests': [_row(c, src) for c in sorted(op, key=lambda c: -(_s(c['one_time_m']) + _s(c['ongoing_m'])))[:12]],
                'all_wards_capital_m': _r(_s(_cap(c) for c in cap if c['wards'] == 'all')), 'how': HOW,
                'parts': 'cases (find, kind, ward), case (find = number), departments, priorities, service_areas, wards, checks, sources'}
    if part in ('cases', 'case'):
        L = C
        if kind in ('operating', 'capital'):
            L = [c for c in L if c['type'] == kind]
        if ward not in (None, '', 0, '0'):
            try:
                w = int(ward)
                L = [c for c in L if isinstance(c.get('wards'), list) and w in c['wards']]
            except (TypeError, ValueError):
                pass
        f = str(find or '').strip()
        if part == 'case':
            m = re.fullmatch(r'#?(\d{1,3})', f)
            hit = [c for c in C if m and c['n'] == int(m.group(1))] or ([c for c in L if f.lower() in c['title'].lower()] if f else [])
            if not hit:
                return {**head, 'error': 'No request matches. Give the case number (1 to 384) in find, or words from its title; part="cases" lists them.'}
            return {**head, 'case': _full(hit[0], src, xw), 'other_matches': [{'n': c['n'], 'title': c['title']} for c in hit[1:8]], 'how': HOW}
        if f:
            words = [x for x in re.split(r'\s+', f.lower()) if x]
            hay = lambda c: ' '.join(str(c.get(k) or '') for k in ('title', 'dept', 'bu', 'theme', 'service_area', 'budget_id', 'rationale', 'stage', 'funding', 'metric')).lower() + ' ' + _dept(c, xw).lower()
            L = [c for c in L if all(x in hay(c) for x in words)]
        L = sorted(L, key=lambda c: -(_cap(c) + (_s(c['one_time_m']) + _s(c['ongoing_m']) if c['type'] == 'operating' else 0)))
        lc = [c for c in L if c['type'] == 'capital']
        lo = [c for c in L if c['type'] == 'operating']
        return {**head, 'matching': len(L), 'shown': min(len(L), 80), 'order': 'largest amount first',
                'totals_of_the_matching_requests': {'proposed_capital_m': _r(_s(_cap(c) for c in lc)), 'one_time_m': _r(_s(_s(c['one_time_m']) for c in lo)),
                                                    'positions_2027': _s(c['ftes'][0] for c in lo)},
                'cases': [_row(c, src) for c in L[:80]], 'how': HOW,
                'note': 'Up to 80 shown; narrow with find, kind or ward. part="case" with find = a number gives every figure of one request.'}
    if part == 'departments':
        return {**head, 'by_department': _group(C, lambda c: _dept(c, xw)), 'names': 'Departments as the City\'s document prints them, with spelling variants joined.', 'how': HOW}
    if part == 'priorities':
        return {**head, 'by_council_priority': _group(C, lambda c: c['theme']), 'how': HOW}
    if part == 'service_areas':
        areas = (xw.get('service_areas') or {}).get('areas') or {}
        return {**head, 'capital_by_service_area': [{**g, 'on_calgary_insight': [a[1] for a in areas.get(g['name']) or []]} for g in _group(cap, lambda c: c['service_area'])],
                'note': 'Only capital requests carry a service area in the City\'s document.', 'how': HOW}
    if part == 'wards':
        rows = []
        for w in range(1, 15):
            named = [c for c in cap if isinstance(c['wards'], list) and w in c['wards']]
            one = [c for c in named if len(c['wards']) == 1]
            rows.append({'ward': w, 'capital_requests_naming_it': len(named), 'of_which_name_only_this_ward': len(one), 'proposed_capital_of_those_m': _r(_s(_cap(c) for c in one)),
                         'requests': [{'n': c['n'], 'title': c['title'], 'wards': _wards(c), 'proposed_capital_m': _r(_cap(c))} for c in named]})
        allw = [c for c in cap if c['wards'] == 'all']
        return {**head, 'all_wards': {'requests': len(allw), 'proposed_capital_m': _r(_s(_cap(c) for c in allw))},
                'requests_naming_wards': {'requests': len(cap) - len(allw), 'proposed_capital_m': _r(_s(_cap(c) for c in cap if c['wards'] != 'all'))},
                'wards': rows, 'note': 'A request naming several wards is counted in each; its dollars are not divided. Operating requests name no ward.', 'how': HOW}
    if part == 'checks':
        return {**head, 'checks': checks(d, data_dir), 'how': HOW}
    if part == 'sources':
        return {**head, 'units': d.get('units'), 'read_by': 'tools/budget_intel_extract.py (pdftotext); every figure row read a second time with pypdf',
                'open_data': 'City of Calgary 2027-2030 Budget, https://data.calgary.ca/d/nnnm-9sfh (by business unit and year); open budget 2023-2026, https://data.calgary.ca/d/fqax-i3nz',
                'method': 'get_method topic budget_intelligence'}
    return {**head, 'error': 'part must be summary, cases, case, departments, priorities, service_areas, wards, checks or sources'}
