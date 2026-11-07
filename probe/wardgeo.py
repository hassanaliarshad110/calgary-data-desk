import sys, os, urllib.request, json
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for ds in ('tz8z-hyaz',):
    for url in (f'https://data.calgary.ca/resource/{ds}.geojson?$limit=50', f'https://data.calgary.ca/api/geospatial/{ds}?method=export&format=GeoJSON'):
        try:
            d = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'calgary-insight'}), timeout=60).read()
            open(os.path.join(out, 'wards.geojson'), 'wb').write(d); print('ok', url, len(d)); break
        except Exception as e: print('fail', url, e)
