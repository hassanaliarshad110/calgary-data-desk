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


def load(cache_dir, force=False):
    """Every row of the open budget (a few hundred), kept for a day, with revenue by source."""
    data = _load(cache_dir, force)
    return dict(data, revenue=revenue())


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
