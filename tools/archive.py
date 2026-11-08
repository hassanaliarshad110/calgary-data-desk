"""The daily archive: a copy of what changed today, so Calgary Insight keeps a history the City itself does not.

The City's open data shows how things are now: when a 311 request closes, a permit is issued or a roadwork map is
redrawn, yesterday's version is gone. Every day this keeps
  - every file of the site's own data (the built pages) that changed since the last archive;
  - every City open dataset updated since the last archive, in full when it has up to LIMIT_ROWS rows; larger ones are
    kept in the part that is overwritten (open 311 requests) or, for the rest, as a record of their size that day;
  - every data layer of the City's map server (roadwork, capital works, snow clearing, parking zones...) with up to
    LIMIT_FEATURES features;
compressed, in one file a day (only what changed, so most days are small), with a manifest of what is in it. The GitHub
workflow (.github/workflows/archive.yml) keeps each month's files in a release named archive-YYYY-MM and the running
state (what was kept last) in the release archive-state.

    python tools/archive.py --site SITE_DATA_DIR --state state.json --out OUT_DIR [--day YYYY-MM-DD]
"""
import argparse
import datetime as dt
import hashlib
import io
import json
import os
import sys
import tarfile
import time
import urllib.parse
import urllib.request

CITY = 'https://data.calgary.ca'
DISCOVERY = 'https://api.us.socrata.com/api/catalog/v1'
GIS = 'https://gis.calgary.ca/arcgis/rest/services/'
LIMIT_ROWS = 100000            # a dataset up to this size is kept whole each day it changes
LIMIT_FEATURES = 20000         # a map layer up to this size is kept whole each day it changes
PART = {                       # large datasets whose current state is overwritten: the part that changes is kept
    'iahh-g8bj': "status_description='Open'",          # 311 service requests: the requests still open today
}
HEADERS = {'User-Agent': 'CalgaryInsight/1.0 (civic data archive)'}
if os.environ.get('CDD_SOCRATA_TOKEN'):
    HEADERS['X-App-Token'] = os.environ['CDD_SOCRATA_TOKEN'].strip()


def fetch(url, timeout=300, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=timeout) as r:
                return r.read()
        except Exception:                      # noqa: BLE001 - a busy portal: wait and try again
            if i == tries - 1:
                raise
            time.sleep(15 * (i + 1))


def get_json(url, timeout=120):
    return json.loads(fetch(url, timeout).decode('utf-8'))


def sha(b):
    return hashlib.sha256(b).hexdigest()


class Day:
    """Today's archive file, written as it goes."""

    def __init__(self, path):
        self.path, self.tar = path, tarfile.open(path, 'w:gz', compresslevel=9)
        self.items, self.raw = [], 0

    def add(self, file, body, **info):
        t = tarfile.TarInfo(file)
        t.size, t.mtime = len(body), int(time.time())
        self.tar.addfile(t, io.BytesIO(body))
        self.raw += len(body)
        self.items.append({'file': file, 'bytes': len(body), **info})

    def close(self, manifest):
        body = json.dumps(manifest, indent=1, default=str).encode('utf-8')
        t = tarfile.TarInfo('manifest.json')
        t.size, t.mtime = len(body), int(time.time())
        self.tar.addfile(t, io.BytesIO(body))
        self.tar.close()


def site_files(day, site_dir, state):
    """The site's own data files that changed since the last archive."""
    seen = state.setdefault('site', {})
    n = 0
    for dp, _, fn in os.walk(site_dir):
        for f in sorted(fn):
            p = os.path.join(dp, f)
            rel = os.path.relpath(p, site_dir).replace(os.sep, '/')
            with open(p, 'rb') as fh:
                body = fh.read()
            h = sha(body)
            if seen.get(rel) == h:
                continue
            day.add('site/' + rel, body, kind='site', sha256=h)
            seen[rel] = h
            n += 1
    return n


def catalogue(site_dir):
    """The datasets to look at: the site's own copy of the City catalogue, or the City's discovery service."""
    p = os.path.join(site_dir or '', 'catalog.json')
    if site_dir and os.path.isfile(p):
        with open(p, encoding='utf-8') as f:
            c = json.load(f)
        return c.get('datasets') or [], c.get('map_layers') or []
    items, off = [], 0
    while True:
        d = get_json(DISCOVERY + '?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'search_context': 'data.calgary.ca',
                                                              'limit': 100, 'offset': off}))
        rs = d.get('results') or []
        items += rs
        if len(rs) < 100:
            break
        off += 100
    return [{'id': i['resource']['id'], 'name': i['resource'].get('name'), 'type': i['resource'].get('type'),
             'updated': (i['resource'].get('data_updated_at') or '')[:19]}
            for i in items if (i.get('resource') or {}).get('type') in ('dataset', 'file')], []


def updated_at(ds_id):
    v = get_json(f'{CITY}/api/views/{ds_id}.json', 60)
    t = v.get('rowsUpdatedAt') or v.get('viewLastModified')
    return dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S') if t else ''


def city_datasets(day, datasets, state, log):
    seen = state.setdefault('city', {})
    kept = 0
    for d in datasets:
        i = d['id']
        if d.get('type') == 'file':
            continue
        try:
            when = updated_at(i)
        except Exception as e:                 # noqa: BLE001 - one dataset down leaves the rest
            log.append(f'{i}: not read ({str(e)[:80]})')
            continue
        old = seen.get(i) or {}
        if old.get('updated') == when and i not in PART:
            continue
        try:
            n = int(get_json(f'{CITY}/resource/{i}.json?' + urllib.parse.urlencode({'$select': 'count(*) as n'}))[0]['n'])
        except Exception as e:                 # noqa: BLE001
            log.append(f'{i}: no row count ({str(e)[:80]})')
            continue
        where = PART.get(i) if n > LIMIT_ROWS else None
        if n > LIMIT_ROWS and not where:       # too large to keep whole every day: its size that day is the record
            seen[i] = {'updated': when, 'rows': n, 'kept': False}
            day.items.append({'file': None, 'kind': 'city', 'id': i, 'name': d.get('name'), 'rows': n, 'updated': when, 'kept': 'size only'})
            continue
        q = {'$limit': LIMIT_ROWS + 1 if not where else 2000000, '$order': ':id'}
        if where:
            q['$where'] = where
        try:
            body = fetch(f'{CITY}/resource/{i}.csv?' + urllib.parse.urlencode(q), 900)
        except Exception as e:                 # noqa: BLE001
            log.append(f'{i}: not downloaded ({str(e)[:80]})')
            continue
        h = sha(body)
        if old.get('sha256') == h:             # the date moved but nothing in it changed
            seen[i] = {**old, 'updated': when}
            continue
        day.add(f'city/{i}.csv', body, kind='city', id=i, name=d.get('name'), rows=n, updated=when,
                part=where, sha256=h)
        seen[i] = {'updated': when, 'rows': n, 'sha256': h, 'kept': True}
        kept += 1
    return kept


def map_layers(day, layers, state, log):
    seen = state.setdefault('maps', {})
    kept = 0
    for l in layers:
        key = f"{l['service']}/{l['layer']}"
        if not l.get('features') or l['features'] > LIMIT_FEATURES:
            continue
        rows, off = [], 0
        try:
            while True:
                d = get_json(f"{GIS}{key}/query?" + urllib.parse.urlencode({
                    'where': '1=1', 'outFields': '*', 'returnGeometry': 'true' if l.get('geometry') == 'point' else 'false',
                    'outSR': 4326, 'resultOffset': off, 'resultRecordCount': 1000, 'f': 'json'}), 120)
                fs = d.get('features') or []
                rows += [{**(f.get('attributes') or {}), **({'_xy': [f['geometry'].get('x'), f['geometry'].get('y')]} if f.get('geometry') else {})}
                         for f in fs]
                if not fs or not d.get('exceededTransferLimit'):
                    break
                off += len(fs)
        except Exception as e:                 # noqa: BLE001
            log.append(f'{key}: not read ({str(e)[:80]})')
            continue
        body = json.dumps(rows, separators=(',', ':'), sort_keys=True, default=str).encode('utf-8')
        h = sha(body)
        if seen.get(key) == h:
            continue
        day.add(f"maps/{key.replace('/', '__')}.json", body, kind='map', layer=key, name=l.get('name'),
                features=len(rows), sha256=h)
        seen[key] = h
        kept += 1
    return kept


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', help="the site's built data folder (data/ of the website)")
    ap.add_argument('--state', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--day', default=dt.datetime.now(dt.timezone.utc).date().isoformat())
    a = ap.parse_args(argv)
    os.makedirs(a.out, exist_ok=True)
    state = {}
    if os.path.isfile(a.state):
        with open(a.state, encoding='utf-8') as f:
            state = json.load(f)
    path = os.path.join(a.out, f'calgary-insight-archive-{a.day}.tar.gz')
    day, log, started = Day(path), [], time.time()
    counts = {}
    if a.site and os.path.isdir(a.site):
        counts['site_files'] = site_files(day, a.site, state)
    datasets, layers = catalogue(a.site)
    counts['city_datasets'] = city_datasets(day, datasets, state, log)
    counts['map_layers'] = map_layers(day, layers, state, log)
    manifest = {'day': a.day, 'made_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'), 'counts': counts,
                'raw_bytes': day.raw, 'items': day.items, 'problems': log, 'minutes': round((time.time() - started) / 60, 1),
                'note': 'What changed since the last archive. city/: City of Calgary open data (CSV); maps/: City map '
                        'server layers (JSON); site/: the website\'s own data files.'}
    day.close(manifest)
    state['last_day'] = a.day
    state.setdefault('days', {})[a.day] = {'bytes': os.path.getsize(path), 'raw_bytes': day.raw, **counts}
    with open(a.state, 'w', encoding='utf-8') as f:
        json.dump(state, f, separators=(',', ':'))
    print(json.dumps({'file': os.path.basename(path), 'bytes': os.path.getsize(path), 'raw_bytes': day.raw, **counts,
                      'problems': len(log), 'minutes': manifest['minutes']}))
    for line in log[:30]:
        print('  ', line)
    return 0


if __name__ == '__main__':
    sys.exit(main())
