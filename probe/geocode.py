import json, os, sys, time, re, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
P = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'help_places.json')))
UA = {'User-Agent': 'CalgaryDataDesk/1.0 (civic data dashboard; github.com/hassanaliarshad110)'}
def get(u, t=60):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
        return json.loads(r.read().decode('utf-8'))
ABBR = [(r'\bAve\b\.?', 'AV'), (r'\bSt\b\.?', 'ST'), (r'\bRd\b\.?', 'RD'), (r'\bDr\b\.?', 'DR'), (r'\bBlvd\b\.?', 'BV'), (r'\bWay\b', 'WY'), (r'\bTr\b', 'TR'), (r'\bCres\b', 'CR')]
def city_form(a):
    s = a
    for pat, rep in ABBR:
        s = re.sub(pat, rep, s)
    return s.upper().replace('.', '').replace(',', '')
res = []
for p in P:
    r = dict(p)
    if p.get('address'):
        a = city_form(p['address'])
        try:
            rows = get('https://data.calgary.ca/resource/9zvu-p8uz.json?' + urllib.parse.urlencode({'$where': f"upper(address)='{a}'", '$limit': 3}))
        except Exception as e:
            rows = []; r['geo_err'] = str(e)[:80]
        if rows and rows[0].get('latitude'):
            r['lat'], r['lon'], r['geo'] = float(rows[0]['latitude']), float(rows[0]['longitude']), 'City of Calgary parcel address'
            r['geo_match'] = rows[0].get('address')
        else:
            try:
                time.sleep(1.2)
                g = get('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': p['address'] + ', Calgary, Alberta', 'format': 'json', 'limit': 1, 'countrycodes': 'ca'}))
                if g:
                    r['lat'], r['lon'], r['geo'] = float(g[0]['lat']), float(g[0]['lon']), 'OpenStreetMap Nominatim'
                    r['geo_match'] = g[0].get('display_name')
            except Exception as e:
                r['geo_err'] = str(e)[:80]
    if p.get('url'):
        try:
            req = urllib.request.Request(p['url'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as resp:
                r['url_status'] = resp.status; r['url_final'] = resp.geturl()
        except Exception as e:
            r['url_status'] = str(e)[:80]
    res.append(r)
    print(r['id'], r.get('lat'), r.get('lon'), r.get('geo'), r.get('geo_match'), r.get('url_status'))
json.dump(res, open(os.path.join(out, 'help_geo.json'), 'w'), indent=1)
