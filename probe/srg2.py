import sys, os, json, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryInsight research'}
def get(url, name):
    try:
        b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        open(os.path.join(out, name), 'wb').write(b); print('OK', len(b), url)
    except Exception as e:
        print('FAIL', url, e)
for q in ['SRG', 'suburban residential growth', 'growth analytics', 'policy infrastructure', 'new community growth', 'land supply suburban']:
    get('https://data.calgary.ca/api/catalog/v1?domains=data.calgary.ca&limit=50&q=' + urllib.parse.quote(q), 'cat_' + q.replace(' ', '_') + '.json')
for ds in ['e7ib-v9n4', 'szyj-edpn']:
    get(f'https://data.calgary.ca/resource/{ds}.json?$limit=50000', ds + '.json')
    get(f'https://data.calgary.ca/api/views/{ds}.json', ds + '_meta.json')
get('https://data.calgary.ca/api/views/n4vp-3exq.json', 'n4vp-3exq_meta.json')
