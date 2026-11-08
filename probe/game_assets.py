import json, os, re, sys, urllib.request, urllib.parse
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (YYC Story data probe)'}
tok = os.environ.get('SOCRATA_TOKEN') or ''
log = []
def get(url, n=6_000_000, head=False):
    try:
        h = dict(UA); 
        if 'data.calgary.ca' in url and tok: h['X-App-Token'] = tok
        req = urllib.request.Request(url, headers=h, method='HEAD' if head else 'GET')
        r = urllib.request.urlopen(req, timeout=90); b = b'' if head else r.read(n)
        log.append(f'OK {r.status} {len(b)} {r.headers.get("Content-Length")} {r.headers.get("Content-Type")} {url}'); return b
    except Exception as e:
        log.append(f'ERR {url} {e}'); return b''
def save(name, b): open(f'{OUT}/{name}', 'wb').write(b)
save('cchr_meta.json', get('https://data.calgary.ca/api/views/cchr-krqg.json'))
save('cchr_rows.json', get('https://data.calgary.ca/resource/cchr-krqg.json?$limit=3'))
save('scene_layer.json', get('https://tiles.arcgis.com/tiles/AVP60cs0Q9PEA8rH/arcgis/rest/services/CALGIS_BUILDING_3D/SceneServer?f=json'))
save('scene_layer0.json', get('https://tiles.arcgis.com/tiles/AVP60cs0Q9PEA8rH/arcgis/rest/services/CALGIS_BUILDING_3D/SceneServer/layers/0?f=json'))
save('webscene_light.json', get('https://www.arcgis.com/sharing/rest/content/items/b232d5ec292a411da6e53d710fe0f6a2/data?f=json'))
save('webscene_light_item.json', get('https://www.arcgis.com/sharing/rest/content/items/b232d5ec292a411da6e53d710fe0f6a2?f=json'))
save('app_item.json', get('https://www.arcgis.com/sharing/rest/content/items/60083b2a2c074644a725a22094e48763/data?f=json'))
save('bld3d_item.json', get('https://www.arcgis.com/sharing/rest/content/items/089f88ddfd8544af8db55dbdd16b8cab?f=json'))
for q in ['parcel address', 'address points', 'Building Roof Outlines']:
    b = get('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': q, 'domains': 'data.calgary.ca', 'limit': 15}))
    try:
        rs = [(r['resource']['id'], r['resource']['name'], r['resource'].get('type'), r['resource'].get('columns_name', [])[:20], r['resource'].get('description', '')[:300]) for r in json.loads(b)['results']]
        save('cat_' + q.replace(' ', '_') + '.json', json.dumps(rs, indent=1).encode())
    except Exception as e: log.append(f'cat {q} {e}')
open(f'{OUT}/log.txt', 'w').write('\n'.join(log))
