#!/usr/bin/env python3
"""Build the STUDIO asset catalogue: catalog.json + catalog.csv + catalog.html (thumbnail browser),
character sheets (turnaround / expressions / visemes / poses) and per-channel packages.
  python3 catalog/build_catalog.py [--no-thumbs]
Every record: id, name, thumbnail, path, format, category, animation, tools, licence, commercial, modify,
attribution, source, channels, usage, tags."""
import os, sys, json, csv, glob, subprocess, re, wave, html
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); sys.path.insert(0, os.path.join(ROOT, 'render'))
import serve
from PIL import Image, ImageDraw, ImageFont
TH = os.path.join(ROOT, 'catalog/thumbs'); os.makedirs(TH, exist_ok=True)
THUMBS = '--no-thumbs' not in sys.argv
CH_ALL = ['calgaryinsight', 'cartoon', 'news']
REC = []; COUNT = {}
ORIG = dict(licence='Original work (Hassan Ali studio) - all rights reserved, free for own use', commercial=True, modify=True, attribution=False, source='Original - generated in code by the studio engine')
ENGINE_TOOLS = ['STUDIO engine (Chrome/Playwright canvas)', 'render/render.py -> MP4']


def add(prefix, name, **kw):
    COUNT[prefix] = COUNT.get(prefix, 0) + 1; rid = f'{prefix}-{COUNT[prefix]:03d}'
    r = dict(id=rid, name=name, thumbnail=kw.pop('thumbnail', ''), path=kw.pop('path', ''), format=kw.pop('format', ''), category=kw.pop('category', ''),
             animation=kw.pop('animation', ''), tools=kw.pop('tools', ENGINE_TOOLS), channels=kw.pop('channels', CH_ALL), usage=kw.pop('usage', ''), tags=kw.pop('tags', []))
    lic = kw.pop('lic', ORIG); r.update(licence=lic['licence'], commercial=lic['commercial'], modify=lic['modify'], attribution=lic['attribution'], source=kw.pop('source', lic.get('source', '')))
    r.update(kw); REC.append(r); return r


def thumb_from_image(src, dst, size=(320, 180), bg='#e9edf2'):
    try:
        im = Image.open(src).convert('RGBA'); im.thumbnail(size); can = Image.new('RGB', size, bg); can.paste(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2), im); can.save(dst, quality=82); return True
    except Exception as e: print('thumb fail', src, e); return False


def text_thumb(dst, lines, bg='#0b1f3a', fg='#ffffff', font=None, size=26):
    im = Image.new('RGB', (320, 180), bg); d = ImageDraw.Draw(im)
    try: f = ImageFont.truetype(font or '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size)
    except Exception: f = ImageFont.load_default()
    y = 90 - len(lines) * size * 0.6
    for l in lines: w = d.textlength(l, font=f); d.text(((320 - w) / 2, y), l, fill=fg, font=f); y += size * 1.25
    im.save(dst, quality=85)


def wave_thumb(src, dst, col='#f2b705'):
    try:
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True)
        import numpy as np; a = np.frombuffer(r.stdout, '<i2').astype(float) / 32768; n = 300; ch = max(1, len(a) // n)
        env = [abs(a[i * ch:(i + 1) * ch]).max() if len(a[i * ch:(i + 1) * ch]) else 0 for i in range(n)]
        im = Image.new('RGB', (320, 180), '#0b1f3a'); d = ImageDraw.Draw(im)
        for i, v in enumerate(env): h = v * 70; d.line([(10 + i, 90 - h), (10 + i, 90 + h)], fill=col)
        im.save(dst, quality=85); return len(a) / 8000
    except Exception as e: print('wave fail', src, e); return 0


def rel(p): return os.path.relpath(p, ROOT)


# ======================================================================= 1. ORIGINAL ENGINE ASSETS (rendered)
base = serve.start()
from playwright.sync_api import sync_playwright
with sync_playwright() as P:
    b = P.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080}); pg.on('pageerror', lambda e: print('[pageerror]', e))
    pg.goto(base + 'tools/library.html'); pg.wait_for_function('window.PAGE_READY===true'); pg.wait_for_timeout(800)
    REG = pg.evaluate('registry()'); json.dump(REG, open(os.path.join(ROOT, 'catalog/engine_registry.json'), 'w'), indent=1)
    cv = pg.locator('#stage')
    def shot(expr, tid):
        out = os.path.join(TH, tid + '.jpg')
        if THUMBS:
            pg.evaluate(expr); cv.screenshot(path='/tmp/_t.png'); Image.open('/tmp/_t.png').convert('RGB').resize((320, 180)).save(out, quality=82)
        return rel(out)
    # --- characters + sheets
    sp = b.new_page(viewport={'width': 1920, 'height': 1080}); sp.goto(base + 'tools/sheets.html'); sp.wait_for_function('window.PAGE_READY===true'); scv = sp.locator('#stage')
    for key, c in REG['cast'].items():
        d = os.path.join(ROOT, 'assets/characters', key); os.makedirs(d, exist_ok=True); sheets = {}
        for kind, expr in [('turnaround', f"turnaround('{key}')"), ('expressions', f"expressions('{key}')"), ('visemes', f"visemes('{key}')"), ('poses', f"poses('{key}')"), ('walk_cycle', f"motionStrip('{key}','walk')")]:
            p = os.path.join(d, f'{key}_{kind}.jpg')
            if THUMBS: sp.evaluate(expr); scv.screenshot(path='/tmp/_s.png'); Image.open('/tmp/_s.png').convert('RGB').save(p, quality=90)
            sheets[kind] = rel(p)
        r = add('CHR', f"{c['name']} ({c['role']})", thumbnail=shot(f"thumbChar('{key}')", f'chr_{key}'), path='engine/chars.js#CAST.' + key, format='JS rig (canvas)', category='characters/2d_rigged',
                animation=f"RIGGED: 3D-projected skeleton, 4 views + any angle, {len(REG['moves'])} motions, {len(REG['expr'])} expressions, {len(REG['visemes'])} visemes, blink/gaze",
                channels=c['channel'], usage=f"drawChar(CAST.{key}, MOVES.talk(t), x, groundY, scale, {{t}}); set pose.face.mouth = visemeAt(amp, t) for lip-sync", tags=['character', c['age'], c['build'], *c['role'].lower().split()], sheets=sheets)
        for kind, p in sheets.items():
            add('SHT', f"{c['name']} - {kind.replace('_', ' ')} sheet", thumbnail=p if not THUMBS else (thumb_from_image(os.path.join(ROOT, p), os.path.join(TH, f'sht_{key}_{kind}.jpg')) and rel(os.path.join(TH, f'sht_{key}_{kind}.jpg'))),
                path=p, format='jpg 1920x1080', category='characters/sheets', animation='static reference sheet (drawn by the rig)', tools=['any image viewer', 'reference for artists / image AI'], channels=c['channel'], usage='Reference sheet; regenerate with tools/sheets.html', tags=['sheet', kind, key])
    # --- motions, expressions, visemes
    for m in REG['moves']:
        add('MOV', f'Motion: {m}', thumbnail=shot(f"thumbMove('{m}')", f'mov_{m}'), path=f'engine/chars.js#MOVES.{m}', format='JS motion preset', category='movements', animation='PROCEDURAL motion clip f(t) for any rigged character', usage=f"MOVES.{m}(t, opts) -> pose; blend with perform([...]) or blendPose()", tags=['motion', m])
    add('EXP', f"Facial expression set ({len(REG['expr'])}): " + ', '.join(REG['expr']), thumbnail=rel(os.path.join(TH, 'sht_chacha_expressions.jpg')), path='engine/chars.js#EXPR', format='JS preset table', category='characters/expressions', animation='switchable per frame (pose.face.expr)', usage="pose.face.expr = 'laugh'", tags=['expression', 'face', 'emotion'])
    add('VIS', f"Lip-sync mouth shapes ({len(REG['visemes'])} Preston-Blair visemes)", thumbnail=rel(os.path.join(TH, 'sht_amara_visemes.jpg')), path='engine/chars.js#VISEMES + render/lipsync.py', format='JS + Python', category='characters/lipsync', animation='driven by voice loudness per frame', usage='python3 render/lipsync.py lips.json a=voice.wav; pose.face.mouth = visemeAt(LIPS.tracks.a, t)', tags=['lipsync', 'mouth', 'talk'])
    # --- sets
    for k, s in REG['sets'].items():
        add('ENV', f"Environment: {k.replace('_', ' ')}", thumbnail=shot(f"showSet('{k}', 2.5)", f'env_{k}'), path=f'engine/sets.js#SETS.{k}', format='JS layered set', category='environments/2d', animation=f"ANIMATED layers with parallax: {', '.join(s['layers'])}", channels=s['channels'], usage=f"drawSet('{k}', t, cam)", tags=['environment', *k.split('_'), *s['desc'].lower().replace(',', '').split()[:8]], description=s['desc'])
    # --- props
    for k in REG['props']:
        if k in ('food',):
            for kind in ['pizza', 'burger', 'apple', 'samosa', 'biryani']:
                add('PRP', f'Prop: {kind}', thumbnail=shot(f"showProp('food', ['{kind}'])", f'prp_food_{kind}'), path=f"engine/props.js#PROPS.food('{kind}')", format='JS vector prop', category='props/food', animation='static', usage=f"PROPS.food(x, y, s, '{kind}')", tags=['prop', 'food', kind])
            continue
        cat = 'props/' + next((c for c, ks in {'vehicles': ['car', 'bus', 'lrt', 'truck', 'bicycle'], 'furniture': ['sofa', 'chair', 'officeChair', 'table', 'desk', 'schoolDesk', 'bed', 'hospitalBed', 'bookshelf', 'bench', 'anchorDesk'], 'electronics': ['monitor', 'laptop', 'tv', 'phone', 'camera', 'mic', 'till', 'heartMonitor'], 'construction': ['excavator', 'towerCrane', 'cone', 'barrier'], 'tools': ['hammer', 'wrench', 'drill'], 'money_documents': ['bill', 'coins', 'moneyStack', 'document', 'folder', 'clipboard', 'newspaper'], 'street': ['streetLamp', 'hydrant', 'peaceBridge', 'kite']}.items() if k in ks), 'household')
        add('PRP', f'Prop: {k}', thumbnail=shot(f"showProp('{k}')", f'prp_{k}'), path=f'engine/props.js#PROPS.{k}', format='JS vector prop', category=cat, animation='animated (t)' if k in ('lamp', 'plant', 'clock', 'monitor', 'laptop', 'tv', 'phone', 'till', 'chai', 'excavator', 'towerCrane', 'kite', 'heartMonitor', 'anchorDesk', 'wand', 'bicycle', 'car') else 'static (move with any tween)', usage=f'PROPS.{k}(x, y, scale, ...)', tags=['prop', k, cat.split('/')[1]])
    # --- fx
    for k in REG['fx']:
        add('VFX', f'Effect: {k}', thumbnail=shot(f"thumbFX('{k}')", f'vfx_{k}'), path=f'engine/fx.js#FX.{k}', format='JS particle/VFX', category='vfx', animation='ANIMATED deterministic particles f(t)', usage=f'FX.{k}(t, {{...}})', tags=['fx', 'effect', k])
    # --- graphics
    for k in [g for g in REG['gfx'] if g not in ('projector', 'geoPath')]:
        ch = ['news'] if k in ('lowerThird', 'breakingBanner', 'ticker', 'clockBug', 'liveBug', 'sting') else ['cartoon'] if k == 'speechBubble' else CH_ALL
        add('GFX', f'Graphic: {k}', thumbnail=shot(f"thumbGfx('{k}')", f'gfx_{k}'), path=f'engine/graphics.js#GFX.{k}', format='JS animated graphic (themeable)', category='graphics', animation='ANIMATED in from t0', channels=ch, usage=f'GFX.{k}(t, t0, {{ th: THEME.ci|news|cartoon, ... }})', tags=['graphic', k, 'chart' if k in ('bars', 'hbars', 'line', 'donut', 'counter', 'iconArray', 'stat') else 'broadcast' if ch == ['news'] else 'map' if k in ('map', 'pin', 'route') else 'text'])
    for k in REG['trans']:
        add('TRN', f'Transition: {k}', thumbnail=shot(f"thumbTrans('{k}')", f'trn_{k}'), path=f'engine/core.js#TRANS.{k}', format='JS transition', category='vfx/transitions', animation='ANIMATED A->B over any duration', usage=f"transition('{k}', t, t0, dur, drawA, drawB)", tags=['transition', k])
    for k in REG['cam']:
        add('CAM', f'Camera preset: {k}', thumbnail=shot(f"thumbCam('{k}')", f'cam_{k}'), path=f'engine/core.js#CAM.{k}', format='JS camera preset', category='engine/camera', animation='ANIMATED camera with parallax depth', usage=f'const cam = CAM.{k}(...); drawSet(name, t, cam)', tags=['camera', k])
    for k in REG['txt']:
        add('TXT', f'Animated text: {k}', thumbnail=shot(f"thumbText('{k}')", f'txt_{k}'), path=f'engine/core.js#TXT.{k}', format='JS text animation', category='graphics/text', animation='ANIMATED', usage=f'TXT.{k}(...)', tags=['text', 'title', k])
    # --- 3D camera presets & city
    add('3DS', 'Realistic 3D downtown Calgary (OpenStreetMap buildings, river, parks, LRT, Plus 15 footbridges)', thumbnail=(thumb_from_image('/tmp/dp/prev_d1_3.2.jpg', os.path.join(TH, '3d_city.jpg')) and rel(os.path.join(TH, '3d_city.jpg'))), path='engine/city3d.js', format='ES module (three.js)', category='environments/3d_calgary',
        animation='3D camera presets: dolly, orbit, crane, topDown, flyover, street; looks: p15glow, ghost, night', tools=['three.js (acquired)', 'Chrome/Playwright WebGL (SwiftShader)', 'render/render.py'], channels=['calgaryinsight', 'news'], usage="await City3D.init(); composite(City3D.render(CAM3D.orbit(t), {p15glow:1}), 0,0,1920,1080)",
        lic=dict(licence='Code original; map data ODbL (credit "© OpenStreetMap contributors")', commercial=True, modify=True, attribution=True), source='Original code + OpenStreetMap data', tags=['3d', 'calgary', 'city', 'buildings', 'downtown', 'infrastructure', 'plus15', 'map'])
    # --- Lottie
    lp = b.new_page(viewport={'width': 1080, 'height': 520}); lp.goto(base + 'tools/lottie.html')
    for f in sorted(glob.glob(os.path.join(ROOT, 'assets/lottie/*.json'))):
        k = os.path.basename(f)[:-5]; info = json.load(open(f)); s = min(512 / info['w'], 512 / info['h']); tp = os.path.join(TH, f'lot_{k}.jpg')
        if THUMBS: lp.evaluate(f"load('../assets/lottie/{k}.json', 0.7, {int(info['w'] * s)}, {int(info['h'] * s)})"); lp.wait_for_timeout(40); lp.locator('#anim').screenshot(path='/tmp/_l.png'); thumb_from_image('/tmp/_l.png', tp, bg='#eef1f5')
        add('LOT', f'Lottie: {k}', thumbnail=rel(tp), path=rel(f), format=f"Lottie JSON {info['w']}x{info['h']} {info['fr']}fps {info['op']}f", category='graphics/lottie', animation='ANIMATED vector (Lottie)', tools=['lottie-web', 'LottieFiles', 'After Effects (Bodymovin)', 'Android/iOS Lottie', 'Canva/Figma plugins'], usage='lottie.loadAnimation({path}); or drop into any Lottie player', tags=['lottie', *k.split('_')])
    # --- 3D models (acquired) thumbnails + rig inspection
    mp = b.new_page(viewport={'width': 960, 'height': 540}); mp.goto(base + 'tools/model3d.html'); mp.wait_for_function('window.STUDIO_READY===true'); mp.wait_for_timeout(1200)
    MODEL_INFO = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'acquired/polyhaven/models/*/*.gltf')) + glob.glob(os.path.join(ROOT, 'acquired/rigged3d/*/*.glb'))):
        try:
            info = mp.evaluate(f"loadModel('../{rel(f)}')"); mp.evaluate(f"pose(0, {0.8 if 'rigged' in f else 0})"); tp = os.path.join(TH, 'm3d_' + os.path.basename(f).split('.')[0] + '.jpg')
            mp.locator('#stage').screenshot(path='/tmp/_m.png'); thumb_from_image('/tmp/_m.png', tp); MODEL_INFO[rel(f)] = dict(info, thumb=rel(tp))
        except Exception as e: print('model fail', f, e)
    b.close()

# ======================================================================= 2. ORIGINAL SVG / AUDIO
for f in sorted(glob.glob(os.path.join(ROOT, 'assets/svg/*.svg'))):
    k = os.path.basename(f)[:-4]; tp = os.path.join(TH, f'svg_{k}.jpg'); subprocess.run(['rsvg-convert', '-w', '640', f, '-o', '/tmp/_v.png']); thumb_from_image('/tmp/_v.png', tp)
    add('SVG', f'Animated SVG: {k}', thumbnail=rel(tp), path=rel(f), format='SVG + SMIL animation', category='graphics/svg', animation='ANIMATED loop (plays in any browser, no JS)', tools=['any browser', 'web pages', 'OBS browser source'], usage='<img src> or <object>; edit text/colours in the file', tags=['svg', *k.split('_')])
AI = json.load(open(os.path.join(ROOT, 'assets/audio/audio_index.json')))
for a in AI:
    f = os.path.join(ROOT, 'assets/audio', a['path']); tp = os.path.join(TH, f"aud_{a['category']}_{a['name']}.jpg"); wave_thumb(f, tp, {'sfx': '#4cc9f0', 'ambience': '#2a9d8f', 'music': '#f2b705'}[a['category']])
    pref = {'sfx': 'SFX', 'ambience': 'AMB', 'music': 'MUS'}[a['category']]
    chn = {'news_bed_120bpm': ['news'], 'cartoon_bouncy_128bpm': ['cartoon'], 'documentary_calm_72bpm': ['calgaryinsight', 'news'], 'news_sting': ['news'], 'swoosh_news': ['news'], 'ticker_blip': ['news'], 'boing': ['cartoon'], 'bonk': ['cartoon'], 'slide_whistle_up': ['cartoon'], 'slide_whistle_down': ['cartoon'], 'magic_sparkle': ['cartoon']}.get(a['name'], CH_ALL)
    add(pref, f"{a['category'].title()}: {a['name'].replace('_', ' ')}", thumbnail=rel(tp), path='assets/audio/' + a['path'], format=f"WAV 44.1 kHz stereo, {a['secs']} s", category='audio/' + a['category'], animation='audio' + (' (loopable)' if a['category'] == 'ambience' else ''), tools=['any NLE/DAW', 'render/audio.py Mix (ducking)'], channels=chn,
        usage=f"from audio import *; M.add({a['name']}(), at, gain)  (or the WAV file)", tags=['audio', a['category'], *a['name'].split('_')], lic=dict(ORIG, licence='Original - synthesized in code (render/audio.py); royalty-free'))

# ======================================================================= 3. ACQUIRED (from manifest)
manifests = [json.load(open(p)) for p in glob.glob(os.path.join(ROOT, 'acquired/manifest*.json'))]
seen = set()
for M in manifests:
    for a in M['assets']:
        p = 'acquired/' + a['path']
        if p in seen or not os.path.exists(os.path.join(ROOT, p)): continue
        seen.add(p); lic = dict(licence=a['licence'], commercial=a['commercial'], modify=a['modify'], attribution=a['attribution']); cat = a['category']; name = os.path.basename(p)
        tp = os.path.join(TH, 'acq_' + re.sub(r'[^A-Za-z0-9]+', '_', a['path'])[-80:] + '.jpg'); thumb = ''
        fmt = a['format']; anim = 'static'; tools = []; ch = CH_ALL; usage = ''
        if fmt in ('jpg', 'png'):
            if THUMBS: thumb_from_image(os.path.join(ROOT, p), tp)
            thumb = rel(tp)
        if fmt == 'hdr':
            j = os.path.join(ROOT, p).replace('_1k.hdr', '_tonemapped.jpg'); thumb_from_image(j, tp); thumb = rel(tp); tools = ['three.js RGBELoader', 'Blender (world)', 'Unreal/Unity']; usage = 'Image-based lighting / sky for 3D scenes'; ch = ['calgaryinsight', 'news']
        if fmt == 'gltf' or (fmt == 'glb'):
            mi = MODEL_INFO.get(p, {}); thumb = mi.get('thumb', ''); tools = ['three.js GLTFLoader', 'Blender', 'Unity/Unreal', 'tools/model3d.html']
            anim = ('RIGGED + ANIMATED: ' + ', '.join(f'{n} ({d}s)' for n, d in mi.get('clips', [])[:14]) + (f" · morphs: {', '.join(mi['morphs'][:6])}" if mi.get('morphs') else '')) if mi.get('skinned') else ('animated' if mi.get('clips') else 'static mesh (PBR)')
            usage = 'GLTFLoader().load(path); AnimationMixer for clips'
        if cat.startswith('audio'):
            thumb = rel(tp); wave_thumb(os.path.join(ROOT, p), tp, '#e76f51'); anim = 'audio'; tools = ['any NLE/DAW', 'render/audio.py Mix']; usage = 'Music bed. Credit in description: "' + a['note'] + ' Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0"'
        if fmt in ('ttf', 'otf'):
            try:
                im = Image.new('RGB', (320, 180), '#f7f3ea'); d = ImageDraw.Draw(im); f = ImageFont.truetype(os.path.join(ROOT, p), 44); d.text((14, 30), 'Aa Bb 123', fill='#1d3557', font=f); f2 = ImageFont.truetype(os.path.join(ROOT, p), 22); d.text((14, 110), name[:28], fill='#555', font=f2); im.save(tp); thumb = rel(tp)
            except Exception: text_thumb(tp, [name[:20]]); thumb = rel(tp)
            tools = ['@font-face in engine/fonts.css', 'any design tool']; usage = 'Add @font-face, use in text()'; anim = 'n/a'
        if fmt in ('geojson', 'json') and 'geo' in p:
            try:
                import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
                d = json.load(open(os.path.join(ROOT, p))); fig = plt.figure(figsize=(3.2, 1.8), dpi=100); ax = fig.add_axes([0, 0, 1, 1]); ax.set_facecolor('#0b1f3a'); fig.patch.set_facecolor('#0b1f3a'); n = 0
                if 'features' in d:
                    for ft in d['features'][:4000]:
                        g = ft.get('geometry') or {}; polys = g.get('coordinates', []) if g.get('type') == 'Polygon' else [pp for q in g.get('coordinates', []) for pp in q] if g.get('type') == 'MultiPolygon' else [g.get('coordinates', [])] if g.get('type') == 'LineString' else []
                        for ring in (polys if g.get('type') != 'LineString' else polys):
                            if ring and isinstance(ring[0], list) and len(ring) > 1 and isinstance(ring[0][0], (int, float)): xs, ys = zip(*ring); ax.plot(xs, ys, lw=0.4, color='#4cc9f0'); n += 1
                else:
                    for el in d.get('elements', [])[:6000]:
                        for gg in ([el['geometry']] if el.get('geometry') else [m['geometry'] for m in el.get('members', []) if m.get('geometry')]):
                            ax.plot([q['lon'] for q in gg], [q['lat'] for q in gg], lw=0.4, color='#f2b705'); n += 1
                ax.set_aspect('auto'); ax.axis('off'); fig.savefig(tp, facecolor='#0b1f3a'); plt.close(fig); thumb = rel(tp)
            except Exception as e: print('geo thumb', p, e); text_thumb(tp, ['MAP DATA', name[:22]]); thumb = rel(tp)
            tools = ['GFX.map / GFX.projector', 'engine/city3d.js', 'QGIS', 'd3/turf (acquired)']; anim = 'data -> animated map'; usage = "fetch(path) -> GFX.map(t, t0, { features, bbox })"; ch = ['calgaryinsight', 'news']
        if fmt == 'js':
            text_thumb(tp, [a['source'].replace('npm ', '')[:24], 'JS library']); thumb = rel(tp); tools = ['browser / engine pages']; anim = 'animation library'; usage = 'import / <script src>'
        if not thumb: text_thumb(tp, [name[:24]]); thumb = rel(tp)
        pref = {'characters/3d_rigged': 'R3D', 'props/3d_realistic': 'M3D', 'environments/hdri': 'HDR', 'environments/textures': 'TEX', 'audio/music': 'ACM', 'fonts': 'FNT', 'graphics/maps': 'GEO', 'environments/calgary_real': 'GEO', 'engine/vendor': 'LIB'}.get(cat, 'ACQ')
        add(pref, name, thumbnail=thumb, path=p, format=fmt, category=cat, animation=anim, tools=tools or ['see category'], channels=ch, usage=usage or a.get('note', ''), lic=lic, source=f"{a['source']} · {a['url']}", tags=['acquired', *cat.split('/'), *re.split(r'[_\-. ]', name.lower())[:6]], note=a.get('note', ''))

# ======================================================================= 4. EXISTING (preserved, catalogued in place)
EXIST = dict(licence="Hassan's own work (existing)", commercial=True, modify=True, attribution=False)
SUS = '/home/claude/susu'
if os.path.exists(SUS):
    for img, nm in [('Susuman_model_sheet.jpg', 'Susuman model sheet (Qasim / Susuman / Ammi)'), ('Susuman_side_cast.jpg', 'Susuman side cast sheet')]:
        tp = os.path.join(TH, 'ext_' + img); thumb_from_image(os.path.join(SUS, img), tp)
        add('EXT', nm, thumbnail=rel(tp), path=f'github:calgary-data-desk@susuman-kit/{img}', format='jpg', category='existing/susuman', animation='reference for rig.js', channels=['cartoon'], usage='Susuman channel only (see susuman-cartoon skill)', lic=EXIST, source='Existing Susuman kit', tags=['susuman', 'existing'])
    add('EXT', 'Susuman rig: susu(), ammi(), room/hallway/brushBg sets, caption, bubble, burst, crown, emblem, cam', thumbnail=rel(os.path.join(TH, 'ext_Susuman_model_sheet.jpg')), path='github:calgary-data-desk@susuman-kit/rig.js', format='JS canvas rig (vertical 1080x1920)', category='existing/susuman', animation='RIGGED 2D (front view), amp() lip-sync, ep1 11-scene template', channels=['cartoon'], usage='Reserved for the Susuman series; follow the susuman-cartoon skill', lic=EXIST, source='Existing Susuman kit', tags=['susuman', 'existing', 'rig'])
    add('EXT', 'Susuman desi score generator (dholak/tabla, harmonium, bansuri THEME, rubab, reveal hit) + SFX mixer', thumbnail='', path='github:calgary-data-desk@susuman-kit/music.py, musiclib.py, mix.py', format='Python', category='existing/susuman', animation='audio', channels=['cartoon'], usage='python3 music.py <secs>; python3 mix.py', lic=EXIST, source='Existing Susuman kit', tags=['susuman', 'music', 'desi'])
    add('EXT', 'Susuman voice cast (Kokoro hf_beta child voice, edge-tts Ammi/narrator/Bunty/Guddu) via GitHub Actions', thumbnail='', path='github:calgary-data-desk@susuman-kit/voices/', format='JSON + WAV references', category='existing/susuman', animation='audio', channels=['cartoon'], usage='see susuman-cartoon skill section 2', lic=EXIST, source='Existing Susuman kit', tags=['susuman', 'voices', 'tts'])
for jpg in sorted(glob.glob('/home/claude/calgary-data-desk/ui/video/*.jpg')):
    k = os.path.basename(jpg)[:-4]; tp = os.path.join(TH, 'ext_ci_' + k + '.jpg'); thumb_from_image(jpg, tp)
    add('EXT', f'Published CalgaryInsight video: {k}', thumbnail=rel(tp), path=f'github:calgary-data-desk@main/ui/video/{k}.mp4', format='mp4', category='existing/calgaryinsight_videos', animation='finished video (reuse clips, style reference)', channels=['calgaryinsight'], usage='Reference / b-roll; method in calgary-insight-video-explainer skill', lic=EXIST, source='calgaryinsight.ca', tags=['calgaryinsight', 'existing', 'video', *k.split('-')])
for br, files in [('game-3d-src', ['chris', 'jean', 'leo', 'natalia', 'npc_cowboy', 'npc_dress', 'npc_hijab', 'npc_sikh', 'npc_suit', 'npc_teen', 'sofia']), ('game-3d-src3', ['amira', 'kid_boy', 'kid_boy2', 'kid_girl', 'teen_girl']), ('game-3d-src-police', ['police_officer'])]:
    for f in files:
        add('EXT', f'Game 3D character mesh: {f}', thumbnail='', path=f'github:calgary-data-desk@{br}/{f}.glb', format='glb (Tripo-generated, glTF-Transform)', category='existing/game_3d_characters', animation='STATIC MESH - no skeleton, no animations (needs auto-rigging, e.g. Mixamo or Blender Rigify, before it can move)', channels=CH_ALL, tools=['three.js', 'Blender', 'Mixamo auto-rig (external)'], usage='Props/crowd stand-ins as-is; rig externally to animate', lic=dict(licence="Hassan's game assets (generated with Tripo - check Tripo plan terms for commercial use)", commercial=None, modify=True, attribution=False), source='YYC City Stories game', tags=['3d', 'character', 'static', 'existing', f])

# ======================================================================= 5. DEMOS
for d, nm, ch in [('calgary_doc/CalgaryInsight_Demo_City_Above_the_Street.mp4', 'Demo: CalgaryInsight documentary (3D Calgary, Plus 15)', ['calgaryinsight']), ('cartoon/Cartoon_Channel_Demo_The_Trick.mp4', 'Demo: Cartoon Channel two-hander "The Trick"', ['cartoon']), ('news/News_Channel_Demo_Breaking_Bulletin.mp4', 'Demo: News Channel breaking bulletin', ['news'])]:
    f = os.path.join(ROOT, 'demos', d)
    if os.path.exists(f):
        tp = os.path.join(TH, 'demo_' + os.path.basename(d)[:-4] + '.jpg'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '6', '-i', f, '-frames:v', '1', '-vf', 'scale=320:180', tp])
        add('DEM', nm, thumbnail=rel(tp), path=rel(f), format='mp4 1920x1080 30fps', category='demos', animation='finished video', channels=ch, usage='Template: copy demos/<name>/ (index.html + build.py) and replace lines/scenes', tags=['demo', 'template', *ch])

# ======================================================================= write outputs
json.dump({'generated_by': 'catalog/build_catalog.py', 'count': len(REC), 'assets': REC}, open(os.path.join(ROOT, 'catalog/catalog.json'), 'w'), indent=1)
cols = ['id', 'name', 'thumbnail', 'path', 'format', 'category', 'animation', 'tools', 'licence', 'commercial', 'modify', 'attribution', 'source', 'channels', 'usage', 'tags']
with open(os.path.join(ROOT, 'catalog/catalog.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(cols)
    for r in REC: w.writerow([('; '.join(map(str, r[c])) if isinstance(r.get(c), list) else r.get(c, '')) for c in cols])
cats = {}
for r in REC: cats[r['category'].split('/')[0]] = cats.get(r['category'].split('/')[0], 0) + 1
print('assets', len(REC), cats)
