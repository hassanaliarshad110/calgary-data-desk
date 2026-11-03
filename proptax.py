"""Property tax billed in each community and ward: an estimate, from the City's assessment roll and the tax bylaw.

The City does not publish property tax by ward or community. Every property's assessed value is open data (Current
Year Property Assessments, 4bsw-nn7w), and the tax rates and the total each class raises are in the year's Property
Tax Bylaw (data/tax_rates.json). The estimate:
  1. adds up assessed values in each community by class: residential, non-residential and farm land;
  2. leaves out non-residential property in public and institutional uses that pay no property tax (sub-property use
     codes S: hospitals, schools, universities, places of worship, utilities, police and fire stations, airport
     facilities; and P: parks, reserves, libraries, arenas, pools, museums);
  3. scales what is left, class by class, so Calgary's total matches the bylaw's taxable assessment (exemptions the
     roll does not show are spread evenly);
  4. multiplies by the bylaw's municipal and education (provincial) rates.
So every community's figure is an estimate of tax billed (the levy), not of tax collected, and Calgary's total equals
the bylaw's levy exactly. Other City revenue (user fees, franchise fees, grants, investment income) has no location
and is not split by ward.
"""
import json
import os
import time

import calgary_data as cd

DATASET = '4bsw-nn7w'
HERE = os.path.dirname(os.path.abspath(__file__))
RATES_FILE = os.path.join(HERE, 'data', 'tax_rates.json')
EXEMPT_PREFIXES = ('S', 'P')
KEEP_DAYS = 7
CLASSES = ('residential', 'non_residential', 'farm_land')


def rates(year=None):
    with open(RATES_FILE, encoding='utf-8') as f:
        all_ = json.load(f)
    y = str(year) if year and str(year) in all_ else max(all_)
    return y, all_[y]


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def fetch():
    rows = cd.query(DATASET, select='comm_code,sub_property_use,sum(re_assessed_value) as re,'
                                    'sum(nr_assessed_value) as nr,sum(fl_assessed_value) as fl,count(*) as n',
                    group='comm_code,sub_property_use', limit=50000)
    year = cd.query(DATASET, select='max(roll_year) as y', limit=1)
    return rows, int(_num((year or [{}])[0].get('y'))) or None


def estimate(rows, roll_year=None):
    """{'year', 'by_comm': {code: {...}}, 'city': {...}, 'factors', 'rates', 'bylaw', 'source', 'method'}"""
    year, r = rates(roll_year)
    by = {}
    for row in rows:
        c = row.get('comm_code') or '?'
        exempt_nr = (row.get('sub_property_use') or '').startswith(EXEMPT_PREFIXES)
        d = by.setdefault(c, {'residential': 0.0, 'non_residential': 0.0, 'farm_land': 0.0, 'exempt_nr': 0.0, 'accounts': 0})
        d['residential'] += _num(row.get('re'))
        d['farm_land'] += _num(row.get('fl'))
        d['exempt_nr' if exempt_nr else 'non_residential'] += _num(row.get('nr'))
        d['accounts'] += int(_num(row.get('n')))
    tot = {k: sum(d[k] for d in by.values()) for k in CLASSES}
    factors = {kind: {k: (r['taxable_assessment'][kind][k] / tot[k] if tot[k] else 0) for k in CLASSES}
               for kind in ('municipal', 'education')}
    out = {}
    for c, d in by.items():
        e = {'accounts': d['accounts'], 'assessed': {k: round(d[k]) for k in CLASSES}, 'exempt_non_residential': round(d['exempt_nr'])}
        for kind in ('municipal', 'education'):
            parts = {k: d[k] * factors[kind][k] * r['rates'][kind][k] for k in CLASSES}
            e[kind] = {**{k: round(v) for k, v in parts.items()}, 'total': round(sum(parts.values()))}
        e['total'] = e['municipal']['total'] + e['education']['total']
        out[c] = e
    city = {kind: {k: round(sum(v[kind][k] for v in out.values())) for k in (*CLASSES, 'total')} for kind in ('municipal', 'education')}
    city['total'] = city['municipal']['total'] + city['education']['total']
    return {'year': int(year), 'roll_year': roll_year, 'by_comm': out, 'city': city,
            'factors': {kind: {k: round(v, 4) for k, v in f.items()} for kind, f in factors.items()}, 'rates': r['rates'], 'levy': r['levy'],
            'bylaw': r['bylaw'], 'source': r['source'], 'dataset': DATASET}


def load(cache_dir, force=False):
    path = os.path.join(cache_dir, 'property_tax.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        rows, roll_year = fetch()
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    data = estimate(rows, roll_year)
    data['fetched'] = time.strftime('%Y-%m-%d %H:%M')
    os.makedirs(cache_dir, exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(path + '.tmp', path)
    return data


def by_ward(data, ward_table):
    """Each ward's estimate from its communities (ward_table: wards.load() output)."""
    comms = (ward_table or {}).get('communities') or {}
    w = {}
    for code, e in (data or {}).get('by_comm', {}).items():
        n = (comms.get(code) or {}).get('ward')
        if not n:
            continue
        a = w.setdefault(int(n), {'municipal': 0, 'education': 0, 'total': 0, 'residential': 0, 'non_residential': 0, 'communities': 0})
        a['municipal'] += e['municipal']['total']
        a['education'] += e['education']['total']
        a['total'] += e['total']
        a['residential'] += e['municipal']['residential'] + e['education']['residential']
        a['non_residential'] += e['municipal']['non_residential'] + e['education']['non_residential']
        a['communities'] += 1
    return w
