"""The City of Calgary's budget, live from its open data (Calgary Open Budget, fqax-i3nz).

The City publishes its approved budget and actual spending by department and business unit (service), for operating
spending (net of recoveries) and capital, year by year. It does not publish the budget by ward or community; the
screen says so, and lists the spending that can be placed in a ward: City projects and road projects with a stated
cost.
"""
import json
import os
import re
import time

import calgary_data as cd

DATASET = 'fqax-i3nz'
PAGE = 'https://data.calgary.ca/d/fqax-i3nz'
BUDGET_PAGE = 'https://www.calgary.ca/our-finances/budget.html'
KEEP_HOURS = 24


REVENUE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'budget_revenue.json')


def revenue():
    """Operating revenue by source, from the City's approved budget book (not in open data), kept with the app."""
    try:
        with open(REVENUE_FILE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


PROPOSED = 'nnnm-9sfh'                              # the proposed 2027-2030 budget, by department and service
PROPOSED_PAGE = 'https://data.calgary.ca/Government/2027-2030-Budget/nnnm-9sfh'
PLAN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'budget_2027.json')


def plan_2027():
    """The proposed 2027-2030 budget as the City presented it on Nov 10, 2026: the household impact, water rates,
    the tax path, investments and documents (calgary.ca/budget; kept with the app, updated as Council decides)."""
    try:
        with open(PLAN_FILE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def plan_summary(data_dir=None):
    """For Data Genie (get_dashboard section city_budget_2027): the proposed budget as the City presented it, and how
    to read the open data by department."""
    p = None
    for d in (data_dir, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')):
        f = os.path.join(d or '', 'budget_2027.json')
        if d and os.path.exists(f):
            with open(f, encoding='utf-8') as fh:
                p = json.load(fh)
            break
    if not p:
        return {'error': 'The proposed 2027-2030 budget is not available here.'}
    cum = 1.0
    for x in p['tax_path']['pct']:
        cum *= 1 + x / 100
    return dict(p, tax_revenue_2030_vs_2026_pct=round((cum - 1) * 100, 1),
                how=('Proposed, not approved: describe it, never rate it or a councillor. The household figures are the City\'s own '
                     '(a typical home at the median assessment). 2028-2030 tax increases are as reported in the news; say so. '
                     'For spending by department and service, year by year, query open data ' + PROPOSED + ' (fields '
                     'budget_department, department, bu, year, budget_status Proposed/Approved, fund, budget_millions) and give '
                     'the comparability note when comparing with 2023-2026 (fqax-i3nz).'))


def proposed(cache_dir, force=False):
    """The proposed 2027-2030 budget from open data (nnnm-9sfh): operating net of recoveries and capital, by
    department and service, each line marked Proposed or Approved (capital Council approved in earlier budgets)."""
    path = os.path.join(cache_dir, 'budget_proposed.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_HOURS * 3600:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        rows = cd.query(PROPOSED, select='budget_department,department,bu,year,budget_status,fund,budget_millions', limit=10000)
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        return None
    out = summarise_proposed(rows)
    out['fetched'] = time.strftime('%Y-%m-%d %H:%M')
    os.makedirs(cache_dir, exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(out, f)
    os.replace(path + '.tmp', path)
    return out


def summarise_proposed(rows):
    """{'years', 'totals': {year: {'operating': {'proposed'}, 'capital': {'proposed', 'approved'}}},
    'by_department': {year: {kind: [{name, value, proposed, approved, units: [{name, value, status}]}]}}}."""
    totals, depts = {}, {}
    for r in rows:
        y = str(int(_num(r.get('year'))))
        if not 2027 <= int(y) <= 2030:
            continue
        k, v, st = kind(r.get('fund')), _num(r.get('budget_millions')), (r.get('budget_status') or 'Proposed').lower()
        t = totals.setdefault(y, {}).setdefault(k, {})
        t[st] = round(t.get(st, 0.0) + v, 3)
        d = depts.setdefault(y, {}).setdefault(k, {}).setdefault(r.get('budget_department') or 'Other', {})
        u = d.setdefault((r.get('bu') or r.get('department') or 'Other', st), 0.0)
        d[(r.get('bu') or r.get('department') or 'Other', st)] = u + v
    by_dep = {}
    for y, ks in depts.items():
        for k, ds in ks.items():
            lst = []
            for dn, us in ds.items():
                units = sorted(({'name': n, 'status': s, 'value': round(v, 3)} for (n, s), v in us.items()), key=lambda x: -x['value'])
                lst.append({'name': dn, 'value': round(sum(us.values()), 3),
                            'proposed': round(sum(v for (n, s), v in us.items() if s == 'proposed'), 3),
                            'approved': round(sum(v for (n, s), v in us.items() if s == 'approved'), 3), 'units': units})
            by_dep.setdefault(y, {})[k] = sorted(lst, key=lambda x: -x['value'])
    return {'years': sorted(totals), 'totals': totals, 'by_department': by_dep, 'dataset': PROPOSED, 'page': PROPOSED_PAGE,
            'unit': 'millions of dollars',
            'note': ('Proposed, not approved: the budget Council will debate from November 23, 2026. Operating is net of '
                     'recoveries. Capital lines marked Approved were approved in earlier budgets; Proposed lines are new.')}


def load(cache_dir, force=False):
    """Every row of the open budget (a few hundred), kept for a day, with revenue by source and the proposed
    2027-2030 budget."""
    data = _load(cache_dir, force)
    try:
        prop = proposed(cache_dir, force)
    except Exception:
        prop = None
    return dict(data, revenue=revenue(), proposed=prop, plan_2027=plan_2027())


def _load(cache_dir, force=False):
    path = os.path.join(cache_dir, 'budget.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_HOURS * 3600:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        rows = cd.query(DATASET, select='budget_department,level_2,business_unit,year,budget_status,fund,budget', limit=5000)
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    data = summarise(rows)
    data['fetched'] = time.strftime('%Y-%m-%d %H:%M')
    os.makedirs(cache_dir, exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(path + '.tmp', path)
    return data


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def kind(fund):
    return 'capital' if 'capital' in (fund or '').lower() else 'operating'


def summarise(rows):
    """{'years': [...], 'totals': {year: {'operating': {'value', 'status'}, 'capital': {...}}},
    'by_department': {year: {kind: [{name, value, units: [{name, value}]}]}}} (millions of dollars)."""
    totals, depts = {}, {}
    for r in rows:
        y, k, v = str(int(_num(r.get('year')))), kind(r.get('fund')), _num(r.get('budget'))
        t = totals.setdefault(y, {}).setdefault(k, {'value': 0.0, 'status': r.get('budget_status')})
        t['value'] += v
        d = depts.setdefault(y, {}).setdefault(k, {}).setdefault(r.get('budget_department') or 'Other', {})
        unit = r.get('business_unit') or r.get('level_2') or 'Other'
        d[unit] = d.get(unit, 0.0) + v
    by_dep = {y: {k: sorted(({'name': dn, 'value': round(sum(us.values()), 3),
                              'units': sorted(({'name': un, 'value': round(uv, 3)} for un, uv in us.items()), key=lambda x: -x['value'])}
                             for dn, us in ks.items()), key=lambda x: -x['value']) for k, ks in v.items()} for y, v in depts.items()}
    for y in totals:
        for k in totals[y]:
            totals[y][k]['value'] = round(totals[y][k]['value'], 3)
    return {'years': sorted(totals), 'totals': totals, 'by_department': by_dep, 'dataset': DATASET, 'page': PAGE,
            'budget_page': BUDGET_PAGE, 'unit': 'millions of dollars',
            'note': ('Operating spending is net of recoveries; capital is the capital budget for the year. "Approved" '
                     'years are the budget Council approved (updated each November); "Actual" years are what was spent. '
                     'The City publishes its budget by department and service, not by ward or community.')}


MONEY = re.compile(r'\$\s*([\d.,]+)\s*(billion|million|thousand|[bmk])?', re.I)


def dollars(text):
    """'$12.5 million' -> 12500000.0; the largest amount named in a text; None when there is none."""
    best = None
    for m in MONEY.finditer(text or ''):
        n = _num(m.group(1).replace(',', ''))
        unit = (m.group(2) or '').lower()
        n *= {'billion': 1e9, 'b': 1e9, 'million': 1e6, 'm': 1e6, 'thousand': 1e3, 'k': 1e3}.get(unit, 1)
        best = max(best or 0, n)
    return best
