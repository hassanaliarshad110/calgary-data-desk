"""Build data/visit.json for real (weather since 1885, OpenStreetMap places), check every link it names, and test
whether the ECCC API allows browser requests from the site (CORS)."""
import json, os, re, sys, time, urllib.request, urllib.error
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'code'))
import visit
out = sys.argv[1]; os.makedirs(out + '/data', exist_ok=True)
t0 = time.time()
cache = '_cache'; os.makedirs(cache, exist_ok=True)
v = visit.build(cache, force=True)
json.dump(v, open(out + '/data/visit.json', 'w'), separators=(',', ':'))
print('visit.json', os.path.getsize(out + '/data/visit.json'), 'bytes in', round(time.time() - t0), 's; errors', v.get('errors'))
w = v.get('weather') or {}
print('normals', [(n['name'][:3], n['high'], n['low']) for n in w.get('normals', [])])
print('years', len(w.get('years', [])), 'records', json.dumps(w.get('records'))[:600])
print('today', json.dumps(w.get('today'))[:400])
print('places: top', len(v.get('top', [])), 'sights', len(v.get('sights', [])), 'stays', len(v.get('stays', [])), 'areas', json.dumps(v.get('areas'))[:800])
# links
urls = set(re.findall(r'https?://[^\s\'"]+', open(os.path.join(os.path.dirname(__file__), 'code', 'visit.py')).read()))
bad = {}
for u in sorted(urls):
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept': 'text/html,*/*'})
        with urllib.request.urlopen(req, timeout=25) as r:
            code = r.getcode(); final = r.geturl()
        if final.rstrip('/') != u.rstrip('/'):
            bad[u] = f'{code} -> {final}'
    except urllib.error.HTTPError as e:
        bad[u] = f'HTTP {e.code}'
    except Exception as e:
        bad[u] = f'{type(e).__name__}: {str(e)[:80]}'
json.dump(bad, open(out + '/visit_links.json', 'w'), indent=1)
print('links checked', len(urls), 'problems', len(bad))
# CORS on the ECCC API and Overpass
for u in ('https://api.weather.gc.ca/collections/citypageweather-realtime/items/ab-52?f=json&lang=en', 'https://api.weather.gc.ca/collections/climate-daily/items?f=json&limit=1'):
    try:
        req = urllib.request.Request(u, headers={'Origin': 'https://calgaryinsight.ca', 'User-Agent': 'CalgaryInsight/1.0'})
        with urllib.request.urlopen(req, timeout=30) as r:
            print('CORS', u[:70], 'ACAO=', r.headers.get('Access-Control-Allow-Origin'))
    except Exception as e:
        print('CORS fail', u[:70], e)
