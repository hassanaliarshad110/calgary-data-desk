import json, os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
d = None
for u in ('https://calgaryinsight.ca/data/infra.json', 'https://hassanaliarshad110.github.io/calgary-data-desk/data/infra.json'):
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryInsight/1.0'}), timeout=120)); print('ok', u); break
    except Exception as e:
        print('fail', u, e)
json.dump(d, open(os.path.join(out, 'infra.json'), 'w'))
city = d.get('city', {})
json.dump({'keys': list(d.keys()), 'city_keys': list(city.keys()), 'sanitary': city.get('sanitary'),
           'meta': {k: d[k] for k in d if k not in ('by_comm', 'city')}}, open(os.path.join(out, 'sewer_city.json'), 'w'), indent=1)
