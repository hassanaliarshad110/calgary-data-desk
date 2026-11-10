# Day trips from Calgary: an openly licensed photo (Wikimedia Commons, via each place's Wikipedia article), the road
# route from downtown (OSRM on OpenStreetMap) and a check that each official link answers.
import json, io, re, time, requests
from PIL import Image
UA = {'User-Agent': 'CalgaryInsight/1.0 (https://calgaryinsight.ca; hello@calgaryinsight.ca)'}
P = [  # place, Wikipedia article, official links, lat, lon
 ('Cochrane', 'Cochrane, Alberta', ['https://www.cochrane.ca/'], 51.1890, -114.4670),
 ('Big Hill Springs Provincial Park', 'Big Hill Springs Provincial Park', ['https://www.albertaparks.ca/parks/south/big-hill-springs-pp/'], 51.2490, -114.3860),
 ('Bragg Creek', 'Bragg Creek', ['https://www.albertaparks.ca/parks/kananaskis/bragg-creek-pp/'], 50.9476, -114.5705),
 ('Okotoks Big Rock erratic', 'Okotoks Erratic', ['https://www.alberta.ca/okotoks-erratic-big-rock-provincial-historic-site'], 50.7040, -114.1490),
 ('Forget-Me-Not Pond (Kananaskis)', 'Forget-me-not Pond', ['https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/'], 50.7962, -114.8063),
 ('Kananaskis Village', 'Kananaskis Village', ['https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/'], 50.9300, -115.1530),
 ('Canmore', 'Canmore, Alberta', ['https://www.explorecanmore.ca/'], 51.0884, -115.3479),
 ('Horseshoe Canyon (Drumheller)', 'Horseshoe Canyon (Alberta)', ['https://traveldrumheller.com/'], 51.4200, -112.8700),
 ('Blackfoot Crossing Historical Park', 'Blackfoot Crossing Historical Park', ['https://www.blackfootcrossing.ca/'], 50.7680, -112.8880),
 ('Banff (town)', 'Banff, Alberta', ['https://parks.canada.ca/pn-np/ab/banff'], 51.1784, -115.5708),
 ('Peter Lougheed Provincial Park', 'Peter Lougheed Provincial Park', ['https://www.albertaparks.ca/parks/kananaskis/peter-lougheed-pp/'], 50.6900, -115.1200),
 ('Royal Tyrrell Museum (Drumheller)', 'Royal Tyrrell Museum of Palaeontology', ['https://www.tyrrellmuseum.com/'], 51.4790, -112.7900),
 ('Head-Smashed-In Buffalo Jump', 'Head-Smashed-In Buffalo Jump', ['https://www.headsmashedin.ca/'], 49.7484, -113.6255),
 ('Lake Louise (lake)', 'Lake Louise (Alberta)', ['https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise'], 51.4167, -116.2156),
 ('Moraine Lake', 'Moraine Lake', ['https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise'], 51.3217, -116.1860),
 ('Yoho National Park (Field, BC)', 'Yoho National Park', ['https://parks.canada.ca/pn-np/bc/yoho'], 51.3955, -116.4910),
 ('Waterton Lakes National Park (townsite)', 'Waterton Lakes National Park', ['https://parks.canada.ca/pn-np/ab/waterton'], 49.0517, -113.9136),
 ('Dinosaur Provincial Park', 'Dinosaur Provincial Park', ['https://www.albertaparks.ca/parks/south/dinosaur-pp/'], 50.7540, -111.5070),
 ('Glacier National Park, Montana (St. Mary)', 'Glacier National Park (U.S.)', ['https://www.nps.gov/glac/'], 48.7470, -113.4400),
 ('Kootenay National Park (Radium gate, BC)', 'Kootenay National Park', ['https://parks.canada.ca/pn-np/bc/kootenay'], 50.6205, -116.0710),
 ('Columbia Icefield Centre', 'Columbia Icefield', ['https://parks.canada.ca/pn-np/ab/jasper/visit/les10-top10/glacier-athabasca'], 52.2196, -117.2235),
 ("Writing-on-Stone Provincial Park (Áísínai'pi)", 'Writing-on-Stone Provincial Park', ['https://www.albertaparks.ca/parks/south/writing-on-stone-pp/'], 49.0830, -111.6230),
 ('Jasper (town)', 'Jasper, Alberta', ['https://parks.canada.ca/pn-np/ab/jasper'], 52.8737, -118.0814),
]
OK_LIC = re.compile(r'^(CC0|CC BY|CC-BY|Public domain|PD|Attribution)', re.I)
def get(u, **k):
    for i in range(3):
        try:
            r = requests.get(u, headers=UA, timeout=30, **k)
            if r.status_code == 200: return r
            print('  ', r.status_code, u[:120])
        except Exception as e: print('  err', e, u[:120])
        time.sleep(2)
def clean(h): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()
def images(title):
    # the article's lead image first, then the other pictures in the article
    out = []
    s = get('https://en.wikipedia.org/api/rest_v1/page/summary/' + requests.utils.quote(title.replace(' ', '_')))
    if s:
        j = s.json(); src = (j.get('originalimage') or {}).get('source')
        if src: out.append(requests.utils.unquote(src.split('/')[-1]))
        extract = j.get('extract')
    else: extract = None
    m = get('https://en.wikipedia.org/api/rest_v1/page/media-list/' + requests.utils.quote(title.replace(' ', '_')))
    if m:
        for it in m.json().get('items', []):
            if it.get('type') == 'image' and it.get('title', '').startswith('File:'):
                n = it['title'][5:]
                if n not in out and not re.search(r'\.(svg|gif)$|map|locator|logo|flag|coat|seal', n, re.I): out.append(n)
    return out, extract
res = []
for place, title, links, lat, lon in P:
    print(place)
    rec = {'place': place, 'wikipedia': 'https://en.wikipedia.org/wiki/' + title.replace(' ', '_'), 'photos': [], 'links': []}
    names, extract = images(title)
    rec['wiki_extract'] = extract
    for n in names[:8]:
        if len(rec['photos']) >= 3: break
        q = get('https://commons.wikimedia.org/w/api.php', params={'action': 'query', 'titles': 'File:' + n, 'prop': 'imageinfo',
                'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 900, 'format': 'json'})
        if not q: continue
        pg = list(q.json()['query']['pages'].values())[0]
        ii = (pg.get('imageinfo') or [None])[0]
        if not ii or ii.get('mime') not in ('image/jpeg', 'image/png') or ii.get('width', 0) < 600: continue
        md = ii.get('extmetadata') or {}
        lic = clean((md.get('LicenseShortName') or {}).get('value'))
        if not OK_LIC.match(lic): print('  skip licence', lic, n); continue
        r = get(ii.get('thumburl') or ii['url'])
        if not r: continue
        im = Image.open(io.BytesIO(r.content)).convert('RGB'); im.thumbnail((900, 600))
        fn = f'img_{len(res):02d}_{len(rec["photos"])}.jpg'; im.save('out/' + fn, quality=80, optimize=True, progressive=True)
        rec['photos'].append({'file': fn, 'name': n, 'page': ii.get('descriptionurl'), 'licence': lic,
                              'licence_url': clean((md.get('LicenseUrl') or {}).get('value')), 'artist': clean((md.get('Artist') or {}).get('value'))[:120],
                              'caption': clean((md.get('ImageDescription') or {}).get('value'))[:200]})
    o = get(f'https://router.project-osrm.org/route/v1/driving/-114.0719,51.0447;{lon},{lat}', params={'steps': 'true', 'overview': 'simplified', 'geometries': 'geojson'})
    if o:
        rt = o.json()['routes'][0]
        rec['route'] = {'km': round(rt['distance'] / 1000), 'minutes': round(rt['duration'] / 60), 'line': [[round(y, 4), round(x, 4)] for x, y in rt['geometry']['coordinates']],
                        'steps': [{'m': round(s['distance']), 'name': s.get('name') or '', 'ref': s.get('ref') or '', 'type': s['maneuver']['type'],
                                   'mod': s['maneuver'].get('modifier', ''), 'exits': s['maneuver'].get('exit')} for s in rt['legs'][0]['steps']]}
    for u in links:
        r = None
        try: r = requests.get(u, headers=UA, timeout=30, allow_redirects=True)
        except Exception as e: print('  link err', u, e)
        rec['links'].append({'url': u, 'status': r.status_code if r is not None else None, 'final': r.url if r is not None else None,
                             'title': (re.search(r'<title[^>]*>(.*?)</title>', r.text, re.S | re.I).group(1).strip()[:120] if r is not None and r.status_code == 200 and re.search(r'<title', r.text, re.I) else None)})
    print('  photos', len(rec['photos']), 'route', bool(rec.get('route')), [l['status'] for l in rec['links']])
    res.append(rec)
    time.sleep(1)
json.dump(res, open('out/trips.json', 'w'), ensure_ascii=False, indent=1)
