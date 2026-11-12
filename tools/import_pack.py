#!/usr/bin/env python3
"""Import an asset pack you downloaded by hand (e.g. a Kenney CC0 zip, a Mixamo FBX, a LottieFiles JSON)
into acquired/ and register its licence so the catalogue picks it up.

  python3 tools/import_pack.py <zip-or-folder> --source "Kenney - City Kit" --url https://kenney.nl/assets/city-kit-commercial \
        --licence CC0 --category environments/3d_city [--include "*.glb,*.png"]
Then re-run: python3 catalog/build_catalog.py && python3 catalog/make_html.py

Licence keys: CC0 | CCBY (attribution) | MIXAMO (Adobe: use in projects ok, no raw redistribution) | LOTTIE-SIMPLE | OTHER:"text"
Never import files whose licence you have not read."""
import argparse, fnmatch, json, os, shutil, sys, zipfile, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LIC = {'CC0': ('CC0 1.0', True, True, False), 'CCBY': ('CC BY 4.0 - credit the author', True, True, True),
       'MIXAMO': ('Adobe Mixamo terms: free for personal/commercial projects; do not redistribute raw files', True, True, False),
       'LOTTIE-SIMPLE': ('Lottie Simple License (LottieFiles): free incl. commercial; no attribution; do not resell as-is', True, True, False)}
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('--source', required=True); ap.add_argument('--url', default=''); ap.add_argument('--licence', required=True)
ap.add_argument('--category', required=True); ap.add_argument('--include', default='*'); a = ap.parse_args()
lic = LIC.get(a.licence) or (a.licence.split(':', 1)[1], None, None, True)
slug = ''.join(c if c.isalnum() else '_' for c in a.source.lower()).strip('_'); dst = os.path.join(ROOT, 'acquired/manual', slug); os.makedirs(dst, exist_ok=True)
pats = a.include.split(','); added = []
def keep(n): return any(fnmatch.fnmatch(os.path.basename(n), p) or fnmatch.fnmatch(n, p) for p in pats)
if zipfile.is_zipfile(a.src):
    z = zipfile.ZipFile(a.src)
    for n in z.namelist():
        if n.endswith('/') or not keep(n): continue
        out = os.path.join(dst, n.replace(' ', '_')); os.makedirs(os.path.dirname(out), exist_ok=True); open(out, 'wb').write(z.read(n)); added.append(out)
else:
    for dp, _, fs in os.walk(a.src):
        for f in fs:
            n = os.path.relpath(os.path.join(dp, f), a.src)
            if keep(n): out = os.path.join(dst, n.replace(' ', '_')); os.makedirs(os.path.dirname(out), exist_ok=True); shutil.copy2(os.path.join(dp, f), out); added.append(out)
man_path = os.path.join(ROOT, 'acquired/manifest_manual.json'); M = json.load(open(man_path)) if os.path.exists(man_path) else {'assets': []}
for f in added:
    M['assets'].append(dict(path=os.path.relpath(f, os.path.join(ROOT, 'acquired')), source=a.source, url=a.url, category=a.category, format=os.path.splitext(f)[1][1:].lower(),
                            bytes=os.path.getsize(f), note=f'manual import {time.strftime("%Y-%m-%d")}', licence=lic[0], commercial=lic[1], modify=lic[2], attribution=lic[3]))
M['files'] = len(M['assets']); json.dump(M, open(man_path, 'w'), indent=1); print(f'imported {len(added)} files into {os.path.relpath(dst, ROOT)}')
