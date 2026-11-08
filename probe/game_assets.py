"""Calgary game: City of Calgary 3D building models (LiDAR roof planes, Open Government Licence - City of Calgary).
Writes b3d_<k>.bin.gz: one record per building, game coordinates (dm from City Hall, x east y north),
heights in dm above the game reference (City Hall ground, ref_m):
  i32 ax, i32 ay, i16 gmin, u32 struct_id, u16 nv, nv*(i16 dx, i16 dy, i16 z), u16 nt, nt*(u16 a,b,c), u16 nw, nw*(u16 i, u16 j, i16 za, i16 zb)
roof triangles only; walls = roof edges not shared with another roof triangle at the same height, from (za, zb) up to the roof."""
import gzip, json, math, os, struct, subprocess, sys, collections
import numpy as np
from pyproj import Transformer
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True); rep = {}
LAT0, LON0 = 51.0453, -114.0581
R = math.radians(LAT0)
KY = 111132.954 - 559.822 * math.cos(2 * R) + 1.175 * math.cos(4 * R)
KX = 111412.84 * math.cos(R) - 93.5 * math.cos(3 * R)
REF = 1044.6301291988277
def sh(c): r = subprocess.run(c, shell=True, capture_output=True, text=True); return (r.stdout + r.stderr)[-6000:]
Z = '/tmp/b3d.zip'
rep['dl'] = sh(f'curl -sSL -o {Z} "https://data.calgary.ca/api/views/cchr-krqg/files/33eaa584-0e5f-4c70-a093-b222d3077a2f?download=true&filename=Buildings_3D.gdb.zip" && ls -la {Z} && cd /tmp && unzip -q -o {Z} -d /tmp/b3d && find /tmp/b3d -maxdepth 2 | head')
gdb = sh('find /tmp/b3d -maxdepth 3 -type d -name "*.gdb" | head -1').strip().splitlines()[0]
rep['gdb'] = gdb
rep['info'] = sh(f'ogrinfo -ro -so -al "{gdb}" | head -80')
print(rep['info'], flush=True)
rep['conv'] = sh(f'ogr2ogr -f GeoJSONSeq /tmp/b3d.geojsonl "{gdb}" -nlt MULTIPOLYGON -dim XYZ -lco COORDINATE_PRECISION=3 && ls -la /tmp/b3d.geojsonl')
print(rep['conv'], flush=True)
tr = Transformer.from_crs('EPSG:3776', 'EPSG:4326', always_xy=True)
files = {}; counts = collections.Counter(); stats = collections.Counter(); sample = None
def out(k):
    if k not in files: files[k] = gzip.open(os.path.join(OUT, f'b3d_{k}.bin.gz'), 'wb', compresslevel=9)
    return files[k]
for line in open('/tmp/b3d.geojsonl'):
    f = json.loads(line); g = f.get('geometry'); p = f.get('properties') or {}
    if sample is None: sample = {k: str(v)[:60] for k, v in p.items()}
    if not g or g['type'] != 'MultiPolygon': stats['skip_geom'] += 1; continue
    tris = []
    for poly in g['coordinates']:
        ring = poly[0]
        if len(ring) < 4: continue
        pts = np.array(ring[:-1], dtype=np.float64)
        if pts.shape[1] < 3: continue
        # polygon normal (Newell)
        n = np.zeros(3)
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n += [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]
        L = np.linalg.norm(n)
        if L < 1e-6 or abs(n[2]) / L < 0.17: stats['wall_faces'] += 1; continue     # walls: rebuilt from the roof edges
        for i in range(1, len(pts) - 1): tris.append((pts[0], pts[i], pts[i + 1]))     # roof faces are convex enough (fan)
    if not tris: stats['no_roof'] += 1; continue
    P = np.array([v for t in tris for v in t])
    lon, lat = tr.transform(P[:, 0], P[:, 1])
    X = np.round((lon - LON0) * KX * 10).astype(np.int64); Y = np.round((lat - LAT0) * KY * 10).astype(np.int64); Zv = np.round((P[:, 2] - REF) * 10).astype(np.int64)
    # dedupe vertices (same 2D point and height within 5 cm)
    vid = {}; verts = []; T = []
    for i in range(len(P)):
        k = (int(X[i]), int(Y[i]), int(Zv[i]) // 1)
        if k not in vid: vid[k] = len(verts); verts.append(k)
        T.append(vid[k])
    T = [tuple(T[i:i + 3]) for i in range(0, len(T), 3)]
    T = [t for t in T if len(set(t)) == 3]
    if not T: stats['degenerate'] += 1; continue
    # roof edges keyed by 2D endpoints; each occurrence keeps its heights
    E = collections.defaultdict(list)
    for t in T:
        for a, b in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            ka, kb = verts[a][:2], verts[b][:2]
            if ka == kb: continue
            key = (ka, kb) if ka < kb else (kb, ka)
            E[key].append((a, b))
    try: gmin = float(p.get('GRD_ELEV_MIN_Z') or p.get('grd_elev_min_z') or 0) - REF
    except Exception: gmin = 0
    if not gmin: gmin = (min(v[2] for v in verts) / 10) - 3
    gz_ = int(round((gmin - 0.4) * 10))
    W = []
    for key, occ in E.items():
        if len(occ) == 1:
            a, b = occ[0]; W.append((a, b, gz_, gz_))
        else:
            # several roof triangles share this edge: a wall only for the step between the highest and the lowest
            hz = lambda e: verts[e[0]][2] + verts[e[1]][2]
            hi = max(occ, key=hz); lo = min(occ, key=hz)
            if hz(hi) - hz(lo) > 6:
                a, b = hi
                za = verts[lo[0]][2] if verts[lo[0]][:2] == verts[a][:2] else verts[lo[1]][2]
                zb = verts[lo[1]][2] if verts[lo[1]][:2] == verts[b][:2] else verts[lo[0]][2]
                W.append((a, b, za, zb))
    if len(verts) > 65000: stats['too_big'] += 1; continue
    ax, ay = verts[0][0], verts[0][1]
    try: sid = int(float(p.get('STRUCT_ID') or p.get('struct_id') or 0))
    except Exception: sid = 0
    rec = bytearray(struct.pack('<iihIH', ax, ay, max(-32768, min(32767, gz_)), sid & 0xFFFFFFFF, len(verts)))
    ok = True
    for v in verts:
        dx, dy = v[0] - ax, v[1] - ay
        if abs(dx) > 32000 or abs(dy) > 32000: ok = False; break
        rec += struct.pack('<hhh', dx, dy, max(-32768, min(32767, v[2])))
    if not ok: stats['too_wide'] += 1; continue
    rec += struct.pack('<H', len(T)) + b''.join(struct.pack('<HHH', *t) for t in T)
    rec += struct.pack('<H', len(W)) + b''.join(struct.pack('<HHhh', a, b, za, zb) for a, b, za, zb in W)
    k = f'{(ax // 10 + 30000) // 12000}_{(ay // 10 + 30000) // 12000}'
    out(k).write(rec); counts[k] += 1; stats['buildings'] += 1; stats['tris'] += len(T); stats['walls'] += len(W)
for f in files.values(): f.close()
rep['sample'] = sample; rep['stats'] = dict(stats); rep['counts'] = dict(counts)
rep['files'] = {f: os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)}
json.dump(rep, open(os.path.join(OUT, 'b3d_report.json'), 'w'), indent=1)
print(json.dumps(rep['stats']), flush=True)
