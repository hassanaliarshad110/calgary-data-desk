"""Second pass: rebuild visit.json with the wider areas, check every link again (following redirects), and geocode
the hand-placed sights with Nominatim to confirm their positions (distance between my point and Nominatim's)."""
import json, os, re, sys, time, math, urllib.request, urllib.error, urllib.parse
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'code'))
import visit
out = sys.argv[1]; os.makedirs(out + '/data', exist_ok=True)
cache = '_cache'; os.makedirs(cache, exist_ok=True)
v = visit.build(cache, force=True)
json.dump(v, open(out + '/data/visit.json', 'w'), separators=(',', ':'))
print('visit.json', os.path.getsize(out + '/data/visit.json'), 'errors', v.get('errors'))
print('areas', [(a['area'], a['stays'], a['sights']) for a in v['areas']])
urls = set(re.findall(r'https?://[^\s\'"]+', open(os.path.join(os.path.dirname(__file__), 'code', 'visit.py')).read()))
bad = {}
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
for u in sorted(urls):
    if 'overpass' in u or 'api.weather.gc.ca' in u: continue
    try:
        req = urllib.request.Request(u, headers={'User-Agent': UA, 'Accept': 'text/html,*/*'})
        with urllib.request.urlopen(req, timeout=25) as r:
            code = r.getcode(); final = r.geturl()
        if final.rstrip('/') != u.rstrip('/'): bad[u] = f'{code} -> {final}'
    except urllib.error.HTTPError as e: bad[u] = f'HTTP {e.code}'
    except Exception as e: bad[u] = f'{type(e).__name__}: {str(e)[:80]}'
json.dump(bad, open(out + '/visit_links.json', 'w'), indent=1)
print('links', len(urls), 'problems', len(bad), json.dumps(bad, indent=1))
# geocode the hand-placed sights
geo = {}
def hav(a, b, c, d):
    p = math.pi / 180; x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(x))
for p in v['top']:
    q = p['name'].split(',')[0].split(' and ')[0].split(' / ')[0]
    try:
        u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q + ', Calgary, Alberta', 'format': 'json', 'limit': 1})
        req = urllib.request.Request(u, headers={'User-Agent': 'CalgaryInsight/1.0 (civic open data; check of sight positions)'})
        with urllib.request.urlopen(req, timeout=30) as r:
            res = json.loads(r.read().decode())
        if res:
            lat, lon = float(res[0]['lat']), float(res[0]['lon'])
            geo[p['id']] = {'q': q, 'found': res[0].get('display_name', '')[:90], 'lat': lat, 'lon': lon, 'mine': [p['lat'], p['lon']], 'metres': round(hav(p['lat'], p['lon'], lat, lon)), 'matched_osm': bool(p.get('osm'))}
        else:
            geo[p['id']] = {'q': q, 'found': None}
    except Exception as e:
        geo[p['id']] = {'q': q, 'error': str(e)[:80]}
    time.sleep(1.2)
json.dump(geo, open(out + '/visit_geo.json', 'w'), indent=1)
for k, g in geo.items():
    print(k, g.get('metres'), g.get('found'))
