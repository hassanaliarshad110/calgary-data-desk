"""City of Calgary Open Data (data.calgary.ca): search, describe, query and download any dataset.

Every dataset on the portal has an API at https://data.calgary.ca/resource/<dataset id>.json that accepts
SoQL queries ($select, $where, $group, $order, $limit). No account or key is needed.
"""
import csv
import io
import json
import os
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = 'https://data.calgary.ca'
HEADERS = {'User-Agent': 'Ward5DataDesk/1.0', 'Accept': 'application/json'}
MAX_QUERY_ROWS = 5000          # rows the agent may pull in one query
DATASET_ID = re.compile(r'^[a-z0-9]{4}-[a-z0-9]{4}$')


class DataError(Exception):
    """A problem with a request to the open data portal, explained in plain words."""


RETRIES = 1                       # extra tries after a timeout, a dropped connection or a busy server (429 or 5xx)
RETRY_WAIT = 5                    # seconds before the first extra try; doubled each time


def _http_get(url, timeout=120):
    import time as _time
    for attempt in range(RETRIES + 1):
        try:
            return _get_once(url, timeout)
        except _Busy as e:
            if attempt == RETRIES:
                raise DataError(str(e)) from None
            _time.sleep(RETRY_WAIT * (2 ** attempt))


class _Busy(Exception):
    """A failure worth trying again."""


def _get_once(url, timeout):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code == 429 or e.code >= 500:
            raise _Busy(f'The open data portal answered {e.code} (busy). Try again shortly.') from None
        body = e.read().decode('utf-8', 'replace')[:600]
        try:
            msg = json.loads(body).get('message') or body
        except ValueError:
            msg = body
        raise DataError(f'The open data portal answered {e.code}: {msg}') from None
    except urllib.error.URLError as e:
        raise _Busy(f'Could not reach data.calgary.ca ({e.reason}). Check the internet connection.') from None
    except (TimeoutError, ConnectionError, OSError) as e:      # a read that timed out or a connection that dropped
        raise _Busy(f'data.calgary.ca did not answer in time ({e}). Try again shortly.') from None


# Replaced in tests with a function that reads saved responses.
fetch = _http_get


# Answers kept for a short while, so switching ward or the way residents are counted reuses what was just fetched
# (the whole-city tables, the Census, the property roll) instead of asking the City again. Refresh clears it.
KEEP_SECONDS = 30 * 60
KEEP_BYTES = 400 * 1024 * 1024
_kept = {}                       # url -> (time, body)
_kept_lock = threading.Lock()


def clear_kept():
    with _kept_lock:
        _kept.clear()


def _fetch_kept(url, timeout):
    now = time.time()
    with _kept_lock:
        hit = _kept.get(url)
        if hit and now - hit[0] < KEEP_SECONDS:
            return hit[1]
    body = fetch(url, timeout)
    if '/resource/' in url and len(body) < KEEP_BYTES // 8:
        with _kept_lock:
            _kept[url] = (now, body)
            total = sum(len(b) for _, b in _kept.values())
            for k in sorted(_kept, key=lambda k: _kept[k][0]):      # oldest out first when it gets too big
                if total <= KEEP_BYTES:
                    break
                total -= len(_kept.pop(k)[1])
    return body


def get_json(url, timeout=120):
    body = _fetch_kept(url, timeout)
    try:
        return json.loads(body.decode('utf-8'))
    except ValueError:                 # e.g. a wifi sign-in page or a maintenance page instead of data
        raise DataError('The open data portal sent back a page that is not data (the internet connection may need a '
                        'sign-in, or the site is under maintenance).') from None


def _check_id(dataset_id):
    dataset_id = (dataset_id or '').strip().lower()
    if not DATASET_ID.match(dataset_id):
        raise DataError(f'"{dataset_id}" is not a dataset ID. IDs look like iahh-g8bj; use search_datasets to find one.')
    return dataset_id


def soql_url(dataset_id, select=None, where=None, group=None, order=None, limit=1000, fmt='json', offset=0):
    params = {}
    for key, value in (('$select', select), ('$where', where), ('$group', group), ('$order', order)):
        if value:
            params[key] = value
    params['$limit'] = int(limit)
    if offset:
        params['$offset'] = int(offset)
    return f'{BASE}/resource/{_check_id(dataset_id)}.{fmt}?' + urllib.parse.urlencode(params)


def query(dataset_id, select=None, where=None, group=None, order=None, limit=1000):
    """Run a SoQL query and return the rows (a list of dicts)."""
    return get_json(soql_url(dataset_id, select, where, group, order, limit))


def search_datasets(text, limit=8):
    """Search the City's catalogue of about 1,000 datasets."""
    url = (f'{BASE}/api/catalog/v1?' + urllib.parse.urlencode({
        'domains': 'data.calgary.ca', 'search_context': 'data.calgary.ca', 'q': text, 'limit': max(limit * 3, 15)}))
    out = []
    for item in get_json(url).get('results', []):
        res = item.get('resource', {})
        if res.get('type') != 'dataset':
            continue
        out.append({
            'id': res.get('id'),
            'name': res.get('name'),
            'description': (res.get('description') or '').strip()[:400],
            'last_updated': (res.get('data_updated_at') or '')[:10],
            'columns': [c for c in res.get('columns_field_name', []) if not c.startswith(':@')][:40],
        })
        if len(out) >= limit:
            break
    return out


def describe_dataset(dataset_id):
    """Name, description, update date, columns and three sample rows of one dataset."""
    dataset_id = _check_id(dataset_id)
    v = get_json(f'{BASE}/api/views/{dataset_id}.json')
    cols = []
    for c in v.get('columns', []):
        name = c.get('fieldName', '')
        if name.startswith(':@'):
            continue
        cols.append({'field': name, 'type': c.get('dataTypeName'), 'label': c.get('name'),
                     'about': (c.get('description') or '')[:160]})
    try:
        sample = query(dataset_id, limit=3)
        for row in sample:
            for k in list(row):
                if isinstance(row[k], (dict, list)):
                    row[k] = '(map shape)'
                elif isinstance(row[k], str) and len(row[k]) > 120:
                    row[k] = row[k][:120] + '...'
                if k.startswith(':@'):
                    del row[k]
    except DataError:
        sample = []
    updated = v.get('rowsUpdatedAt')
    return {
        'id': dataset_id,
        'name': v.get('name'),
        'description': (v.get('description') or '').strip()[:1200],
        'last_updated': time.strftime('%Y-%m-%d', time.gmtime(updated)) if updated else None,
        'page': f'{BASE}/d/{dataset_id}',
        'columns': cols,
        'sample_rows': sample,
    }


def safe_filename(name):
    name = re.sub(r'[^\w\- .()]+', '_', name or 'calgary_data').strip(' ._') or 'calgary_data'
    return name if name.lower().endswith('.csv') else name + '.csv'


def download_csv(dataset_id, folder, filename, select=None, where=None, order=None, max_rows=2_000_000, page=200_000):
    """Save a (filtered) dataset as CSV, fetched in pages so large downloads finish. Returns the path and row count."""
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, safe_filename(filename))
    base, ext = os.path.splitext(path)
    n = 2
    while os.path.exists(path):
        path = f'{base} ({n}){ext}'
        n += 1
    order = order or ':id'                         # a fixed order keeps pages from overlapping
    first_url = soql_url(dataset_id, select, where, None, order, min(page, max_rows), fmt='csv')
    rows = size = 0
    offset = 0
    try:
        with open(path, 'wb') as f:
            while rows < max_rows:
                url = soql_url(dataset_id, select, where, None, order, min(page, max_rows - rows), fmt='csv', offset=offset)
                data = fetch(url, 600)
                text = data.decode('utf-8', 'replace')
                got = list(csv.reader(io.StringIO(text)))
                body = got[1:] if got else []
                if offset == 0:
                    f.write(data)
                elif body:
                    out = io.StringIO()
                    csv.writer(out, lineterminator='\n', quoting=csv.QUOTE_ALL).writerows(body)
                    f.write(out.getvalue().encode('utf-8'))
                rows += len(body)
                size += len(data)
                offset += len(body)
                if len(body) < min(page, max_rows - rows + len(body)):
                    break
    except Exception:
        try:
            os.remove(path)
        except OSError:
            pass
        raise
    return {'path': path, 'rows': rows, 'bytes': os.path.getsize(path), 'source': f'{BASE}/d/{dataset_id}',
            'query_url': first_url}


# ---------------------------------------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------------------------------------
def point_in_multipolygon(lon, lat, multipolygon):
    """Even-odd rule over every ring of a GeoJSON MultiPolygon."""
    hit = False
    for polygon in multipolygon.get('coordinates', []):
        for ring in polygon:
            j = len(ring) - 1
            for i in range(len(ring)):
                xi, yi = ring[i][0], ring[i][1]
                xj, yj = ring[j][0], ring[j][1]
                if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
                    hit = not hit
                j = i
    return hit


def bbox(multipolygon):
    xs, ys = [], []
    for polygon in multipolygon.get('coordinates', []):
        for ring in polygon:
            for p in ring:
                xs.append(p[0])
                ys.append(p[1])
    return min(xs), min(ys), max(xs), max(ys)
