import json, os, sys, subprocess, collections, struct
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'overturemaps'], check=True)
from overturemaps import core
import pyarrow as pa
bbox = (-114.32, 50.84, -113.85, 51.22)
rdr = core.record_batch_reader('place', bbox)
rows, cats, schema = [], collections.Counter(), None
for batch in rdr:
    if schema is None:
        schema = str(batch.schema)
    for r in batch.to_pylist():
        g = r.get('geometry')
        lon = lat = None
        if isinstance(g, (bytes, bytearray)) and len(g) >= 21:
            bo = '<' if g[0] == 1 else '>'
            lon, lat = struct.unpack(bo + 'dd', g[5:21])
        c = (r.get('categories') or {}).get('primary')
        bc = r.get('basic_category')
        cats[(c, bc)] += 1
        rows.append({'name': ((r.get('names') or {}).get('primary')), 'cat': c, 'basic': bc, 'alt': (r.get('categories') or {}).get('alternate'),
                     'conf': r.get('confidence'), 'status': r.get('operating_status'), 'web': (r.get('websites') or [None])[0],
                     'phone': (r.get('phones') or [None])[0], 'addr': ((r.get('addresses') or [{}])[0] or {}).get('freeform'),
                     'brand': (((r.get('brand') or {}).get('names') or {}) or {}).get('primary'), 'lon': lon, 'lat': lat})
json.dump({'schema': schema, 'n': len(rows), 'cats': [[a, b, n] for (a, b), n in cats.most_common()], 'rows': rows}, open(os.path.join(out, 'overture.json'), 'w'))
print(len(rows)); print(schema[:3000]); print(cats.most_common(60))
