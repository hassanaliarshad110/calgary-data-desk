"""Calgary game: ground heights from the Copernicus DEM GLO-30 (ESA, free and open; (c) DLR e.V. 2010-2014 and
(c) Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA).
Buildings and trees are removed with a grey opening, then smoothed. Writes dem.bin (int16 dm relative to City Hall,
row-major from the south-west corner, 30 m step) and dem.json (grid header)."""
import json, math, os, sys, urllib.request
import numpy as np, rasterio
from scipy import ndimage
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
tiles = {}
for lat in (50, 51):
    for lon in (115, 114):
        name = f'Copernicus_DSM_COG_10_N{lat}_00_W{lon}_00_DEM'
        url = f'https://copernicus-dem-30m.s3.amazonaws.com/{name}/{name}.tif'
        fp = os.path.join('/tmp', name + '.tif')
        urllib.request.urlretrieve(url, fp); print('got', name, os.path.getsize(fp), flush=True)
        tiles[(lat, lon)] = rasterio.open(fp)
STEP = 30
X0, X1, Y0, Y1 = -26000, 22000, -28000, 24000
nx, ny = (X1 - X0) // STEP + 1, (Y1 - Y0) // STEP + 1
xs = X0 + np.arange(nx) * STEP; ys = Y0 + np.arange(ny) * STEP
GX, GY = np.meshgrid(xs, ys)
LON = LON0 + GX / KX; LAT = LAT0 + GY / KY
H = np.full(GX.shape, np.nan)
for (lat, lon), ds in tiles.items():
    m = (LAT >= lat) & (LAT < lat + 1) & (LON >= -lon) & (LON < -lon + 1)
    if not m.any(): continue
    arr = ds.read(1).astype(np.float64); T = ds.transform
    col = (LON[m] - T.c) / T.a - 0.5; row = (LAT[m] - T.f) / T.e - 0.5
    c0 = np.clip(np.floor(col).astype(int), 0, arr.shape[1] - 2); r0 = np.clip(np.floor(row).astype(int), 0, arr.shape[0] - 2)
    fc = col - c0; fr = row - r0
    v = arr[r0, c0] * (1 - fc) * (1 - fr) + arr[r0, c0 + 1] * fc * (1 - fr) + arr[r0 + 1, c0] * (1 - fc) * fr + arr[r0 + 1, c0 + 1] * fc * fr
    H[m] = v
print('nan', int(np.isnan(H).sum()), 'range', np.nanmin(H), np.nanmax(H), flush=True)
H = np.where(np.isnan(H), np.nanmean(H), H)
G = ndimage.grey_opening(H, size=(5, 5))              # remove buildings and tree canopy (bumps up to ~150 m across); keeps hollows
G = ndimage.gaussian_filter(G, 0.75)
ref = float(G[(0 - Y0) // STEP, (0 - X0) // STEP])
D = np.clip(np.round((G - ref) * 10), -32000, 32000).astype('<i2')
D.tofile(os.path.join(OUT, 'dem.bin'))
json.dump({'x0': X0, 'y0': Y0, 'step': STEP, 'nx': int(nx), 'ny': int(ny), 'ref_m': ref, 'min_m': float(G.min()), 'max_m': float(G.max()),
           'credit': 'Ground heights: Copernicus DEM GLO-30, produced using Copernicus data and information funded by the European Union'}, open(os.path.join(OUT, 'dem.json'), 'w'), indent=1)
print('done', nx, ny, ref, G.min(), G.max())
