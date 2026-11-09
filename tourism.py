"""Tourism in Calgary: who arrives, from where, against the other big gateways, and what other destinations did to grow.
Read by the website build (data/tourism.json) for Data Genie and the Data Scientist; the hand-checked research (Calgary's
own figures, what makes it different, lessons from other destinations, the incentives in use) is data/tourism_research.json.

Statistics Canada, read through its web data service:
  24-10-0055  Non-resident visitors entering Canada, by country of residence, mode of transportation, arrival type and
              traveller type, by port of entry, monthly since 2008. Calgary, Edmonton, Vancouver, Toronto and Montreal
              are ports: the visitors who enter Canada there, overnight tourists and same-day visitors, by country.
  23-10-0253  Air passenger traffic at Canadian airports, annual: passengers by domestic, transborder (United States)
              and other international sectors, every airport.
  23-10-0312  Screened passenger traffic at the largest airports, monthly, by sector (the newest months).

What it can and cannot say: a port of entry is where a visitor first enters Canada, not where they stay; Calgary's
entries include visitors on their way to Banff and the Rockies, and visitors who enter at Vancouver or Toronto and fly on
to Calgary are counted there. Canadians travelling in Canada are not in these tables (Tourism Calgary's figures, in the
research file, cover them). Passenger traffic counts every passenger, residents included, and connecting passengers twice.

    python tourism.py OUT.json CACHE_DIR      (the website build writes data/tourism.json)
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
UA = {'User-Agent': 'Mozilla/5.0 (compatible; CalgaryInsight/1.0; civic data)'}
ARRIVALS, AIR_ANNUAL, AIR_MONTHLY = 24100055, 23100253, 23100312
PORTS = {'Canada': 'Canada', 'Alberta': 'Alberta', 'Calgary': 'Calgary', 'Edmonton': 'Edmonton', 'Vancouver': 'Vancouver',
         'Toronto': 'Toronto Pearson International Airport', 'Montréal': 'Montreal'}   # label: Statistics Canada's name
COUNTRIES = ['Non-resident visitors entering Canada', 'United States of America residents entering Canada',
             'Residents of countries other than the United States of America entering Canada',
             'United Kingdom', 'Germany', 'France', 'Netherlands', 'Switzerland', 'Italy', 'Spain', 'Ireland',
             'Mexico', 'Brazil', 'Japan', 'South Korea', 'China', 'India', 'Philippines', 'Australia', 'New Zealand',
             'United Arab Emirates']
AIRPORTS = ['Calgary', 'Vancouver', 'Toronto', 'Montréal', 'Edmonton', 'Ottawa', 'Winnipeg', 'Halifax', 'Kelowna', 'Victoria']


def _city(geo):
    """'Toronto/Lester B Pearson International, Ontario' -> 'Toronto' when it is one of AIRPORTS."""
    g = (geo or '').split(',')[0]
    if 'International' not in g or re.search(r'Mirabel|Billy Bishop|Springbank|Josephburg|Villeneuve|Boundary Bay|Buttonville|Hubert', g):
        return None                                        # the city's main international airport only
    c = re.sub(r'\s+International.*$', '', g.split('/')[0]).strip()
    return c if c in AIRPORTS else None
RESEARCH = os.path.join(HERE, 'data', 'tourism_research.json')
SITE_COPY = 'https://calgaryinsight.ca/data/tourism.json'


def _get(url, data=None, timeout=300, tries=3):
    last = None
    for t in range(tries):
        try:
            h = dict(UA, **({'Content-Type': 'application/json'} if data is not None else {}))
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h), timeout=timeout) as r:
                return r.read()
        except Exception as e:                 # noqa: BLE001
            last = e
            time.sleep(4 * (t + 1))
    raise RuntimeError(f'{url.rsplit("/", 1)[-1][:60]}: {last}')


def _post(method, body):
    return json.loads(_get(WDS + method, json.dumps(body).encode('utf-8')).decode('utf-8'))


def _full_table(pid, cache_dir, keep_days=7):
    """A whole table's rows (dicts), the zip kept under cache_dir for keep_days."""
    path = os.path.join(cache_dir, 'statcan', f'{pid}.zip')
    if not (os.path.exists(path) and time.time() - os.path.getmtime(path) < keep_days * 86400):
        try:
            url = json.loads(_get(f'{WDS}getFullTableDownloadCSV/{pid}/en').decode('utf-8'))['object']
            data = _get(url)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, 'wb').write(data)
        except Exception:
            if not os.path.exists(path):
                raise
    z = zipfile.ZipFile(path)
    name = next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
    with z.open(name) as f:
        yield from csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig'))


def _num(v):
    try:
        return float(v) if v not in ('', None) else None
    except ValueError:
        return None


# ------------------------------------------------------------------ international visitors by port of entry

def _member(dim, want):
    """The member id for a name: exact first, then a name that starts with it."""
    ms = dim['member']
    for m in ms:
        if m['memberNameEn'] == want:
            return m['memberId']
    for m in ms:
        if m['memberNameEn'].startswith(want):
            return m['memberId']
    return None


def arrivals(months=132):
    """{port: {country: {'YYYY-MM': overnight tourists}}} and the same for all visitors (incl. same-day), Canada's
    big ports, the last `months` months."""
    meta = _post('getCubeMetadata', [{'productId': ARRIVALS}])[0]['object']
    dims = {d['dimensionNameEn']: d for d in meta['dimension']}
    order = [d['dimensionNameEn'] for d in meta['dimension']]
    fixed = {'Mode of transportation': _member(dims['Mode of transportation'], 'Air'),           # air only: like with like
             'Arrival type': _member(dims['Arrival type'], 'All arrivals')}
    types = {'tourists': _member(dims['Traveller type'], 'Tourists (overnight)'), 'visitors': _member(dims['Traveller type'], 'Visitors')}
    ports = {p: _member(dims['Geography'], n) for p, n in PORTS.items()}
    countries = {c: _member(dims['Country of residence'], c) for c in COUNTRIES}
    reqs, keys = [], []
    for p, pid in ports.items():
        for c, cid in countries.items():
            for t, tid in types.items():
                if t == 'visitors' and c not in COUNTRIES[:3]:
                    continue                           # same-day counts only for the totals
                if None in (pid, cid, tid):
                    continue
                ids = {'Geography': pid, 'Country of residence': cid, 'Traveller type': tid, **fixed}
                coord = '.'.join(str(ids[d]) for d in order) + '.0' * (10 - len(order))
                reqs.append({'productId': ARRIVALS, 'coordinate': coord, 'latestN': months})
                keys.append((p, c, t))
    by_coord = {r['coordinate']: k for r, k in zip(reqs, keys)}
    out = {'tourists': {}, 'visitors': {}}
    for i in range(0, len(reqs), 100):
        res = _post('getDataFromCubePidCoordAndLatestNPeriods', reqs[i:i + 100])
        for r in res:                                      # the answers do not come back in the order asked
            o = r.get('object') or {}
            k = by_coord.get(o.get('coordinate'))
            if r.get('status') != 'SUCCESS' or not k:
                continue
            p, c, t = k
            pts = o.get('vectorDataPoint') or []
            out[t].setdefault(p, {})[c] = {d['refPer'][:7]: d['value'] for d in pts if d.get('value') is not None}
    return {'months': months, 'ports_found': {p: bool(v) for p, v in ports.items()},
            'countries_found': [c for c, v in countries.items() if v], **out}


def _years(series):
    """{'YYYY-MM': v} -> {year: total} for complete years, and the latest year to date."""
    by = {}
    for m, v in series.items():
        by.setdefault(m[:4], []).append((m, v))
    full = {y: round(sum(v for _, v in ms)) for y, ms in by.items() if len(ms) == 12}
    last_y = max(by) if by else None
    ytd = None
    if last_y and last_y not in full:
        months = sorted(m for m, _ in by[last_y])
        n = len(months)
        prev = by.get(str(int(last_y) - 1), [])
        ytd = {'year': last_y, 'months': n, 'through': months[-1], 'total': round(sum(v for _, v in by[last_y])),
               'same_months_last_year': round(sum(v for m, v in prev if int(m[5:]) <= n)) if prev else None}
    return full, ytd


def arrivals_summary(a):
    T = a['tourists']
    tot = 'Non-resident visitors entering Canada'
    us, ov = COUNTRIES[1], COUNTRIES[2]
    ports = {}
    for p in PORTS:
        if p not in T or tot not in T[p]:
            continue
        full, ytd = _years(T[p][tot])
        usf, _ = _years(T[p].get(us, {}))
        ovf, _ = _years(T[p].get(ov, {}))
        ports[p] = {'overnight_by_year': full, 'year_to_date': ytd,
                    'us_by_year': usf, 'overseas_by_year': ovf}
        sm = {}
        for m, v in T[p][tot].items():
            sm.setdefault(m[5:], []).append(v)
        ports[p]['average_by_month'] = {k: round(sum(v) / len(v)) for k, v in sorted(sm.items())}
    lastfull = max((y for y in (ports.get('Calgary') or {}).get('overnight_by_year', {})), default=None)
    share = {}
    if lastfull and 'Canada' in ports:
        ca = ports['Canada']['overnight_by_year'].get(lastfull)
        for p in ports:
            v = ports[p]['overnight_by_year'].get(lastfull)
            share[p] = round(v / ca * 100, 1) if v and ca and p != 'Canada' else None
    countries = {}
    for p in ('Calgary', 'Vancouver', 'Toronto', 'Edmonton', 'Canada'):
        rows = []
        for c in COUNTRIES[3:]:
            full, _ = _years((T.get(p) or {}).get(c, {}))
            if full:
                ys = sorted(full)
                rows.append({'country': c, 'latest_year': ys[-1], 'overnight': full[ys[-1]],
                             'year_before': full.get(ys[-2]) if len(ys) > 1 else None,
                             'five_years_before': full.get(str(int(ys[-1]) - 5)), 'by_year': full})
        countries[p] = sorted(rows, key=lambda r: -r['overnight'])
    same_day = {}
    for p, d in (a.get('visitors') or {}).items():
        full, _ = _years(d.get(tot, {}))
        same_day[p] = full
    return {'latest_full_year': lastfull, 'ports': ports, 'share_of_canada_pct': share, 'by_country': countries,
            'all_visitors_incl_same_day_by_year': same_day,
            'how': 'Non-resident visitors entering Canada by air at each port of entry (Statistics Canada 24-10-0055): '
                   'overnight tourists by year and month, by country of residence. A port of entry is where a visitor first '
                   'enters Canada, not where they stay. Calgary = YYC; Toronto = Pearson; Canada and Alberta = every airport.'}


# ------------------------------------------------------------------ airports

def airports_annual(cache_dir):
    keys = {'Total, passengers enplaned and deplaned': 'total', 'Domestic sector': 'domestic', 'Transborder sector': 'transborder',
            'Other International sector': 'international'}
    out = {}
    for r in _full_table(AIR_ANNUAL, cache_dir, keep_days=20):
        city, key, v = _city(r.get('GEO')), keys.get(r.get('Air passenger traffic') or ''), _num(r.get('VALUE'))
        if city and key and v is not None:
            out.setdefault(city, {'geo': r['GEO'], 'years': {}})['years'].setdefault(r['REF_DATE'][:4], {})[key] = round(v)
    return out


def airports_monthly(cache_dir):
    keys = {'Total passengers': 'total', 'Domestic sector passengers': 'domestic', 'Transborder sector passengers': 'transborder',
            'Other International sector passengers': 'international'}
    out = {}
    for r in _full_table(AIR_MONTHLY, cache_dir, keep_days=7):
        g = r.get('GEO') or ''
        city = 'Eight largest' if g.startswith('Total of eight') else _city(g)
        key, v = keys.get(r.get('Screened traffic') or ''), _num(r.get('VALUE'))
        if city and key and v is not None:
            out.setdefault(city, {}).setdefault(r['REF_DATE'][:7], {})[key] = round(v)
    return {c: dict(sorted(m.items())[-24:]) for c, m in out.items()}


# ------------------------------------------------------------------ checks and the file

def check(d):
    bad = []
    a = d.get('arrivals') or {}
    cal = ((a.get('ports') or {}).get('Calgary') or {}).get('overnight_by_year') or {}
    if not cal:
        bad.append('no Calgary arrivals')
    else:
        y = max(cal)
        if not 50_000 <= cal[y] <= 5_000_000:
            bad.append(f'Calgary overnight arrivals {cal[y]:,} in {y} look wrong')
    ap = (d.get('airports_annual') or {}).get('Calgary') or {}
    if ap:
        y = max(ap['years'])
        t = ap['years'][y].get('total') or 0
        if not 3_000_000 <= t <= 60_000_000:
            bad.append(f'Calgary airport passengers {t:,} in {y} look wrong')
    return bad


def build(cache_dir):
    out, errors = {'built': time.strftime('%Y-%m-%d'), 'sources': [
        {'name': 'Non-resident visitors entering Canada, by country of residence, mode, arrival type and traveller type (24-10-0055)',
         'publisher': 'Statistics Canada', 'url': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2410005501'},
        {'name': 'Air passenger traffic at Canadian airports, annual (23-10-0253)', 'publisher': 'Statistics Canada',
         'url': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2310025301'},
        {'name': 'Screened passenger traffic at the largest airports in Canada (23-10-0312)', 'publisher': 'Statistics Canada',
         'url': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2310031201'}]}, []
    try:
        out['arrivals'] = arrivals_summary(arrivals())
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Arrivals: {e}')
    try:
        out['airports_annual'] = airports_annual(cache_dir)
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Airports (annual): {e}')
    try:
        out['airports_monthly'] = airports_monthly(cache_dir)
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Airports (monthly): {e}')
    bad = check(out)
    if bad:
        errors.append('Checks: ' + '; '.join(bad))
        for k in ('arrivals', 'airports_annual'):
            if any(k.split('_')[0] in b.lower() for b in bad):
                out.pop(k, None)                       # the build keeps yesterday's part instead
    out['errors'] = errors
    return out


def research():
    try:
        with open(RESEARCH, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def load(data_dir=None, can_build=True):
    for p in (os.path.join(HERE, 'data', 'tourism.json'), os.path.join(data_dir, 'tourism.json') if data_dir else None):
        if p and os.path.exists(p) and (p.startswith(HERE) or time.time() - os.path.getmtime(p) < 7 * 86400):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    if can_build and data_dir:
        try:
            d = json.loads(_get(SITE_COPY, timeout=60, tries=1).decode('utf-8'))
            os.makedirs(data_dir, exist_ok=True)
            with open(os.path.join(data_dir, 'tourism.json'), 'w', encoding='utf-8') as f:
                json.dump(d, f)
            return d
        except Exception:                             # noqa: BLE001
            return None
    return None


def summary(d, part=None, find=None):
    """For the analyst. part: summary (default), arrivals (every port, by year and month), countries (by country for
    Calgary, Vancouver, Toronto, Edmonton and Canada), airports (passengers by sector, annual and monthly), research
    (Calgary's own figures, what makes it different, lessons from other destinations, incentives, with sources)."""
    r = research() or {}
    part = (part or 'summary').lower()
    if part.startswith('res') or part.startswith('lesson') or part.startswith('uniq'):
        if find:
            w = find.lower()
            return {k: v for k, v in r.items() if w in json.dumps(v, ensure_ascii=False).lower() or w in k.lower()}
        return r
    if not d:
        return {'error': 'The tourism figures are not available right now.', 'research': r}
    head = {k: d.get(k) for k in ('built', 'sources', 'errors')}
    a = d.get('arrivals') or {}
    if part.startswith('arr'):
        return {**head, **a, 'by_country': None}
    if part.startswith('coun'):
        bc = a.get('by_country') or {}
        if find:
            bc = {p: [x for x in rows if find.lower() in x['country'].lower()] for p, rows in bc.items()}
        return {**head, 'latest_full_year': a.get('latest_full_year'), 'by_country': bc, 'how': a.get('how')}
    if part.startswith('air'):
        return {**head, 'airports_annual': d.get('airports_annual'), 'airports_monthly': d.get('airports_monthly'),
                'how': 'Passengers enplaned plus deplaned by sector (domestic, transborder = United States, other international), '
                       'Statistics Canada 23-10-0253 (annual) and 23-10-0312 (screened, monthly, the eight largest airports). '
                       'Every passenger is counted, residents included; a connecting passenger is counted on arrival and departure.'}
    ports = {p: {'overnight_by_year': v.get('overnight_by_year'), 'year_to_date': v.get('year_to_date')}
             for p, v in (a.get('ports') or {}).items()}
    ap = {c: {y: v for y, v in sorted(x['years'].items())[-6:]} for c, x in (d.get('airports_annual') or {}).items()}
    return {**head, 'arrivals_overnight_by_port': ports, 'share_of_canada_pct': a.get('share_of_canada_pct'),
            'calgary_top_countries': (a.get('by_country') or {}).get('Calgary', [])[:12],
            'airports_annual_last_years': ap,
            'research_keys': sorted(r.keys()),
            'calgary_2025': r.get('calgary_2025'),
            'more': 'part=arrivals (every port by year and month, seasonality), countries (by country, find narrows), '
                    'airports (passengers by sector), research (Calgary\'s own figures, uniqueness, lessons from Iceland, '
                    'Singapore, Dubai, New York, Denver and airline stopovers, incentives, levies, rail; find narrows). '
                    'Method: get_method topic tourism.'}


if __name__ == '__main__':
    cache = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '.cache')
    d = build(cache)
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    a = d.get('arrivals') or {}
    print(json.dumps({'errors': d['errors'], 'share': a.get('share_of_canada_pct'),
                      'calgary': ((a.get('ports') or {}).get('Calgary') or {}).get('overnight_by_year'),
                      'airports': {c: sorted(x['years'].items())[-1] for c, x in (d.get('airports_annual') or {}).items()}}, indent=1)[:3000])
