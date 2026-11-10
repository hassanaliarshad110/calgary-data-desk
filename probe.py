import json, io, re, time, requests
from PIL import Image
UA = {'User-Agent': 'CalgaryInsight/1.0 (https://calgaryinsight.ca; hello@calgaryinsight.ca)'}
OK_LIC = re.compile(r'^(CC0|CC BY|CC-BY|Public domain|PD|Attribution)', re.I)
def clean(h): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()
def get(u, **k):
    try:
        r = requests.get(u, headers=UA, timeout=30, **k); return r if r.status_code == 200 else None
    except Exception as e: print('err', e)
out = {}
for key, q in [('fmn', 'Forget-me-not Pond Kananaskis'), ('fmn2', 'Forget me not pond Alberta'), ('fmn3', 'Little Elbow Kananaskis'), ('bfc', 'Blackfoot Crossing Historical Park'),
               ('bfc2', 'Blackfoot Crossing Siksika'), ('ll', 'Lake Louise Alberta Chateau lake'), ('coch', 'Cochrane Alberta'), ('kv', 'Kananaskis Village')]:
    s = get('https://commons.wikimedia.org/w/api.php', params={'action': 'query', 'list': 'search', 'srsearch': q + ' filetype:bitmap', 'srnamespace': 6, 'srlimit': 15, 'format': 'json'})
    names = [x['title'][5:] for x in (s.json()['query']['search'] if s else [])]
    print(key, names)
    out[key] = []
    for n in names:
        if len(out[key]) >= 6: break
        r = get('https://commons.wikimedia.org/w/api.php', params={'action': 'query', 'titles': 'File:' + n, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 900, 'format': 'json'})
        if not r: continue
        ii = (list(r.json()['query']['pages'].values())[0].get('imageinfo') or [None])[0]
        if not ii or ii.get('mime') not in ('image/jpeg', 'image/png') or ii.get('width', 0) < 600: continue
        md = ii.get('extmetadata') or {}
        lic = clean((md.get('LicenseShortName') or {}).get('value'))
        if not OK_LIC.match(lic): continue
        im = get(ii.get('thumburl') or ii['url'])
        if not im: continue
        p = Image.open(io.BytesIO(im.content)).convert('RGB'); p.thumbnail((900, 600))
        fn = f'x_{key}_{len(out[key])}.jpg'; p.save('out/' + fn, quality=80, optimize=True, progressive=True)
        out[key].append({'file': fn, 'name': n, 'page': ii.get('descriptionurl'), 'licence': lic, 'licence_url': clean((md.get('LicenseUrl') or {}).get('value')),
                         'artist': clean((md.get('Artist') or {}).get('value'))[:120], 'caption': clean((md.get('ImageDescription') or {}).get('value'))[:200],
                         'lat': (md.get('GPSLatitude') or {}).get('value'), 'lon': (md.get('GPSLongitude') or {}).get('value')})
links = {}
for u in ['https://www.albertaparks.ca/parks/central/big-hill-springs-pp/', 'https://albertaparks.ca/parks/central/big-hill-springs-pp/', 'https://www.albertaparks.ca/parks/kananaskis/big-hill-springs-pp/',
          'https://www.alberta.ca/okotoks-erratic', 'https://www.alberta.ca/okotoks-erratic-provincial-historic-site', 'https://www.okotoks.ca/big-rock', 'https://www.okotoks.ca/',
          'https://parks.canada.ca/pn-np/ab/jasper/activ/explorer-explore/glacier-athabasca', 'https://parks.canada.ca/pn-np/ab/jasper/visit/les10-top10/athabasca',
          'https://www.banffjaspercollection.com/attractions/columbia-icefield/', 'https://parks.canada.ca/pn-np/ab/jasper/visit/promenade-des-glaciers-icefields-parkway',
          'https://www.albertaparks.ca/parks/kananaskis/elbow-sheep-wildland-ppark/', 'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/',
          'https://www.alberta.ca/kananaskis-conservation-pass', 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise', 'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/']:
    try:
        r = requests.get(u, headers=UA, timeout=30); t = re.search(r'<title[^>]*>(.*?)</title>', r.text, re.S | re.I)
        links[u] = [r.status_code, r.url, t.group(1).strip()[:120] if t else None]
    except Exception as e: links[u] = [None, str(e)]
    print(u, links[u])
json.dump({'photos': out, 'links': links}, open('out/more.json', 'w'), ensure_ascii=False, indent=1)
