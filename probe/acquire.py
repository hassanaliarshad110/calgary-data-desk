"""Acquire legitimately licensed animation assets (CC0 / OFL / MIT / ODbL / PD / CC-BY).
Every file is recorded in manifest.json with source, licence, format and permissions.
Runs on GitHub Actions because the Claude workspace cannot reach these hosts."""
import json, os, re, sys, io, zipfile, shutil, subprocess, urllib.request, urllib.parse, fnmatch, time, traceback

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (asset-probe; +https://calgaryinsight.ca)'}
GH = os.environ.get('GH_TOKEN', '')
MAN, LOG = [], []
MAX_FILE = 40 * 2**20


def get(url, headers=None, timeout=120, data=None):
    h = dict(UA); h.update(headers or {})
    req = urllib.request.Request(url, headers=h, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def save(rel, blob):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(blob); return p


LIC = {
    'CC0': dict(licence='CC0 1.0 (public domain dedication)', commercial=True, modify=True, attribution=False),
    'OFL': dict(licence='SIL Open Font License 1.1', commercial=True, modify=True, attribution=False),
    'MIT': dict(licence='MIT', commercial=True, modify=True, attribution=False),
    'ISC': dict(licence='ISC', commercial=True, modify=True, attribution=False),
    'PD': dict(licence='Public domain (Natural Earth)', commercial=True, modify=True, attribution=False),
    'ODbL': dict(licence='ODbL 1.0 - credit "© OpenStreetMap contributors"', commercial=True, modify=True, attribution=True),
    'OGL-CGY': dict(licence='Open Government Licence - City of Calgary (credit the City)', commercial=True, modify=True, attribution=True),
    'CCBY': dict(licence='CC BY 4.0 - credit "Kevin MacLeod (incompetech.com)"', commercial=True, modify=True, attribution=True),
    'GSAP': dict(licence='GSAP Standard "No Charge" License', commercial=True, modify=False, attribution=False),
}


def rec(rel, source, url, lic, category, note=''):
    d = dict(path=rel, source=source, url=url, category=category, format=os.path.splitext(rel)[1].lstrip('.').lower(),
             bytes=os.path.getsize(os.path.join(OUT, rel)), note=note)
    d.update(LIC[lic]); MAN.append(d)


def step(name):
    def wrap(fn):
        def run(*a, **k):
            t0 = time.time()
            try:
                fn(*a, **k); LOG.append(dict(step=name, ok=True, secs=round(time.time()-t0, 1)))
            except Exception as e:
                LOG.append(dict(step=name, ok=False, err=repr(e)[:300])); traceback.print_exc()
        return run
    return wrap

# ---------------------------------------------------------------- Kenney (CC0)
KENNEY = {
    # slug: (category, include globs, max files)
    'toon-characters-1': ('characters/2d', ['*/PNG/Poses/*.png', '*/Tilesheet/*.png', '*/Vector/*.svg'], 400),
    'animal-pack-redux': ('characters/animals', ['PNG/Round/*.png', 'PNG/Square (outline)/*.png', 'Vector/*.svg'], 200),
    'emotes-pack': ('graphics/emotes', ['PNG/Vector/Style 1/*.png', 'Vector/*.svg'], 120),
    'animated-characters-1': ('characters/3d_rigged', ['Model/*.fbx', 'Skins/*.png', 'Animations/*.fbx'], 60),
    'animated-characters-2': ('characters/3d_rigged', ['Model/*.fbx', 'Skins/*.png', 'Animations/*.fbx'], 60),
    'animated-characters-3': ('characters/3d_rigged', ['Model/*.fbx', 'Skins/*.png', 'Animations/*.fbx'], 60),
    'mini-characters': ('characters/3d_rigged', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 60),
    'blocky-characters': ('characters/3d_rigged', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 60),
    'city-kit-commercial': ('environments/3d_city', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 120),
    'city-kit-suburban': ('environments/3d_city', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 120),
    'city-kit-roads': ('environments/3d_city', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 150),
    'city-kit-industrial': ('environments/3d_city', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 80),
    'car-kit': ('props/vehicles', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 80),
    'furniture-kit': ('props/furniture', ['Models/GLTF format/*.glb', 'Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 200),
    'food-kit': ('props/food', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 220),
    'nature-kit': ('environments/3d_nature', ['Models/GLTF format/*.glb', 'Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 340),
    'survival-kit': ('props/tools', ['Models/GLB format/*.glb', 'Models/GLB format/Textures/*'], 120),
    'particle-pack': ('vfx/sprites', ['PNG (Transparent)/*.png', 'PNG (Black background)/*.png'], 240),
    'smoke-particles': ('vfx/sprites', ['PNG/*/*.png', 'PNG/*.png'], 160),
    'background-elements-redux': ('environments/2d_layers', ['PNG/*.png', 'PNG/*/*.png', 'Vector/*.svg'], 200),
    'impact-sounds': ('audio/sfx_impact', ['Audio/*.ogg'], 200),
    'interface-sounds': ('audio/sfx_ui', ['Audio/*.ogg'], 200),
    'rpg-audio': ('audio/sfx_foley', ['Audio/*.ogg'], 100),
    'digital-audio': ('audio/sfx_digital', ['Audio/*.ogg'], 100),
    'music-jingles': ('audio/jingles', ['Audio/*/*.ogg', 'Audio/*.ogg'], 120),
    'casino-audio': ('audio/sfx_misc', ['Audio/*.ogg'], 60),
    'sci-fi-sounds': ('audio/sfx_scifi', ['Audio/*.ogg'], 120),
}


@step('kenney')
def kenney():
    for slug, (cat, globs, cap) in KENNEY.items():
        t0 = time.time()
        try:
            page = get(f'https://kenney.nl/assets/{slug}').decode('utf8', 'ignore')
            m = re.findall(r'(https://kenney\.nl/media/pages/assets/[^"\']+?\.zip)', page)
            if not m: LOG.append(dict(step=f'kenney:{slug}', ok=False, err='no zip link')); continue
            z = zipfile.ZipFile(io.BytesIO(get(m[0], timeout=300)))
            names = [n for n in z.namelist() if not n.endswith('/')]
            lic = [n for n in names if os.path.basename(n).lower().startswith('license')]
            base = f'kenney/{slug}'
            if lic: save(f'{base}/License.txt', z.read(lic[0]))
            n_ok = 0
            for n in names:
                if n_ok >= cap: break
                if not any(fnmatch.fnmatch(n, g) for g in globs): continue
                info = z.getinfo(n)
                if info.file_size > MAX_FILE: continue
                rel = f'{base}/{n}'.replace(' ', '_').replace('(', '').replace(')', '')
                save(rel, z.read(n)); rec(rel, f'Kenney - {slug}', f'https://kenney.nl/assets/{slug}', 'CC0', cat); n_ok += 1
            LOG.append(dict(step=f'kenney:{slug}', ok=n_ok > 0, files=n_ok, secs=round(time.time()-t0, 1),
                            sample=[n for n in names[:12]] if n_ok == 0 else None))
        except Exception as e:
            LOG.append(dict(step=f'kenney:{slug}', ok=False, err=repr(e)[:200]))


@step('fbx2gltf')
def fbx2gltf():
    tool = '/tmp/FBX2glTF'
    open(tool, 'wb').write(get('https://github.com/facebookincubator/FBX2glTF/releases/download/v0.9.7/FBX2glTF-linux-x64', timeout=300))
    os.chmod(tool, 0o755)
    for e in list(MAN):
        if e['format'] != 'fbx': continue
        src = os.path.join(OUT, e['path']); dst = src[:-4]
        r = subprocess.run([tool, '--binary', '--input', src, '--output', dst], capture_output=True, text=True, timeout=300)
        if r.returncode == 0 and os.path.exists(dst + '.glb'):
            rel = e['path'][:-4] + '.glb'
            rec(rel, e['source'], e['url'], 'CC0', e['category'], note='converted from FBX with FBX2glTF 0.9.7')
        else:
            LOG.append(dict(step='fbx2gltf:' + e['path'], ok=False, err=(r.stderr or r.stdout)[-200:]))

# ---------------------------------------------------------------- Poly Haven (CC0)
@step('polyhaven')
def polyhaven():
    api = 'https://api.polyhaven.com'
    plan = [('hdris', ['urban', 'skies', 'studio', 'outdoor', 'night'], 2, '1k', 'hdri'),
            ('textures', ['road', 'brick', 'concrete', 'terrain', 'wood', 'plaster', 'floor'], 1, '1k', None),
            ('models', ['furniture', 'electronics', 'decorative', 'industrial', 'props', 'nature'], 2, '1k', 'gltf')]
    for typ, cats, per, res, fmt in plan:
        seen = set()
        for c in cats:
            try:
                assets = json.loads(get(f'{api}/assets?t={typ}&c={c}'))
            except Exception as e:
                LOG.append(dict(step=f'ph:{typ}:{c}', ok=False, err=repr(e)[:150])); continue
            top = sorted(assets.items(), key=lambda kv: -kv[1].get('download_count', 0))
            k = 0
            for aid, meta in top:
                if aid in seen or k >= per: continue
                seen.add(aid)
                try:
                    files = json.loads(get(f'{api}/files/{aid}'))
                    cat = {'hdris': 'environments/hdri', 'textures': 'environments/textures', 'models': 'props/3d_realistic'}[typ]
                    url_pg = f'https://polyhaven.com/a/{aid}'
                    if typ == 'hdris':
                        f = files['hdri'][res]['hdr']; rel = f'polyhaven/hdris/{aid}_{res}.hdr'
                        save(rel, get(f['url'], timeout=300)); rec(rel, 'Poly Haven', url_pg, 'CC0', cat)
                        jp = files.get('tonemapped', {}).get('url')
                        if jp:
                            rel2 = f'polyhaven/hdris/{aid}_tonemapped.jpg'; save(rel2, get(jp, timeout=300)); rec(rel2, 'Poly Haven', url_pg, 'CC0', cat)
                    elif typ == 'textures':
                        for mapn in ('Diffuse', 'nor_gl', 'Rough', 'AO'):
                            if mapn in files and res in files[mapn]:
                                f = files[mapn][res].get('jpg') or files[mapn][res].get('png')
                                rel = f'polyhaven/textures/{aid}/{aid}_{mapn}_{res}.{f["url"].rsplit(".",1)[1]}'
                                save(rel, get(f['url'], timeout=300)); rec(rel, 'Poly Haven', url_pg, 'CC0', cat)
                    else:
                        g = files['gltf'][res]['gltf']
                        if g.get('size', 0) + sum(i.get('size', 0) for i in g.get('include', {}).values()) > 30 * 2**20: continue
                        rel = f'polyhaven/models/{aid}/{aid}_{res}.gltf'
                        save(rel, get(g['url'], timeout=300)); rec(rel, 'Poly Haven', url_pg, 'CC0', cat, note=meta.get('name', ''))
                        for inc, f in g.get('include', {}).items():
                            save(f'polyhaven/models/{aid}/{inc}', get(f['url'], timeout=300))
                    k += 1
                except Exception as e:
                    LOG.append(dict(step=f'ph:{aid}', ok=False, err=repr(e)[:150]))

# ---------------------------------------------------------------- Google Fonts (OFL)
FONTS = ['oswald', 'bebasneue', 'anton', 'inter', 'robotocondensed', 'firasans', 'notonastaliqurdu',
         'notosansdevanagari', 'luckiestguy', 'fredoka', 'montserrat', 'playfairdisplay', 'bangers', 'baloo2', 'notosansarabic']


@step('fonts')
def fonts():
    hdr = {'Authorization': f'Bearer {GH}'} if GH else {}
    for fam in FONTS:
        try:
            lst = json.loads(get(f'https://api.github.com/repos/google/fonts/contents/ofl/{fam}', headers=hdr))
            keep = [x for x in lst if x['name'].endswith('.ttf') and 'Italic' not in x['name']]
            # static weights: prefer Regular/Bold/Black, else the variable font
            static = [x for x in keep if re.search(r'-(Regular|Medium|SemiBold|Bold|ExtraBold|Black)\.ttf$', x['name'])]
            for x in (static or keep)[:4]:
                rel = f'fonts/{fam}/{x["name"]}'; save(rel, get(x['download_url'])); rec(rel, 'Google Fonts', f'https://fonts.google.com/?query={fam}', 'OFL', 'fonts')
            ofl = [x for x in lst if x['name'] == 'OFL.txt']
            if ofl: save(f'fonts/{fam}/OFL.txt', get(ofl[0]['download_url']))
        except Exception as e:
            LOG.append(dict(step=f'font:{fam}', ok=False, err=repr(e)[:150]))

# ---------------------------------------------------------------- JS animation libraries (npm)
NPM = {
    'three': ('MIT', ['build/three.module.js', 'build/three.module.min.js', 'build/three.core.js', 'build/three.core.min.js', 'LICENSE',
                      'examples/jsm/loaders/*', 'examples/jsm/utils/*', 'examples/jsm/controls/*', 'examples/jsm/curves/*',
                      'examples/jsm/libs/fflate.module.js', 'examples/jsm/libs/stats.module.js', 'examples/jsm/postprocessing/*',
                      'examples/jsm/shaders/*', 'examples/jsm/environments/*', 'examples/jsm/geometries/*', 'examples/jsm/math/*',
                      'examples/jsm/lines/*', 'examples/jsm/objects/*', 'examples/jsm/animation/*', 'examples/jsm/libs/meshopt_decoder.module.js']),
    'lottie-web': ('MIT', ['build/player/lottie.min.js', 'build/player/lottie_svg.min.js', 'LICENSE.md']),
    'd3': ('ISC', ['dist/d3.min.js', 'LICENSE']),
    'topojson-client': ('ISC', ['dist/topojson-client.min.js', 'LICENSE']),
    'gsap': ('GSAP', ['dist/gsap.min.js', 'dist/MotionPathPlugin.min.js', 'dist/SplitText.min.js', 'dist/DrawSVGPlugin.min.js', 'dist/MorphSVGPlugin.min.js', 'LICENSE.md', 'README.md']),
    '@turf/turf': ('MIT', ['turf.min.js', 'LICENSE']),
}


@step('npm')
def npm():
    tmp = '/tmp/npmpack'; os.makedirs(tmp, exist_ok=True)
    for pkg, (lic, globs) in NPM.items():
        try:
            r = subprocess.run(['npm', 'pack', pkg, '--silent', '--pack-destination', tmp], capture_output=True, text=True, timeout=300)
            tgz = os.path.join(tmp, r.stdout.strip().splitlines()[-1])
            d = os.path.join(tmp, pkg.replace('/', '_')); os.makedirs(d, exist_ok=True)
            subprocess.run(['tar', '-xzf', tgz, '-C', d], check=True)
            root = os.path.join(d, 'package'); ver = json.load(open(os.path.join(root, 'package.json')))['version']
            for dp, _, fs in os.walk(root):
                for f in fs:
                    rp = os.path.relpath(os.path.join(dp, f), root)
                    if any(fnmatch.fnmatch(rp, g) for g in globs):
                        rel = f'vendor/{pkg.replace("@","").replace("/","-")}/{rp}'
                        save(rel, open(os.path.join(dp, f), 'rb').read())
                        if rp.endswith('.js') and rp.count('/') <= 2: rec(rel, f'npm {pkg}@{ver}', f'https://www.npmjs.com/package/{pkg}', lic, 'engine/vendor')
        except Exception as e:
            LOG.append(dict(step=f'npm:{pkg}', ok=False, err=repr(e)[:150]))

# ---------------------------------------------------------------- Maps & geodata
@step('geo')
def geo():
    ne = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
    for f in ['ne_110m_admin_0_countries.geojson', 'ne_50m_admin_0_countries.geojson', 'ne_50m_admin_1_states_provinces.geojson',
              'ne_10m_populated_places_simple.geojson', 'ne_50m_lakes.geojson', 'ne_50m_rivers_lake_centerlines.geojson']:
        try:
            rel = f'geo/naturalearth/{f}'; save(rel, get(ne + f, timeout=300)); rec(rel, 'Natural Earth', 'https://www.naturalearthdata.com', 'PD', 'graphics/maps')
        except Exception as e:
            LOG.append(dict(step=f'ne:{f}', ok=False, err=repr(e)[:150]))
    for rid, name in [('surr-xmvs', 'community_district_boundaries'), ('ab7m-fwn6', 'communities'), ('jd78-wxjp', 'wards')]:
        try:
            b = get(f'https://data.calgary.ca/resource/{rid}.geojson?$limit=2000', timeout=300)
            if len(b) > 500:
                rel = f'geo/calgary/{name}_{rid}.geojson'; save(rel, b); rec(rel, 'City of Calgary Open Data', f'https://data.calgary.ca/d/{rid}', 'OGL-CGY', 'graphics/maps')
        except Exception as e:
            LOG.append(dict(step=f'cgy:{rid}', ok=False, err=repr(e)[:150]))
    Q = {
        'downtown_buildings': '[out:json][timeout:180];(way["building"](51.0395,-114.0950,51.0560,-114.0430);relation["building"](51.0395,-114.0950,51.0560,-114.0430););out geom tags;',
        'plus15_bridges': '[out:json][timeout:120];way["highway"="footway"]["bridge"](51.0400,-114.0900,51.0545,-114.0480);out geom tags;',
        'lrt_lines': '[out:json][timeout:180];way["railway"="light_rail"](50.84,-114.32,51.21,-113.86);out geom tags;',
        'rivers': '[out:json][timeout:180];(way["waterway"="river"](50.84,-114.32,51.21,-113.86);relation["waterway"="river"]["name"~"Bow|Elbow"](50.84,-114.32,51.21,-113.86););out geom tags;',
        'major_roads': '[out:json][timeout:240];way["highway"~"^(motorway|trunk|primary)$"](50.84,-114.32,51.21,-113.86);out geom tags;',
        'downtown_streets': '[out:json][timeout:180];way["highway"~"^(primary|secondary|tertiary|residential|unclassified)$"](51.0395,-114.0950,51.0560,-114.0430);out geom tags;',
        'downtown_parks_water': '[out:json][timeout:180];(way["leisure"="park"](51.035,-114.10,51.062,-114.03);way["natural"="water"](51.035,-114.10,51.062,-114.03);way["waterway"="riverbank"](51.035,-114.10,51.062,-114.03););out geom tags;',
    }
    for name, q in Q.items():
        for ep in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'):
            try:
                b = get(ep, data=urllib.parse.urlencode({'data': q}).encode(), timeout=300)
                rel = f'geo/osm/{name}.json'; save(rel, b); rec(rel, 'OpenStreetMap via Overpass', 'https://www.openstreetmap.org/copyright', 'ODbL', 'environments/calgary_real')
                break
            except Exception as e:
                LOG.append(dict(step=f'osm:{name}:{ep[:30]}', ok=False, err=repr(e)[:150]))

# ---------------------------------------------------------------- Music (CC BY 4.0, attribution required)
MUSIC = ['Investigations', 'Hitman', 'Fluffing a Duck', 'Monkeys Spinning Monkeys', 'Sneaky Snitch', 'Impact Moderato',
         'Local Forecast - Elevator', 'Volatile Reaction', 'Ossuary 6 - Air', 'Darkest Child', 'Spy Glass', 'Cipher', 'Mining by Moonlight']


@step('music')
def music():
    for t in MUSIC:
        try:
            u = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/' + urllib.parse.quote(t) + '.mp3'
            rel = 'audio/music_ccby/' + re.sub(r'[^A-Za-z0-9]+', '_', t).strip('_') + '.mp3'
            save(rel, get(u, timeout=300)); rec(rel, 'Kevin MacLeod / incompetech', u, 'CCBY', 'audio/music', note=t)
        except Exception as e:
            LOG.append(dict(step=f'music:{t}', ok=False, err=repr(e)[:150]))


if __name__ == '__main__':
    for fn in (kenney, fbx2gltf, polyhaven, fonts, npm, geo, music):
        fn()
    total = sum(m['bytes'] for m in MAN)
    json.dump(dict(generated=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), files=len(MAN), bytes=total, assets=MAN),
              open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    json.dump(LOG, open(os.path.join(OUT, 'log.json'), 'w'), indent=1)
    print('files', len(MAN), 'MB', round(total / 2**20, 1))
    for l in LOG: print(l)
