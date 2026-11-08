import json, os, re, sys, urllib.request, urllib.parse
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (YYC Story data probe)'}
log = []
def get(url, n=4_000_000):
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60); b = r.read(n)
        log.append(f'OK {r.status} {len(b)} {url}'); return b
    except Exception as e:
        log.append(f'ERR {url} {e}'); return b''
html = get('https://maps.calgary.ca/3ddigitalcalgary/').decode('utf8', 'ignore')
open(f'{OUT}/page.html', 'w').write(html)
# follow scripts and configs referenced by the page
refs = set(re.findall(r'''(?:src|href)=["']([^"']+)["']''', html))
found = set()
for ref in sorted(refs):
    u = urllib.parse.urljoin('https://maps.calgary.ca/3ddigitalcalgary/', ref)
    if not u.startswith('https://maps.calgary.ca') or not re.search(r'\.(js|json)(\?|$)', u): continue
    b = get(u).decode('utf8', 'ignore')
    fn = re.sub(r'[^A-Za-z0-9._-]', '_', u[-80:]); open(f'{OUT}/{fn}', 'w').write(b[:3_000_000])
    for m in re.findall(r'https?://[^\s"\'`<>)]+(?:SceneServer|FeatureServer|MapServer|ImageServer|sharing/rest[^\s"\'`<>)]*|webscene[^\s"\'`<>)]*)', b): found.add(m)
    for m in re.findall(r'["\']([0-9a-f]{32})["\']', b): found.add('item:' + m)
for c in ['config.json', 'config/config.json', 'app/config.json', 'config/demo.json']:
    b = get('https://maps.calgary.ca/3ddigitalcalgary/' + c).decode('utf8', 'ignore')
    if b: open(f'{OUT}/cfg_' + c.replace('/', '_'), 'w').write(b)
    for m in re.findall(r'https?://[^\s"\'`<>)]+', b): found.add(m)
    for m in re.findall(r'["\']([0-9a-f]{32})["\']', b): found.add('item:' + m)
for m in re.findall(r'https?://[^\s"\'`<>)]+', html): found.add(m)
# portal search for City 3D content
for q in ['3D buildings Calgary', 'Calgary 3D', 'Digital Calgary']:
    for base in ['https://www.arcgis.com/sharing/rest/search', 'https://calgary.maps.arcgis.com/sharing/rest/search']:
        b = get(base + '?' + urllib.parse.urlencode({'q': q + ' type:("Scene Service" OR "Web Scene" OR "Scene Layer Package")', 'num': 50, 'f': 'json'}))
        try:
            for r in json.loads(b).get('results', []): found.add(f"search:{r.get('id')}|{r.get('type')}|{r.get('owner')}|{r.get('title')}|{r.get('url')}|{(r.get('licenseInfo') or '')[:200]}")
        except Exception: pass
# open data catalogue: 3D datasets
b = get('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': '3D', 'limit': 50}))
try:
    for r in json.loads(b).get('results', []):
        rs = r['resource']; found.add(f"socrata:{rs['id']}|{rs['name']}|{rs.get('type')}|{(r.get('metadata') or {}).get('license')}|{rs.get('description','')[:300]}")
except Exception: pass
for q in ['buildings 3D', 'orthophoto', 'aerial imagery']:
    b = get('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': q, 'limit': 20}))
    try:
        for r in json.loads(b).get('results', []):
            rs = r['resource']; found.add(f"socrata:{rs['id']}|{rs['name']}|{rs.get('type')}|{(r.get('metadata') or {}).get('license')}|{rs.get('description','')[:300]}")
    except Exception: pass
open(f'{OUT}/found.txt', 'w').write('\n'.join(sorted(found)))
open(f'{OUT}/log.txt', 'w').write('\n'.join(log))
