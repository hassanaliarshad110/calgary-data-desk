"""Calgary game: true-colour ground imagery from Copernicus Sentinel-2 (L2A 'visual' 10 m product, free and open,
via the Earth Search STAC catalogue on AWS). Resampled to the game grid (metres from City Hall, x east, y north).
Writes s2_10m.png (4800 x 5200, north up, from x -26000 / y 24000 at the top left) and a report."""
import json, math, os, sys, urllib.request, urllib.parse
import numpy as np, rasterio
from pyproj import Transformer
from PIL import Image
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); rep = {}
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
X0, X1, Y0, Y1, ST = -26000, 22000, -28000, 24000, 10
NX, NY = (X1 - X0) // ST, (Y1 - Y0) // ST
lon0, lon1 = LON0 + X0 / KX, LON0 + X1 / KX; lat0, lat1 = LAT0 + Y0 / KY, LAT0 + Y1 / KY
body = {'collections': ['sentinel-2-l2a'], 'bbox': [lon0, lat0, lon1, lat1], 'limit': 100,
        'datetime': '2023-06-15T00:00:00Z/2025-09-10T00:00:00Z', 'query': {'eo:cloud_cover': {'lt': 3}}}
req = urllib.request.Request('https://earth-search.aws.element84.com/v1/search', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
items = json.loads(urllib.request.urlopen(req, timeout=120).read())['features']
# summer scenes only (green, no snow), clearest first
items = [i for i in items if i['properties']['datetime'][5:7] in ('06', '07', '08')]
items.sort(key=lambda i: (i['properties'].get('eo:cloud_cover', 99), -int(i['properties']['datetime'][5:7] == '07')))
rep['candidates'] = [(i['id'], i['properties']['datetime'][:10], i['properties'].get('eo:cloud_cover'), i['properties'].get('s2:nodata_pixel_percentage')) for i in items[:30]]
print(json.dumps(rep['candidates'][:12]), flush=True)
img = np.zeros((NY, NX, 3), np.uint8); have = np.zeros((NY, NX), bool)
xs = X0 + (np.arange(NX) + 0.5) * ST
used = []
for it in items[:24]:
    if have.mean() > 0.999: break
    href = it['assets']['visual']['href']
    with rasterio.open(href) as ds:
        tr = Transformer.from_crs('EPSG:4326', ds.crs, always_xy=True)
        A = ds.read(); T = ds.transform; H, W = ds.height, ds.width
    got = 0
    for j in range(NY):
        if have[j].all(): continue
        y = Y1 - (j + 0.5) * ST
        lon = LON0 + xs / KX; lat = np.full(NX, LAT0 + y / KY)
        E, N = tr.transform(lon, lat)
        c = np.floor((E - T.c) / T.a).astype(int); r = np.floor((N - T.f) / T.e).astype(int)
        ok = (c >= 0) & (r >= 0) & (c < W) & (r < H) & ~have[j]
        if not ok.any(): continue
        px = A[:, r[ok], c[ok]].T
        good = px.sum(1) > 0                       # 0,0,0 = no data
        idx = np.flatnonzero(ok)[good]
        img[j, idx] = px[good]; have[j, idx] = True; got += len(idx)
    used.append((it['id'], it['properties']['datetime'][:10], got))
    print('used', used[-1], 'coverage', round(have.mean(), 4), flush=True)
    del A
rep['used'] = used; rep['coverage'] = float(have.mean())
Image.fromarray(img).save(os.path.join(OUT, 's2_10m.png'), optimize=True)
json.dump(rep, open(os.path.join(OUT, 's2_report.json'), 'w'), indent=1)
