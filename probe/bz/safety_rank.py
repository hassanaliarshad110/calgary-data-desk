"""Canada's safest cities by Statistics Canada's Crime Severity Index (CSI), with Calgary picked out.

The CSI weighs every police-reported crime by how serious it is (from the sentences courts give), per person, set to
100 for Canada in 2006: a lower index means less serious crime per resident, so the safest cities are the lowest.
Statistics Canada publishes it every July for the year before, for every police service.

Cities: municipal police services (a city's own police or the RCMP under contract to the city) serving 10,000 people
or more, as Maclean's and others rank them. Population: Statistics Canada's Police Administration Survey (35-10-0077).
Rank 1 = the lowest CSI. Last year's rank is worked out the same way from last year's figures.

    python safety_rank.py OUT.json        (the website build writes data/safety_rank.json)
"""
import csv
import io
import json
import os
import re
import sys
import time
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))

WDS = 'https://www150.statcan.gc.ca/t1/wds/rest/'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; CalgaryDataDesk/1.0; civic data dashboard)'}
CMA_TABLE = 35100026
POLICE_TABLES = [35100186, 35100187, 35100188, 35100189, 35100061, 35100190, 35100063, 35100064]
POP_TABLE = 35100077
MIN_POP = 10_000
METHOD = 2                  # 2: population from the last three years of the Police Administration Survey only
POP_YEARS = 3
PAGES = {t: f'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid={t}01' for t in [CMA_TABLE, POP_TABLE] + POLICE_TABLES}
PROVS = {'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE', 'Nova Scotia': 'NS', 'New Brunswick': 'NB',
         'Quebec': 'QC', 'Ontario': 'ON', 'Manitoba': 'MB', 'Saskatchewan': 'SK', 'Alberta': 'AB',
         'British Columbia': 'BC', 'Yukon': 'YT', 'Northwest Territories': 'NT', 'Nunavut': 'NU'}
STATS = {'Crime severity index': 'csi', 'Violent crime severity index': 'violent', 'Non-violent crime severity index': 'nonviolent',
         'Percent change in crime severity index': 'change_pct', 'Weighted clearance rate': 'cleared'}


def _get(url, data=None):
    h = dict(UA)
    if data is not None:
        h['Content-Type'] = 'application/json'
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h), timeout=600) as r:
        return r.read()


def release_times():
    """When Statistics Canada last released each table (to skip downloads when nothing changed)."""
    meta = json.loads(_get(WDS + 'getCubeMetadata', json.dumps([{'productId': t} for t in [CMA_TABLE, POP_TABLE] + POLICE_TABLES]).encode()))
    return {str(m['object']['productId']): m['object'].get('releaseTime') for m in meta if m.get('status') == 'SUCCESS'}


def table(pid, keep):
    """The rows of a full table whose Statistics column is in keep: [(year, geo, dguid, stat, value or None)]."""
    url = json.loads(_get(f'{WDS}getFullTableDownloadCSV/{pid}/en'))['object']
    z = zipfile.ZipFile(io.BytesIO(_get(url)))
    name = next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
    out = []
    with z.open(name) as f:
        for r in csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig')):
            if r.get('Statistics') in keep:
                v = r.get('VALUE')
                try:
                    v = float(v) if v not in ('', None) else None
                except ValueError:
                    v = None
                out.append((r['REF_DATE'], r['GEO'], r['DGUID'], r['Statistics'], v))
    return out


def parse_geo(geo):
    """'Calgary, Alberta, municipal [48014]' -> ('Calgary', 'Alberta', 'municipal')."""
    g = re.sub(r'\s*\[\d+\]\s*$', '', geo or '')
    parts = [p.strip() for p in g.split(',')]
    for i in range(1, len(parts)):
        if parts[i] in PROVS:
            return ', '.join(parts[:i]), parts[i], ', '.join(parts[i + 1:])
    return g, None, ''


def _rank(rows, key):
    rows = sorted(rows, key=lambda r: (r[key], r['name']))
    return {r['id']: i + 1 for i, r in enumerate(rows)}


def build_from(police_rows, pop_rows, cma_rows, release=None):
    yrs = sorted({y for y, *_ in police_rows if y.isdigit()})
    year, prev = yrs[-1], (yrs[-2] if len(yrs) > 1 else None)
    pops = {}                                          # dguid -> {year: population}
    for y, geo, dg, st, v in pop_rows:
        if st == 'Population' and v:
            pops.setdefault(dg, {})[y] = v

    def pop_for(dg, y):
        # the police service's population in the Police Administration Survey, the latest year up to y and no more than
        # POP_YEARS before it: a service the survey no longer lists on its own (many rural contracts) is left out
        p = pops.get(dg) or {}
        ys = sorted(k for k in p if str(int(y) - POP_YEARS) < k <= y)
        return p[ys[-1]] if ys else None

    serv = {}
    for y, geo, dg, st, v in police_rows:
        name, prov, kind = parse_geo(geo)
        if not prov or not kind.endswith('municipal'):
            continue
        s = serv.setdefault(dg, {'id': dg, 'name': name, 'province': prov, 'prov': PROVS[prov],
                                 'police': 'RCMP' if 'Royal Canadian Mounted Police' in kind else 'Municipal police', 'by': {}})
        s['by'].setdefault(y, {})[STATS[st]] = v

    def universe(y):
        rows = []
        for s in serv.values():
            f = s['by'].get(y) or {}
            p = pop_for(s['id'], y)
            if f.get('csi') is not None and p and p >= MIN_POP:
                rows.append({'id': s['id'], 'name': s['name'], 'csi': f['csi'], 'pop': p})
        return rows

    now_u, prev_u = universe(year), universe(prev) if prev else []
    rank_now, rank_prev = _rank(now_u, 'csi'), _rank(prev_u, 'csi')
    cities = []
    for r in now_u:
        s, f = serv[r['id']], serv[r['id']]['by'][year]
        g = s['by'].get(prev) or {}
        cities.append({'name': s['name'], 'province': s['province'], 'prov': s['prov'], 'police': s['police'],
                       'population': round(r['pop']), 'csi': f.get('csi'), 'violent': f.get('violent'),
                       'nonviolent': f.get('nonviolent'), 'cleared': f.get('cleared'), 'change_pct': f.get('change_pct'),
                       'csi_prev': g.get('csi'), 'violent_prev': g.get('violent'),
                       'rank': rank_now[r['id']], 'rank_prev': rank_prev.get(r['id'])})
    cities.sort(key=lambda c: c['rank'])
    n = len(cities)
    large = [c for c in cities if c['population'] >= 100_000]
    for i, c in enumerate(large):
        c['rank_large'] = i + 1
    large_prev = sorted([c for c in cities if c['csi_prev'] is not None and c['population'] >= 100_000], key=lambda c: c['csi_prev'])
    for i, c in enumerate(large_prev):
        c['rank_large_prev'] = i + 1

    # census metropolitan areas (Calgary and its region)
    cm = {}
    for y, geo, dg, st, v in cma_rows:
        if dg[4:9] != 'A0035' or ' part ' in geo:      # census metropolitan areas (Ottawa-Gatineau once, not its parts)
            continue
        cm.setdefault(dg, {'name': re.sub(r'\s*\[[\d/]+\]\s*$', '', geo), 'by': {}})['by'].setdefault(y, {})[STATS[st]] = v
    cmas = [{'name': c['name'], 'csi': (c['by'].get(year) or {}).get('csi'), 'violent': (c['by'].get(year) or {}).get('violent'),
             'csi_prev': (c['by'].get(prev) or {}).get('csi')} for c in cm.values() if (c['by'].get(year) or {}).get('csi') is not None]
    cmas.sort(key=lambda c: c['csi'])
    prev_order = sorted([c for c in cmas if c['csi_prev'] is not None], key=lambda c: c['csi_prev'])
    for i, c in enumerate(cmas):
        c['rank'] = i + 1
    for i, c in enumerate(prev_order):
        c['rank_prev'] = i + 1

    cal = next((c for c in cities if c['name'] == 'Calgary' and c['prov'] == 'AB'), None)
    cal_cma = next((c for c in cmas if c['name'].startswith('Calgary')), None)
    return {'year': int(year), 'prev_year': int(prev) if prev else None, 'release': release, 'method': METHOD,
            'cities_ranked': n, 'cities_ranked_prev': len(prev_u), 'min_population': MIN_POP, 'large_ranked': len(large),
            'top50': cities[:50], 'cities': cities, 'calgary': cal, 'calgary_cma': cal_cma, 'cmas': cmas,
            'canada': next((v for y, geo, dg, st, v in cma_rows if y == year and geo.startswith('Canada') and st == 'Crime severity index'), None),
            'canada_prev': next((v for y, geo, dg, st, v in cma_rows if y == prev and geo.startswith('Canada') and st == 'Crime severity index'), None),
            'sources': [{'title': 'Crime severity index and weighted clearance rates, police services (by province)',
                         'publisher': 'Statistics Canada, Uniform Crime Reporting Survey', 'url': PAGES[35100190]},
                        {'title': 'Police personnel and selected crime statistics, municipal police services (population)',
                         'publisher': 'Statistics Canada, Police Administration Survey', 'url': PAGES[POP_TABLE]},
                        {'title': 'Crime severity index, Canada, provinces, territories and census metropolitan areas',
                         'publisher': 'Statistics Canada', 'url': PAGES[CMA_TABLE]}],
            'how': ('Crime Severity Index (Statistics Canada): every police-reported crime weighted by its seriousness, per '
                    'resident, Canada 2006 = 100. Lower is safer. Cities: municipal police services (own police or RCMP '
                    f'under contract) serving {MIN_POP:,} people or more; rank 1 is the lowest index. Last year\'s rank: the '
                    'same ranking with last year\'s figures. The index counts crime reported to police in the city policed, '
                    'not where offenders live; it does not measure unreported crime or how safe people feel.')}


def build(previous=None):
    """Download and rank. previous: the last output (skipped when Statistics Canada has released nothing new)."""
    rel = release_times()
    if previous and previous.get('release') == rel and previous.get('method') == METHOD and previous.get('top50'):
        return previous
    keep = set(STATS)
    police = []
    for t in POLICE_TABLES:
        police += table(t, keep)
    return build_from(police, table(POP_TABLE, {'Population'}), table(CMA_TABLE, keep), rel)


def load(data_dir=None, can_build=True):
    """The ranking: the website's copy next to this file (data/safety_rank.json), or the desktop app's in data_dir,
    built when missing or a month old."""
    web = os.path.join(HERE, 'data', 'safety_rank.json')
    mine = os.path.join(data_dir, 'safety_rank.json') if data_dir else None
    fresh = mine and os.path.exists(mine) and time.time() - os.path.getmtime(mine) < 30 * 86400
    for p in ([web] if os.path.exists(web) else []) + ([mine] if mine and os.path.exists(mine) and (fresh or not can_build) else []):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    if not (can_build and data_dir):
        return None
    d = build()
    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, 'safety_rank.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    return d


def summary(d, find=None):
    """For the analyst: Calgary's place, the 50 safest cities, the large cities and the metropolitan areas."""
    if not d:
        return {'error': 'The safety ranking is not on this computer yet.'}
    keep = ('rank', 'rank_prev', 'name', 'prov', 'police', 'population', 'csi', 'csi_prev', 'violent', 'change_pct')
    out = {k: d.get(k) for k in ('year', 'prev_year', 'cities_ranked', 'cities_ranked_prev', 'min_population', 'large_ranked',
                                 'canada', 'canada_prev', 'calgary', 'calgary_cma', 'how', 'sources')}
    out['top50'] = [{k: c.get(k) for k in keep} for c in d.get('top50') or []]
    out['large_cities'] = [{k: c.get(k) for k in keep + ('rank_large', 'rank_large_prev')} for c in d.get('cities') or [] if c.get('rank_large')]
    out['metropolitan_areas'] = d.get('cmas')
    if find:
        w = find.lower()
        out['found'] = [{k: c.get(k) for k in keep} for c in d.get('cities') or [] if w in c['name'].lower()]
    return out


if __name__ == '__main__':
    prev = None
    if len(sys.argv) > 2:
        try:
            with urllib.request.urlopen(sys.argv[2], timeout=60) as r:
                prev = json.loads(r.read())
        except Exception:                      # noqa: BLE001
            prev = None
    d = build(prev)
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    c = d['calgary'] or {}
    print(f"{d['year']}: {d['cities_ranked']} cities; Calgary #{c.get('rank')} (last year #{c.get('rank_prev')}), CSI {c.get('csi')}")
