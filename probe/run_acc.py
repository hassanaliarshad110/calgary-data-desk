import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import accountability
t = time.time(); d = accountability.build()
json.dump(d, open(os.path.join(out, 'accountability.json'), 'w'), separators=(',', ':'))
print('seconds', round(time.time() - t), d['errors'])
s = {k: (v and {kk: (len(vv) if isinstance(vv, (list, dict)) else vv) for kk, vv in v.items()}) if isinstance(v, dict) else v for k, v in d.items() if k != 'sources'}
print(json.dumps(s, default=str)[:3000])
print('MEASURES', (d.get('city_measures') or {}).get('name'), list(((d.get('city_measures') or {}).get('rows') or [{}])[0].keys()))
print('BILLS', json.dumps(((d.get('bills') or {}).get('calgary') or [])[:20])[:2500])
# parks: does the City publish each park's area?
import calgary_data as cd, urllib.request
for ds in ('kami-qbfh',):
    try:
        meta = json.loads(urllib.request.urlopen(f'https://data.calgary.ca/api/views/{ds}.json', timeout=60).read())
        print('PARKCOLS', ds, meta.get('name'), [(c['fieldName'], c.get('dataTypeName'), (c.get('description') or '')[:80]) for c in meta.get('columns', [])])
        rows = cd.query(ds, limit=3)
        print('PARKROW', json.dumps([{k: (v if k != 'the_geom' else '...') for k, v in r.items()} for r in rows])[:1500])
    except Exception as e:
        print('PARKERR', ds, e)
try:
    cat = json.loads(urllib.request.urlopen('https://data.calgary.ca/api/catalog/v1?q=park%20area%20hectares&only=dataset&limit=15&domains=data.calgary.ca', timeout=60).read())
    print('PARKCAT', [(x['resource']['id'], x['resource']['name']) for x in cat.get('results', [])])
except Exception as e:
    print('PARKCATERR', e)
