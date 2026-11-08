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
        cols = [f"{f}:{t}" for f, t in zip(r.get('columns_field_name') or [], r.get('columns_datatype') or []) if not f.startswith(':')]
        out.append({'id': r['id'], 'name': (r.get('name') or '').strip(), 'type': r['type'],
                    'category': c.get('domain_category') or 'Other', 'tags': c.get('domain_tags') or [],
                    'description': _text(r.get('description'))[:500],
                    'updated': (r.get('data_updated_at') or r.get('updatedAt') or '')[:10],
                    'created': (r.get('createdAt') or '')[:10],
                    'business_unit': meta.get('Data-Supplier_Business-Unit') or None,
                    'frequency': meta.get('Update-Frequency_Frequency') or meta.get('Data-Frequency_Update-Frequency') or None,
                    'columns': cols[:80], 'views_month': (r.get('page_views') or {}).get('page_views_last_month'),
                    'url': f"https://data.calgary.ca/d/{r['id']}", 'on_site': r['id'] in used})
    out.sort(key=lambda x: (x['category'], x['name']))
    return out


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
                out.append(entry)

    walk()
    return out


def build():
    ds = datasets()
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


def _brief(d, cols=True):
    out = {k: d.get(k) for k in ('id', 'name', 'category', 'updated', 'on_site')}
    out['description'] = (d.get('description') or '')[:300]
    if cols:
        out['columns'] = [c.split(':')[0] for c in d.get('columns') or []][:40]
    return out


def search(cat, text, category=None, limit=15):
    """Every dataset and map layer ranked by the words asked for (name counts most, then tags, columns and description)."""
    q = [w for w in _words(text) if w not in ('the', 'of', 'and', 'in', 'calgary', 'data', 'city', 'for', 'by')]
    rows = []
    for d in cat.get('datasets') or []:
        if category and category.lower() not in (d.get('category') or '').lower():
            continue
        name, tags = set(_words(d.get('name'))), set(_words(' '.join(d.get('tags') or [])))
        cols, desc = set(_words(' '.join(d.get('columns') or []).replace('_', ' '))), set(_words(d.get('description')))
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
    return {'matches': len(rows), 'datasets': [_brief(d) for _, d in rows[:limit]],
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
            'datasets': [[d['id'], d['name'], d.get('updated'), 'on site' if d.get('on_site') else ''] for d in hit]}


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
