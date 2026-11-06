"""City-wide context from Statistics Canada: the police-reported Crime Severity Index.

  Table 35-10-0026-01  Crime severity index and weighted clearance rates, Canada, provinces, territories and
                       Census Metropolitan Areas. Annual (released each July), 1998 onward.

Read through Statistics Canada's Web Data Service (no key needed). Kept for a week, because it changes once a year.
Calgary here is the Calgary metropolitan area, policed almost entirely by the Calgary Police Service.
"""
import json
import os
import time
import urllib.error
import urllib.request

CSI_PRODUCT = 35100026
CSI_PAGE = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510002601'
WDS = 'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods'
CPS_DASHBOARD = 'https://www.calgary.ca/cps/statistics/calgary-police-statistical-reports.html'
# Geography member ids in table 35-10-0026-01 (from the table's own metadata)
GEOS = {'Calgary': 34, 'Edmonton': 35, 'Vancouver': 37, 'Toronto': 19, 'Montréal': 14, 'Winnipeg': 29,
        'Ottawa': 18, 'Canada': 1}
STATS = {'csi': 1, 'violent': 3, 'non_violent': 5}
YEARS = 11              # the last 11 years: ten years of change
KEEP_DAYS = 7


class ContextError(Exception):
    pass


def _http_post(url, body, timeout=60):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST',
                                 headers={'User-Agent': 'Ward5DataDesk/1.0', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise ContextError(f'Statistics Canada answered {e.code}') from None
    except urllib.error.URLError as e:
        raise ContextError(f'Could not reach Statistics Canada ({e.reason}).') from None


post = _http_post        # replaced in tests


def request_body():
    return [{'productId': CSI_PRODUCT, 'coordinate': f'{g}.{s}.0.0.0.0.0.0.0.0', 'latestN': YEARS}
            for g in GEOS.values() for s in STATS.values()]


def parse_csi(items):
    geo_name = {v: k for k, v in GEOS.items()}
    stat_name = {v: k for k, v in STATS.items()}
    series = {}
    for it in items:
        o = it.get('object') or {}
        if it.get('status') != 'SUCCESS' or not o.get('coordinate'):
            continue
        parts = o['coordinate'].split('.')
        city, key = geo_name.get(int(parts[0])), stat_name.get(int(parts[1]))
        if not city or not key:
            continue
        for p in o.get('vectorDataPoint') or []:
            if p.get('value') is not None:
                series.setdefault(city, {}).setdefault(key, {})[int(p['refPer'][:4])] = float(p['value'])
    if 'Calgary' not in series or 'csi' not in series['Calgary']:
        raise ContextError('Calgary was not found in the Crime Severity Index table.')
    years = sorted({y for c in series.values() for s in c.values() for y in s})[-YEARS:]
    out = {c: {k: [s.get(y) for y in years] for k, s in v.items()} for c, v in series.items()}

    def change(city, key, back=1):
        v = (out.get(city) or {}).get(key) or []
        if len(v) > back and v[-1] and v[-1 - back]:
            return round((v[-1] - v[-1 - back]) / v[-1 - back] * 100, 1)
        return None
    ranking = sorted(({'city': c, 'csi': v['csi'][-1], 'change_pct': change(c, 'csi')}
                      for c, v in out.items() if c != 'Canada' and v.get('csi') and v['csi'][-1]),
                     key=lambda x: -x['csi'])
    cal = out['Calgary']
    return {'table': '35-10-0026-01', 'page': CSI_PAGE, 'cps_dashboard': CPS_DASHBOARD,
            'years': years, 'latest_year': years[-1], 'series': out, 'ranking': ranking,
            'calgary': {k: (cal.get(k) or [None])[-1] for k in STATS},
            'calgary_change_pct': {k: change('Calgary', k) for k in STATS},
            'calgary_10yr_pct': change('Calgary', 'csi', len(years) - 1),
            'canada': (out.get('Canada', {}).get('csi') or [None])[-1]}


def csi(cache_dir, force=False):
    """Crime Severity Index for Calgary and other large cities, kept for a week (force: ask Statistics Canada now)."""
    path = os.path.join(cache_dir, 'csi_35100026.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            pass
    try:
        data = parse_csi(json.loads(post(WDS, request_body()).decode('utf-8')))
    except Exception:
        if os.path.exists(path):                        # offline: the last copy is still good (yearly data)
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    data['fetched'] = time.strftime('%Y-%m-%d')
    data['fetched_utc'] = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())
    os.makedirs(cache_dir, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    return data
