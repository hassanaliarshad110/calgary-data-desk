"""Live connection tests: one small request to every source the app reads, straight to the source (no saved copies).

Each test asks for the least it can (one row, or the source's index page) and reports whether the source answered,
how long it took, when the source last changed where it says so, and what came back. The Data sources screen runs
them one by one or all together.
"""
import datetime as dt
import json
import time
import urllib.parse

import alberta
import calgary_data as cd
import camfeed
import context
import missing
import police
import rents
import weather

# key: (name, publisher, kind, target). kind 'city' = a City of Calgary open data dataset (target: its ID).
SOURCES = [
    ('311', '311 Service Requests', 'City of Calgary', 'city', 'iahh-g8bj'),
    ('traffic', 'Traffic Incidents', 'City of Calgary', 'city', '35ra-9556'),
    ('permits', 'Building Permits', 'City of Calgary', 'city', 'c2es-76ed'),
    ('dp', 'Development Permits', 'City of Calgary', 'city', '6933-unw5'),
    ('roads', 'Road Construction Projects', 'City of Calgary', 'city', 'sizs-hgef'),
    ('homes', 'Current Year Property Assessments (growth model)', 'City of Calgary', 'city', '4bsw-nn7w'),
    ('census_pop', 'Census Population by Community', 'City of Calgary', 'city', 'f9wk-wej9'),
    ('census_hh', 'Census Households by Community', 'City of Calgary', 'city', 'msjx-5ygv'),
    ('census_ward', 'Census by Ward (who lives here)', 'City of Calgary', 'city', 'k4pr-cznc'),
    ('wards', 'Ward Boundaries', 'City of Calgary', 'city', 'tz8z-hyaz'),
    ('communities', 'Community District Boundaries', 'City of Calgary', 'city', 'surr-xmvs'),
    ('city_boundary', 'City Boundary', 'City of Calgary', 'city', 'erra-cqp9'),
    ('rec', 'Recreation Facilities', 'City of Calgary', 'city', 'hxfu-6d96'),
    ('svc', 'Community Services (libraries, community centres)', 'City of Calgary', 'city', 'x34e-bcjz'),
    ('stops', 'Calgary Transit Stops', 'City of Calgary', 'city', 'muzh-c9qc'),
    ('play', 'Playground Equipment', 'City of Calgary', 'city', 'bdu9-amk8'),
    ('benches', 'Parks Seating (benches, picnic tables)', 'City of Calgary', 'city', 'ikeb-n5bc'),
    ('sport', 'Parks Sport Equipment', 'City of Calgary', 'city', 'da6k-wpxb'),
    ('plumbing', 'Parks Plumbing Fixtures (washrooms, fountains)', 'City of Calgary', 'city', 'jjkg-kv4n'),
    ('bins', 'Parks Wayfinder Garbage and Recycle', 'City of Calgary', 'city', 'fwyk-8pth'),
    ('offleash', 'Parks Off Leash Areas', 'City of Calgary', 'city', 'enr4-crti'),
    ('parks', 'Parks Sites', 'City of Calgary', 'city', 'kami-qbfh'),
    ('trees', 'Public Trees', 'City of Calgary', 'city', 'tfs4-3wwa'),
    ('schools', 'Schools (locations)', 'City of Calgary', 'city', 'fd9t-tdn2'),
    ('address', 'Parcel Address (placing child care)', 'City of Calgary', 'city', '9zvu-p8uz'),
    ('cameras', 'Traffic Cameras', 'City of Calgary', 'city', 'k7p9-kppz'),
    ('budget', 'Calgary Open Budget', 'City of Calgary', 'city', 'fqax-i3nz'),
    ('catalogue', 'City open data catalogue (2026 Census check, Data Genie search)', 'City of Calgary', 'url',
     cd.BASE + '/api/catalog/v1?domains=data.calgary.ca&search_context=data.calgary.ca&q=census&limit=1'),
    ('police', 'Community safety data (crime and disorder)', 'Calgary Police Service', 'url', police.PAGE),
    ('csi', 'Crime Severity Index', 'Statistics Canada', 'csi', None),
    ('rents', 'Rental Market Survey', 'CMHC', 'url', rents.PAGE),
    ('child_care', 'Child Care Information', 'Government of Alberta', 'url', alberta.CKAN + alberta.CHILD_CARE_PKG),
    ('enrolment', 'Student enrolment by school', 'Government of Alberta', 'url', alberta.CKAN + alberta.ENROLMENT_PKG),
    ('weather', 'Daily climate data, Calgary airport', 'Environment and Climate Change Canada', 'weather', None),
    ('camera_images', 'Traffic camera images', 'City of Calgary', 'url', camfeed.HOST),
    ('newsroom', 'Police news releases (missing persons)', 'City of Calgary Newsroom', 'url', missing.FEED),
]


def _get(url, timeout=30):
    """Straight to the source: the app's short-lived memory of answers is skipped on purpose."""
    try:
        return cd._get_once(url, timeout)          # one try: the test reports what the source does now
    except cd._Busy as e:
        raise cd.DataError(str(e)) from None


def test(key):
    """{'key', 'name', 'ok', 'ms', 'detail', 'updated'} for one source."""
    src = next((s for s in SOURCES if s[0] == key), None)
    if not src:
        return {'key': key, 'ok': False, 'detail': 'Unknown source'}
    _, name, pub, kind, target = src
    t0 = time.time()
    out = {'key': key, 'name': name, 'publisher': pub, 'ok': False, 'updated': None,
           'checked': dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    try:
        if kind == 'city':
            meta = json.loads(_get(f'{cd.BASE}/api/views/{target}.json').decode('utf-8'))
            rows = json.loads(_get(cd.soql_url(target, limit=1)).decode('utf-8'))
            if isinstance(rows, dict) and rows.get('error'):
                raise cd.DataError(rows.get('message') or 'the portal refused the request')
            when = meta.get('rowsUpdatedAt') or meta.get('viewLastModified')
            out['updated'] = dt.datetime.fromtimestamp(when).strftime('%Y-%m-%d %H:%M') if when else None
            out['detail'] = f"{target}: answered with {len(rows)} row" + (f", {len(rows[0])} fields" if rows else '')
            out['page'] = f'{cd.BASE}/d/{target}'
        elif kind == 'csi':
            body = context.post(context.WDS, context.request_body()[:1])
            data = json.loads(body.decode('utf-8'))
            n = len(((data[0] or {}).get('object') or {}).get('vectorDataPoint') or []) if isinstance(data, list) and data else 0
            out['detail'] = f'Statistics Canada answered with {n} yearly values'
            out['page'] = context.CSI_PAGE
        elif kind == 'weather':
            end = dt.date.today()
            url = weather._url(weather.NEW_STATION, end - dt.timedelta(days=7), end)
            data = json.loads(_get(url).decode('utf-8'))
            feats = data.get('features') or []
            out['detail'] = f'answered with {len(feats)} days of the last week'
            out['updated'] = max((f['properties'].get('LOCAL_DATE') or '' for f in feats), default=None)
            out['page'] = weather.BASE
        else:
            body = _get(target)
            out['detail'] = f'answered ({len(body):,} bytes)'
            out['page'] = target
        out['ok'] = True
    except Exception as e:                       # noqa: BLE001 - reported on screen
        out['detail'] = str(e)[:300]
    out['ms'] = int((time.time() - t0) * 1000)
    return out


def listing():
    return [{'key': k, 'name': n, 'publisher': p, 'target': t if kind == 'city' else None} for k, n, p, kind, t in SOURCES]
