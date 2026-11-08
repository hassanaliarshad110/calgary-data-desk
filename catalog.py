"""The City of Calgary's whole open data catalogue, kept with the site so the assistants know every dataset before they
answer: every dataset and data file on data.calgary.ca (name, category, tags, description, last update, every column), and
every layer on the City's map server (gis.calgary.ca), each marked with whether a page of the site already reads it.

The website build writes data/catalog.json every night. search() ranks the whole catalogue by the words asked for, and
browse() lists a category, so a report can find every dataset that bears on its subject, not only the first few a keyword
search returns. Any dataset found can be read at once with describe_dataset and query_dataset; map layers with
query_map_layer.

    python catalog.py OUT.json
"""
import datetime as dt
import glob
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DISCOVERY = 'https://api.us.socrata.com/api/catalog/v1'
GIS = 'https://gis.calgary.ca/arcgis/rest/services/'
SKIP_GIS = ('pub_Basemap/', 'pub_Locator_Pro/', 'pub_Orthophotos/', 'ImageryLabels', 'OlympicPlazaBricks', 'NAServer',
            'ParksBasemap', 'pub_QueryService/')          # background maps, address finders and imagery: not data
WORD = re.compile(r'[a-z0-9]+')


def _get(url, timeout=120):
    req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryInsight/1.0 (civic data dashboard)'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))


def _text(html):
    t = re.sub(r'<[^>]+>', ' ', str(html or ''))
    return ' '.join(t.replace('&nbsp;', ' ').replace('&amp;', '&').split())


def used_ids(root=HERE):
    """Dataset IDs that the site's own code reads (its pages and dashboards)."""
    ids = set()
    for f in glob.glob(os.path.join(root, '*.py')) + glob.glob(os.path.join(root, 'web', '*.py')):
        if os.path.basename(f) == 'catalog.py':
            continue
        try:
            with open(f, encoding='utf-8') as fh:
                ids |= set(re.findall(r"['\"/]([a-z0-9]{4}-[a-z0-9]{4})['\"]", fh.read()))
        except OSError:
            pass
    return ids


def datasets():
    items, off = [], 0
    while True:
        d = _get(DISCOVERY + '?' + urllib.parse.urlencode({'domains': 'data.calgary.ca', 'search_context': 'data.calgary.ca',
                                                          'limit': 100, 'offset': off}))
        rs = d.get('results') or []
        items += rs
        if len(rs) < 100:
            break
        off += 100
    used = used_ids()
    out = []
    for i in items:
        r = i.get('resource') or {}
        c = i.get('classification') or {}
        if r.get('type') not in ('dataset', 'file') or not r.get('id'):
            continue
        meta = {m.get('key'): m.get('value') for m in c.get('domain_metadata') or [] if isinstance(m, dict)}
        cols = []
        for f, label, t, desc in zip(r.get('columns_field_name') or [], r.get('columns_name') or [], r.get('columns_datatype') or [],
                                     (r.get('columns_description') or []) + [''] * 400):
            if f.startswith(':'):
                continue
            what = _text(desc)[:140] or (label if label and label.lower().replace(' ', '_') != f.lower() else '')
            cols.append([f, t, what])
        out.append({'id': r['id'], 'name': (r.get('name') or '').strip(), 'type': r['type'],
                    'category': c.get('domain_category') or 'Other', 'tags': c.get('domain_tags') or [],
                    'description': _text(r.get('description'))[:600],
                    'updated': (r.get('data_updated_at') or r.get('updatedAt') or '')[:10],
                    'created': (r.get('createdAt') or '')[:10],
                    'business_unit': meta.get('Data-Supplier_Business-Unit') or None,
                    'frequency': meta.get('Time/Date_Update-Frequency') or meta.get('Data-Workflow_Update-Frequency') or None,
                    'period_stated': meta.get('Time/Date_Time-Period-Covered') or None,
                    'how_collected': _text(meta.get('Time/Date_How-Data-is-Collected'))[:200] or None,
                    'geography': geography(cols, r.get('columns_name') or []),
                    'columns': cols[:80], 'views_month': (r.get('page_views') or {}).get('page_views_last_month'),
                    'url': f"https://data.calgary.ca/d/{r['id']}", 'on_site': r['id'] in used})
    out.sort(key=lambda x: (x['category'], x['name']))
    return out


GEO_WORDS = (('community', ('comm_code', 'comm_name', 'community', 'community_name', 'calgary communities')),
             ('ward', ('ward', 'ward_num', 'ward boundaries')), ('quadrant', ('quadrant', 'city quadrants')))


def geography(cols, labels=()):
    """What a dataset can be mapped or grouped by: community, ward, quadrant, points, lines or areas."""
    names = [c[0].lower() for c in cols] + [str(x).lower() for x in labels]
    out = [g for g, keys in GEO_WORDS if any(n == k or n.startswith(k + '_') or k in n for n in names for k in keys)]
    kinds = {c[1] for c in cols}
    if kinds & {'Point', 'MultiPoint', 'Location'} or {'latitude', 'longitude'} <= set(names):
        out.append('points')
    if kinds & {'Line', 'MultiLine'}:
        out.append('lines')
    if kinds & {'Polygon', 'MultiPolygon'}:
        out.append('areas')
    return out


DATE_TYPES = ('Calendar date', 'Date', 'Floating Timestamp', 'Fixed Timestamp')


def profile(ds, budget_s=1500, workers=8, query=None):
    """Each dataset's size and the period it covers, read from the data itself: rows, and the first and last value of its
    main date column (one with 'date' in its name first). Fills 'rows', 'date_field', 'first', 'last' and 'about'."""
    import concurrent.futures as cf
    query = query or (lambda i, sel: _get(f"https://data.calgary.ca/resource/{i}.json?" + urllib.parse.urlencode({'$select': sel}), 90))
    start = time.time()

    def one(d):
        if d.get('type') != 'dataset' or time.time() - start > budget_s:
            return
        dates = [c[0] for c in d.get('columns') or [] if c[1] in DATE_TYPES]
        dates = sorted(dates, key=lambda f: 0 if 'date' in f else 1)     # stable: the first 'date' column, else the first
        sel = 'count(*) as n' + (f', min(`{dates[0]}`) as a, max(`{dates[0]}`) as b' if dates else '')
        try:
            row = (query(d['id'], sel) or [{}])[0]
        except Exception:                          # noqa: BLE001 - a dataset that will not answer keeps its catalogue entry
            try:
                row = (query(d['id'], 'count(*) as n') or [{}])[0]
                dates = []
            except Exception:                      # noqa: BLE001
                return
        try:
            d['rows'] = int(float(row.get('n')))
        except (TypeError, ValueError):
            pass
        if dates and row.get('a'):
            d['date_field'], d['first'], d['last'] = dates[0], str(row['a'])[:10], str(row.get('b') or '')[:10]

    with cf.ThreadPoolExecutor(workers) as ex:
        list(ex.map(one, ds))
    for d in ds:
        d['about'] = about(d)
    return ds


def about(d):
    """One plain sentence saying what a dataset holds, so an assistant knows what to expect before it opens it."""
    parts = []
    if d.get('rows') is not None:
        parts.append(f"{d['rows']:,} row{'s' if d['rows'] != 1 else ''}")
    elif d.get('type') == 'file':
        parts.append('a file (not queryable: download it)')
    if d.get('first'):
        parts.append(f"{d['date_field']} from {d['first']} to {d['last']}")
    elif d.get('period_stated'):
        parts.append(f"covers {d['period_stated']}")
    g = d.get('geography') or []
    by = [x for x in g if x in ('community', 'ward', 'quadrant')]
    if by:
        parts.append('by ' + ', '.join(by))
    shapes = [x for x in g if x in ('points', 'lines', 'areas')]
    if shapes:
        parts.append('mapped as ' + ' and '.join(shapes))
    if d.get('frequency'):
        parts.append(f"updated {str(d['frequency']).lower()}")
    if d.get('updated'):
        parts.append(f"last updated {d['updated']}")
    if d.get('business_unit'):
        parts.append(f"from {d['business_unit']}")
    return f"{d.get('name')}: " + '; '.join(parts) + '.' if parts else d.get('name') or ''


def map_layers():
    """Every data layer on the City's map server: service, layer id and name, its fields and how many features it has."""
    out = []

    def walk(path=''):
        try:
            d = _get(GIS + path + '?f=json', 60)
        except Exception:                          # noqa: BLE001 - a folder that does not answer is left out
            return
        for f in d.get('folders') or []:
            walk(f)
        for s in d.get('services') or []:
            svc = f"{s['name']}/{s['type']}"
            if s['type'] != 'MapServer' or any(k in svc for k in SKIP_GIS):
                continue
            try:
                m = _get(GIS + svc + '?f=json', 60)
            except Exception:                      # noqa: BLE001
                continue
            for lay in m.get('layers') or []:
                if lay.get('subLayerIds') or 'Annotation' in (lay.get('name') or ''):
                    continue
                entry = {'service': svc, 'layer': lay.get('id'), 'name': (lay.get('name') or '').strip(),
                         'description': _text(m.get('serviceDescription') or m.get('description'))[:300]}
                try:
                    lm = _get(f"{GIS}{svc}/{lay['id']}?f=json", 60)
                    entry['fields'] = [f"{f['name']}:{f.get('type', '').replace('esriFieldType', '')}" for f in lm.get('fields') or []][:60]
                    entry['geometry'] = (lm.get('geometryType') or '').replace('esriGeometry', '').lower() or None
                    n = _get(f"{GIS}{svc}/{lay['id']}/query?" + urllib.parse.urlencode({'where': '1=1', 'returnCountOnly': 'true', 'f': 'json'}), 60)
                    entry['features'] = n.get('count')
                except Exception:                  # noqa: BLE001
                    pass
                entry['on_site'] = 'PavementRehabPlan' in svc
                entry['about'] = (f"{entry['name']} (City map layer {svc} layer {lay['id']}): "
                                  + (f"{entry['features']:,} features" if isinstance(entry.get('features'), int) else 'size unknown')
                                  + (f", {entry['geometry']}s" if entry.get('geometry') else '') + '; read with query_map_layer.')
                out.append(entry)

    walk()
    return out


def build():
    ds = profile(datasets())
    errors = {}
    try:
        layers = map_layers()
    except Exception as e:                         # noqa: BLE001 - the catalogue stands without the map server
        layers, errors['map_layers'] = [], str(e)[:200]
    cats = {}
    for d in ds:
        cats[d['category']] = cats.get(d['category'], 0) + 1
    return {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'note': ("The City of Calgary's whole open data catalogue (every dataset and data file on data.calgary.ca) and every "
                     "data layer on its map server, rebuilt every night. on_site: a page of Calgary Insight already reads it. "
                     "Every dataset here can be read with describe_dataset and query_dataset; map layers with query_map_layer."),
            'counts': {'datasets': len(ds), 'on_site': sum(1 for d in ds if d['on_site']), 'map_layers': len(layers),
                       'by_category': dict(sorted(cats.items(), key=lambda kv: -kv[1]))},
            'datasets': ds, 'map_layers': layers, 'errors': errors,
            'sources': [{'title': 'City of Calgary open data catalogue', 'publisher': 'City of Calgary', 'url': 'https://data.calgary.ca/browse'},
                        {'title': 'City of Calgary map services', 'publisher': 'City of Calgary', 'url': GIS}]}


# ----- reading it ------------------------------------------------------------------------------------------------------
_CACHE = {}


def load(data_dir=None):
    for base in (os.path.join(HERE, 'data'), data_dir):
        p = os.path.join(base or '', 'catalog.json')
        if base and os.path.isfile(p):
            m = os.path.getmtime(p)
            if _CACHE.get('path') != (p, m):
                with open(p, encoding='utf-8') as f:
                    _CACHE.update(path=(p, m), data=json.load(f))
            return _CACHE['data']
    return None


SAME = {'licence': 'license', 'licenced': 'licensed', 'centre': 'center', 'neighbourhood': 'neighborhood', 'colour': 'color',
        'kerb': 'curb', 'garbage': 'waste', 'trash': 'waste', 'sewage': 'sewer', 'wastewater': 'sewer', 'sanitary': 'sewer',
        'bus': 'transit', 'lrt': 'transit', 'ctrain': 'transit', 'tree': 'tree', 'bylaw': 'bylaw'}


def _words(text):
    w = WORD.findall(str(text or '').lower())
    w = [x[:-1] if len(x) > 4 and x.endswith('s') and not x.endswith('ss') else x for x in w]
    return [SAME.get(x, x) for x in w]


def _col(c):
    return c if isinstance(c, list) else (c.split(':') + ['', ''])[:3]     # older copies kept "field:Type"


def _brief(d, explain=False):
    out = {k: d.get(k) for k in ('id', 'name', 'about', 'category', 'geography', 'on_site') if d.get(k) not in (None, [], '')}
    out['description'] = (d.get('description') or '')[:300]
    cols = [_col(c) for c in d.get('columns') or []]
    if explain:                                   # the best matches: every column with what it means
        out['columns'] = [f"{f} ({t}){': ' + w if w else ''}" for f, t, w in cols][:50]
    else:
        out['columns'] = [f for f, _, _ in cols][:40]
    return out


def search(cat, text, category=None, limit=15):
    """Every dataset and map layer ranked by the words asked for (name counts most, then tags, columns and description)."""
    q = [w for w in _words(text) if w not in ('the', 'of', 'and', 'in', 'calgary', 'data', 'city', 'for', 'by')]
    rows = []
    for d in cat.get('datasets') or []:
        if category and category.lower() not in (d.get('category') or '').lower():
            continue
        name, tags = set(_words(d.get('name'))), set(_words(' '.join(d.get('tags') or [])))
        cols = set(_words(' '.join(' '.join(map(str, _col(c))) for c in d.get('columns') or []).replace('_', ' ')))
        desc = set(_words(d.get('description')))
        score = sum(5 * (w in name) + 3 * (w in tags) + 2 * (w in cols) + 1 * (w in desc) for w in q)
        if score or not q:
            rows.append((score + (0.5 if d.get('on_site') else 0), d))
    rows.sort(key=lambda x: (-x[0], x[1].get('name') or ''))
    layers = []
    for l in cat.get('map_layers') or []:
        words = set(_words(f"{l.get('service', '').replace('_', ' ')} {l.get('name')} {' '.join(l.get('fields') or [])}"))
        s = sum(w in words for w in q)
        if s:
            layers.append((s, l))
    layers.sort(key=lambda x: -x[0])
    return {'matches': len(rows), 'datasets': [_brief(d, explain=i < 3) for i, (_, d) in enumerate(rows[:limit])],
            'map_layers': [{k: l.get(k) for k in ('service', 'layer', 'name', 'features', 'geometry', 'fields')} for _, l in layers[:6]],
            'note': (f"{len(rows)} of the City's {len(cat.get('datasets') or [])} datasets match; the best {min(limit, len(rows))} are shown. "
                     'Search again with other words, or browse a category (search_datasets category=...), to find every dataset that bears on the subject.')}


def browse(cat, category=None):
    """The categories with their counts, or every dataset in one category (id, name, last update)."""
    ds = cat.get('datasets') or []
    if not category:
        return {'categories': (cat.get('counts') or {}).get('by_category'), 'datasets': len(ds),
                'map_layers': [f"{l['service']} layer {l['layer']}: {l['name']}" for l in cat.get('map_layers') or []],
                'note': 'search_datasets category=<name> lists every dataset in a category.'}
    hit = [d for d in ds if category.lower() in (d.get('category') or '').lower()]
    return {'category': category, 'count': len(hit),
            'datasets': [f"{d['id']} - {(d.get('about') or d['name'])[:150]}{' (on site)' if d.get('on_site') else ''}" for d in hit[:70]],
            **({'note': f'The first 70 of {len(hit)}; add words (search_datasets query=... category=...) to narrow.'} if len(hit) > 70 else {})}


def _when(v):
    return dt.datetime.fromtimestamp(v / 1000, dt.timezone.utc).strftime('%Y-%m-%d') if isinstance(v, (int, float)) and v > 1e11 else v


def map_query(service, layer, where=None, fields=None, group_by=None, count_only=False, order=None, limit=200, get=None):
    """Rows, counts or counts by group from one layer of the City's map server (dates as YYYY-MM-DD)."""
    service = str(service or '').strip().strip('/')
    if not re.fullmatch(r'pub_[A-Za-z0-9_]+/[A-Za-z0-9_]+/MapServer', service):
        raise ValueError('service looks like pub_Roads/Capital_Works/MapServer (see map_layers in search_datasets).')
    get = get or _get
    base = f"{GIS}{service}/{int(layer)}/query?"
    q = {'where': where or '1=1', 'f': 'json'}
    if count_only:
        return {'count': get(base + urllib.parse.urlencode({**q, 'returnCountOnly': 'true'}), 60).get('count')}
    if group_by:
        groups = [g.strip() for g in str(group_by).split(',') if g.strip()]
        meta = get(f"{GIS}{service}/{int(layer)}?f=json", 60)
        oid = next((f['name'] for f in meta.get('fields') or [] if f.get('type') == 'esriFieldTypeOID'), 'OBJECTID')
        q.update({'groupByFieldsForStatistics': ','.join(groups),
                  'outStatistics': json.dumps([{'statisticType': 'count', 'onStatisticField': oid, 'outStatisticFieldName': 'n'}])})
    else:
        q.update({'outFields': fields or '*', 'returnGeometry': 'false', 'resultRecordCount': max(1, min(int(limit or 200), 1000))})
        if order:
            q['orderByFields'] = order
    d = get(base + urllib.parse.urlencode(q), 60)
    if d.get('error'):
        raise ValueError(f"The map server refused the query: {(d['error'] or {}).get('message')} {(d['error'] or {}).get('details') or ''}")
    rows = [{k: _when(v) for k, v in (f.get('attributes') or {}).items()} for f in d.get('features') or []]
    rows = [{('n' if k.lower() == 'n' else k): v for k, v in r.items()} for r in rows]
    if group_by:                                  # largest groups first
        rows.sort(key=lambda r: -(r.get('n') or 0))
    return {'row_count': len(rows), 'rows': rows, **({'more': True} if d.get('exceededTransferLimit') else {})}


if __name__ == '__main__':
    res = build()
    with open(sys.argv[1] if len(sys.argv) > 1 else 'catalog.json', 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, separators=(',', ':'))
    print(res['counts'])
