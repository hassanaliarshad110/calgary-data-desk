"""Infrastructure condition: where Calgary's roads and pipes are wearing out, and whether 311 complaints about them are
rising in the same places.

The City does not publish a condition score for each road or pipe as open data, so this works from what it does publish:
  - water main breaks (open data dpcu-jr23): every break since records began, placed in its community;
  - water mains (open data w6h9-w33i): every main's install year, material and length, so the age of each community's
    network and how much of it is cast iron (the material that breaks most);
  - the pavement rehabilitation plan (the City's road map service): roads repaved in the last two years, this year's
    paving, next year's, and the tentative five-year plan;
  - 311 service requests (iahh-g8bj) about roads, sidewalks, streetlights and water: the last 12 months against the 12
    before, by community;
  - the City's own condition figures, which are not open data and are kept with Calgary Insight (CITY_CONTEXT), with
    their sources.
The website build writes data/infra.json; the Infrastructure page works it out by community, ward or all of Calgary.

    python infra.py OUT.json
"""
import datetime as dt
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

import calgary_data as cd
import geo

COMMUNITIES = 'surr-xmvs'
BREAKS = 'dpcu-jr23'
MAINS = 'w6h9-w33i'
SERVICE_REQUESTS = 'iahh-g8bj'
GIS = 'https://gis.calgary.ca/arcgis/rest/services/pub_Roads/PavementRehabPlan/MapServer'
PAVING_LAYERS = {0: 'recent', 1: 'this_year', 2: 'next_year', 3: 'five_year'}

# 311 request types about the condition of what the City owns, grouped
REQUESTS = {
    'roads': ('Roads and potholes', ['Roads - Pothole Maintenance', 'Roads - Roadway Maintenance', 'Roads - Backlane Maintenance']),
    'sidewalks': ('Sidewalks, curbs and pathways', ['Roads - Sidewalk - Curb and Gutter Repair', 'Roads - Pathway Concerns']),
    'lights': ('Streetlights and signals', ['Roads - Streetlight Maintenance', 'Roads - Traffic or Pedestrian Light Repair']),
    'water': ('Water mains and valves', ['WATS - Water Main Break or Leak', 'WATS - Service and Main Valve Issues']),
    'sewer': ('Sewers and catch basins', ['WATS - Sewage Back-up', 'WATS - Sewer Maintenance', 'WATS - Catch Basin Concerns']),
}

# The City's own condition figures (not open data), with their sources. Checked November 6, 2026.
CITY_CONTEXT = {
    'pavement': {'good': 38, 'fair': 35, 'poor': 27, 'as_of': 'end of the 2025 construction season',
                 'canada_good': 61, 'decline': 'about 1% of the network a year at current funding',
                 'targets': {'Arterial': 60, 'Collector': 54, 'Local': 42}, 'scale': 'Pavement Quality Index (PQI), 0 to 10: good 6 to 10, fair 4 to 6, poor 0 to 4',
                 'inspected': 'major roads every two years, local roads every four years',
                 'source': {'title': 'Pavement quality', 'publisher': 'City of Calgary', 'url': 'https://www.calgary.ca/roads/maintenance/pavement-quality.html'}},
    'overall_poor': {'pct': 11, 'what': 'of the City\'s infrastructure is in poor or very poor condition (water, IT, fleet, buildings, bridges and roads)',
                     'source': {'title': '2025 Year-End Principal Corporate Risk Report (reported January 2026)', 'publisher': 'City of Calgary, via LiveWire Calgary',
                                'url': 'https://livewirecalgary.com/2026/01/18/calgary-capital-infrastructure-almost-certain-risk-extensive-failure-severe-impact'}},
    'critical': {'source': {'title': 'Breakdown of Critical Assets in Poor and Very Poor Condition (IP2026-0102, Attachment 1)', 'publisher': 'City of Calgary',
                            'url': 'https://livewirecalgary.com/wp-content/uploads/2026/02/Attach-1-Breakdown-of-Critical-Assets-in-Poor-and-Very-Poor-Condition-IP2026-0102.pdf'},
                 'rows': [
                     ['Water transmission mains', 'Severe', 'About 120 km (about 25% of the network) without redundancy or recent condition data', '$1.2 billion over 10 years'],
                     ['Water treatment plants', 'Severe', 'Single points of failure without recent condition data', '$590 million over 10 years'],
                     ['Wastewater river crossings', 'Severe', '9 large crossings of unknown condition', '$400 million over 10 years'],
                     ['Stormwater dams', 'Severe', 'Discovery Ridge dam below the required safety factor', '$44 million over 10 years'],
                     ['Pavements', 'High', 'About $100 million needed in 2026 against a $90 million budget', 'About $140 million a year from 2027'],
                     ['Streetlights', 'High', 'About 10,000 steel poles still to replace', '$5 million in 2026'],
                     ['Bridges', 'High', 'Macleod Tr / 63 Av pedestrian bridge, Cushing Bridge, MacDonald Bridge, 9 Ave SW pedestrian bridge', '$10 to $70 million each, 2027 to 2035'],
                     ['Facilities', 'High', '7% of buildings and 12% of components in poor or very poor condition', 'To be set'],
                     ['Plus 15 network', 'High', '8% rated poor or very poor (2020-21 inspections)', '$4 million a year'],
                 ]},
}
CAST_IRON = ('CI', 'CAST IRON', 'CAST_IRON', 'CIP')


def _get(url, timeout=180):
    req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryInsight/1.0 (civic data dashboard)'})
    for i in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception:                       # noqa: BLE001 - the GIS server is slow at times: try again
            if i == 2:
                raise
            time.sleep(10)


def _pages(dataset, select, where=None, size=50000):
    off = 0
    while True:
        rows = cd.get_json(cd.soql_url(dataset, select=select, where=where, order=':id', limit=size, offset=off), timeout=300)
        yield from rows
        if len(rows) < size:
            return
        off += size


def _year(v):
    try:
        return int(str(v)[:4])
    except (TypeError, ValueError):
        return None


def breaks(loc, today):
    """Water main breaks by community and year."""
    out = {}
    for r in _pages(BREAKS, 'break_date,break_type,status,point'):
        y = _year(r.get('break_date'))
        pt = (r.get('point') or {}).get('coordinates')
        if not y or not pt:
            continue
        c = loc.find(pt[0], pt[1])
        if not c:
            continue
        d = out.setdefault(c, {'years': {}, 'n12': 0, 'nprev': 0})
        d['years'][y] = d['years'].get(y, 0) + 1
        day = str(r.get('break_date'))[:10]
        if day >= (today - dt.timedelta(days=365)).isoformat():
            d['n12'] += 1
        elif day >= (today - dt.timedelta(days=730)).isoformat():
            d['nprev'] += 1
    return out


def mains(loc, today):
    """Water mains by community: length, median install year (by length), length over 50 years old, cast iron."""
    acc = {}
    for r in _pages(MAINS, 'year,material,length,status_ind,multilinestring', size=20000):
        g = r.get('multilinestring') or {}
        coords = g.get('coordinates') or []
        try:
            p = coords[0][len(coords[0]) // 2]
        except (IndexError, TypeError):
            continue
        c = loc.find(p[0], p[1])
        if not c:
            continue
        try:
            ln = float(r.get('length') or 0)
        except ValueError:
            ln = 0.0
        y = _year(r.get('year'))
        m = (r.get('material') or '').strip().upper()
        acc.setdefault(c, []).append((y, ln, m))
    out = {}
    for c, xs in acc.items():
        tot = sum(ln for _, ln, _ in xs) or 1.0
        aged = sorted((y, ln) for y, ln, _ in xs if y)
        half, run, med = sum(ln for _, ln in aged) / 2, 0.0, None
        for y, ln in aged:
            run += ln
            if run >= half:
                med = y
                break
        out[c] = {'km': round(tot / 1000, 1), 'median_year': med,
                  'old_km': round(sum(ln for y, ln, _ in xs if y and today.year - y >= 50) / 1000, 1),
                  'cast_iron_km': round(sum(ln for _, ln, m in xs if m in CAST_IRON or m.startswith('CAST')) / 1000, 1),
                  'materials': {k: round(v / 1000, 1) for k, v in _sum_by(xs).items()}}
    return out


def _sum_by(xs):
    d = {}
    for _, ln, m in xs:
        d[m or 'UNKNOWN'] = d.get(m or 'UNKNOWN', 0) + ln
    return dict(sorted(d.items(), key=lambda kv: -kv[1])[:6])


def paving(names_to_code):
    """The City's pavement rehabilitation plan by community: length (km) and the projects."""
    out, projects = {}, []
    for lid, key in PAVING_LAYERS.items():
        off = 0
        while True:
            q = urllib.parse.urlencode({'where': '1=1', 'outFields': 'COMMUNITY,WARD,ON_FULL_STREET_NAME,FROM_FULL_STREET_NAME,TO_FULL_STREET_NAME,PROJECT_LENGTH,PROJECT_TYPE,STATUS,CTP_CLASS',
                                        'returnGeometry': 'false', 'resultOffset': off, 'resultRecordCount': 1000, 'f': 'json'})
            d = _get(f'{GIS}/{lid}/query?{q}')
            feats = d.get('features') or []
            for f in feats:
                a = f.get('attributes') or {}
                c = names_to_code.get((a.get('COMMUNITY') or '').strip().upper())
                ln = float(a.get('PROJECT_LENGTH') or 0) / 1000
                if c:
                    o = out.setdefault(c, {})
                    o[key] = round(o.get(key, 0) + ln, 2)
                if key != 'recent':
                    projects.append([key, c, a.get('ON_FULL_STREET_NAME'), a.get('FROM_FULL_STREET_NAME'), a.get('TO_FULL_STREET_NAME'),
                                     round(ln, 2), a.get('PROJECT_TYPE'), a.get('CTP_CLASS'), a.get('WARD')])
            if not d.get('exceededTransferLimit') or not feats:
                break
            off += len(feats)
    return out, projects


def requests_311(today):
    """311 requests about infrastructure by community: last 12 months, the 12 before, and Calgary by year."""
    s, cs = (today - dt.timedelta(days=365)).isoformat(), (today - dt.timedelta(days=730)).isoformat()
    names = [n for _, ns in REQUESTS.values() for n in ns]
    inn = 'service_name in(' + ','.join("'" + n.replace("'", "''") + "'" for n in names) + ')'
    rows = cd.query(SERVICE_REQUESTS, select=(f"comm_code,service_name,sum(case(requested_date>='{s}',1,true,0)) as n12,"
                                              f"sum(case(requested_date>='{cs}' and requested_date<'{s}',1,true,0)) as nprev"),
                    where=f"{inn} AND requested_date>='{cs}' AND comm_code IS NOT NULL", group='comm_code,service_name', limit=50000)
    group = {n: k for k, (_, ns) in REQUESTS.items() for n in ns}
    out = {}
    for r in rows:
        k = group.get(r.get('service_name'))
        if not k:
            continue
        o = out.setdefault(r['comm_code'], {}).setdefault(k, [0, 0])
        o[0] += int(r.get('n12') or 0)
        o[1] += int(r.get('nprev') or 0)
    yrs = cd.query(SERVICE_REQUESTS, select='date_extract_y(requested_date) as y,service_name,count(*) as n',
                   where=f"{inn} AND requested_date>='{today.year - 6}-01-01'", group='y,service_name', limit=5000)
    by_year = {}
    for r in yrs:
        k = group.get(r.get('service_name'))
        if k and r.get('y'):
            by_year.setdefault(k, {})[int(r['y'])] = by_year.get(k, {}).get(int(r['y']), 0) + int(r['n'])
    return out, by_year


def build(today=None):
    today = today or dt.date.today()
    shapes = cd.query(COMMUNITIES, select='comm_code,name,multipolygon', limit=5000)
    polys = {r['comm_code']: r['multipolygon'] for r in shapes if r.get('comm_code') and r.get('multipolygon')}
    names = {r['comm_code']: (r.get('name') or '').title() for r in shapes if r.get('comm_code')}
    loc = geo.Locator(polys)
    errors, parts = {}, {}
    for key, fn in (('breaks', lambda: breaks(loc, today)), ('mains', lambda: mains(loc, today)),
                    ('paving', lambda: paving({v.upper(): k for k, v in names.items()})), ('requests', lambda: requests_311(today))):
        try:
            parts[key] = fn()
        except Exception as e:              # noqa: BLE001 - one source down leaves the others standing
            errors[key] = str(e)[:200]
            parts[key] = None
    br = parts['breaks'] or {}
    mn = parts['mains'] or {}
    pv, projects = parts['paving'] or ({}, [])
    rq, rq_years = parts['requests'] or ({}, {})
    by_comm = {}
    for c in set(br) | set(mn) | set(pv) | set(rq):
        by_comm[c] = {'breaks': br.get(c), 'mains': mn.get(c), 'paving': pv.get(c), 'req': rq.get(c)}
    city_breaks = {}
    for d in br.values():
        for y, n in d['years'].items():
            city_breaks[y] = city_breaks.get(y, 0) + n
    return {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'today': today.isoformat(),
            'names': names, 'by_comm': by_comm, 'projects': projects,
            'city': {'breaks_by_year': dict(sorted(city_breaks.items())), 'requests_by_year': rq_years,
                     'breaks_n12': sum(d['n12'] for d in br.values()), 'breaks_nprev': sum(d['nprev'] for d in br.values()),
                     'mains_km': round(sum(d['km'] for d in mn.values()), 1), 'old_km': round(sum(d['old_km'] for d in mn.values()), 1),
                     'cast_iron_km': round(sum(d['cast_iron_km'] for d in mn.values()), 1)},
            'requests': {k: {'label': lab, 'types': ns} for k, (lab, ns) in REQUESTS.items()},
            'context': CITY_CONTEXT, 'errors': errors,
            'sources': [{'title': 'Water main breaks', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + BREAKS},
                        {'title': 'Public water mains', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + MAINS},
                        {'title': 'Pavement rehabilitation plan (map service)', 'publisher': 'City of Calgary', 'url': GIS},
                        {'title': '311 service requests', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + SERVICE_REQUESTS},
                        CITY_CONTEXT['pavement']['source'], CITY_CONTEXT['overall_poor']['source'], CITY_CONTEXT['critical']['source']]}


def load(data_dir=None):
    for p in [os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'infra.json'),
              os.path.join(data_dir, 'infra.json') if data_dir else None]:
        if p and os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    return None


if __name__ == '__main__':
    d = build()
    with open(sys.argv[1] if len(sys.argv) > 1 else 'infra.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    print('communities', len(d['by_comm']), 'errors', d['errors'], 'city', d['city'])
