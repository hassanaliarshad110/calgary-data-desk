"""Calgary game: bare-earth ground heights from the City of Calgary LiDAR DEM (2 m, 2022-2024, Open Calgary).
Resampled to the game grid (metres from City Hall). Writes lidar10.bin.gz / lidar20.bin.gz (float32 m, NaN outside
coverage, row-major from the south-west corner) and a report."""
import gzip, json, math, os, subprocess, sys, urllib.request, zipfile
import numpy as np, rasterio
from rasterio.enums import Resampling
from pyproj import Transformer
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); rep = {}
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
Z = '/tmp/dem.zip'
subprocess.run(['curl', '-sSL', '-o', Z, 'https://data.calgary.ca/download/eink-tu9p/application%2Fzip'], check=True)
zf = zipfile.ZipFile(Z); names = zf.namelist(); rep['zip'] = [(i.filename, i.file_size) for i in zf.infolist()]
tif = [n for n in names if n.lower().endswith('.tif')][0]
zf.extract(tif, '/tmp/x'); os.remove(Z); fp = os.path.join('/tmp/x', tif)
ds = rasterio.open(fp); rep['tif'] = {'crs': str(ds.crs), 'w': ds.width, 'h': ds.height, 'res': ds.res, 'bounds': list(ds.bounds), 'nodata': ds.nodata, 'dtype': ds.dtypes[0]}
print(rep['tif'], flush=True)
F = 5  # 2 m -> 10 m block average
h10, w10 = ds.height // F, ds.width // F
A = ds.read(1, out_shape=(h10, w10), resampling=Resampling.average, masked=True).astype(np.float32).filled(np.nan)
A[(A < 900) | (A > 1500)] = np.nan
T = ds.transform * ds.transform.scale(ds.width / w10, ds.height / h10)
tr = Transformer.from_crs('EPSG:4326', ds.crs, always_xy=True)
X0, X1, Y0, Y1 = -26000, 22000, -28000, 24000
def sample(step):
    nx, ny = (X1 - X0) // step + 1, (Y1 - Y0) // step + 1
    out = np.full((ny, nx), np.nan, np.float32)
    xs = X0 + np.arange(nx) * step
    for j in range(ny):
        y = Y0 + j * step
        lon = LON0 + xs / KX; lat = np.full(nx, LAT0 + y / KY)
        E, N = tr.transform(lon, lat)
        col = (E - T.c) / T.a - 0.5; row = (N - T.f) / T.e - 0.5
        ok = (col >= 0) & (row >= 0) & (col < w10 - 1) & (row < h10 - 1)
        c0 = np.floor(col[ok]).astype(int); r0 = np.floor(row[ok]).astype(int); fc = col[ok] - c0; fr = row[ok] - r0
        v = A[r0, c0] * (1 - fc) * (1 - fr) + A[r0, c0 + 1] * fc * (1 - fr) + A[r0 + 1, c0] * (1 - fc) * fr + A[r0 + 1, c0 + 1] * fc * fr
        out[j, ok] = v
    return out, nx, ny
for step in (10, 20):
    G, nx, ny = sample(step)
    with gzip.open(os.path.join(OUT, f'lidar{step}.bin.gz'), 'wb', 6) as f: f.write(G.astype('<f4').tobytes())
    rep[f'grid{step}'] = {'nx': nx, 'ny': ny, 'valid': int(np.isfinite(G).sum()), 'min': float(np.nanmin(G)), 'max': float(np.nanmax(G))}
    if step == 10:
        def at(x, y): return float(G[(y - Y0) // 10, (x - X0) // 10])
        rep['cityhall'] = at(0, 0)
        rep['martindale_profile_ew'] = [(x, round(at(x, 7986), 2)) for x in range(6500, 7500, 50)]
        rep['martindale_profile_ns'] = [(y, round(at(6987, y), 2)) for y in range(7500, 8500, 50)]
        rep['martinbrook'] = at(6800, 7884)
try:
    u = "https://data.calgary.ca/resource/kami-qbfh.json?$where=upper(site_name)%20like%20'%25MARTIN%25'&$limit=20"
    rep['parks'] = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryGameMap/1.0'}), timeout=60).read())
except Exception as e: rep['parks'] = str(e)
json.dump(rep, open(os.path.join(OUT, 'lidar.json'), 'w'), indent=1, default=str)
print('done')
