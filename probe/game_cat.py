import json, os, sys, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); res = {}
def get(u, n=None):
    r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryGameMap/1.0', **({'Range': f'bytes=0-{n}'} if n else {})}), timeout=120)
    return r, r.read(n + 1 if n else None)
for ds in ['eink-tu9p', 'cchr-krqg']:
    try:
        r, b = get(f'https://data.calgary.ca/api/views/{ds}.json')
        v = json.loads(b); res[ds] = {k: v.get(k) for k in ('name', 'description', 'blobFilename', 'blobFileSize', 'blobId', 'blobMimeType', 'rowsUpdatedAt', 'viewType', 'assetType')}
        res[ds]['columns'] = [(c.get('fieldName'), c.get('description')) for c in v.get('columns', [])]
    except Exception as e: res[ds] = str(e)
try:
    r, b = get('https://data.calgary.ca/resource/cchr-krqg.json?$limit=3'); res['bld_sample'] = json.loads(b)
    r, b = get('https://data.calgary.ca/resource/cchr-krqg.json?$select=count(*)'); res['bld_count'] = json.loads(b)
except Exception as e: res['bld_err'] = str(e)
for u in ['https://data.calgary.ca/download/eink-tu9p/application%2Fzip', 'https://data.calgary.ca/api/views/eink-tu9p/files']:
    try:
        r, b = get(u, 2000); res['dl ' + u] = {'status': r.status, 'headers': dict(r.headers), 'head': b[:300].decode('latin1')}
    except Exception as e: res['dl ' + u] = str(e)
json.dump(res, open(os.path.join(OUT, 'catalog.json'), 'w'), indent=1, default=str)
