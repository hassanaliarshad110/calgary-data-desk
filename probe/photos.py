"""Candidate free-licence photographs of Calgary from Wikimedia Commons, with author and licence, for the Visiting Calgary welcome."""
import json, os, re, sys, urllib.parse, urllib.request, time
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryInsightPhotoProbe/1.0 (https://calgaryinsight.ca; hello@calgaryinsight.ca)'}
Q = {'downtown': 'Calgary skyline Calgary Tower', 'rockies': 'Canadian Rockies Banff mountains', 'stampede': 'Calgary Stampede', 'flames': 'Scotiabank Saddledome Calgary',
     'bow': 'Peace Bridge Calgary Bow River', 'chinook': 'Chinook arch Calgary', 'eat': 'Calgary Farmers market food', 'alive': 'Stephen Avenue Calgary', 'island': 'Prince\'s Island Park Calgary'}
OK = re.compile(r'^(CC0|CC BY(-SA)?( [0-9.]+)?|Public domain|PD)', re.I)
def get(u):
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
        except Exception as e: err = e; time.sleep(2)
    raise err
res = {}
for key, q in Q.items():
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': 6, 'gsrsearch': q + ' filetype:bitmap', 'gsrlimit': 30,
        'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1400})
    try: pages = (json.loads(get(url)).get('query') or {}).get('pages') or {}
    except Exception as e: res[key] = {'error': str(e)}; continue
    cands = []
    for p in pages.values():
        ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata') or {}
        lic = (md.get('LicenseShortName') or {}).get('value', '')
        if ii.get('mime') != 'image/jpeg' or not OK.match(lic) or (ii.get('width') or 0) < 1800 or (ii.get('width') or 0) < (ii.get('height') or 1) * 1.2: continue
        cands.append({'title': p['title'], 'thumb': ii.get('thumburl'), 'page': ii.get('descriptionurl'), 'license': lic,
                      'author': re.sub('<[^>]+>', '', (md.get('Artist') or {}).get('value', ''))[:120], 'w': ii.get('width'), 'h': ii.get('height')})
    res[key] = []
    for i, c in enumerate(cands[:5]):
        try:
            fn = f'{key}_{i}.jpg'; open(os.path.join(out, fn), 'wb').write(get(c['thumb'])); c['file'] = fn; res[key].append(c)
        except Exception as e: c['error'] = str(e)
    time.sleep(1)
json.dump(res, open(os.path.join(out, 'credits.json'), 'w'), indent=1)
print({k: len(v) if isinstance(v, list) else v for k, v in res.items()})
