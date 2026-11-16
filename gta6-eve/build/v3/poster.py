# Calgary Insight game box-art poster: layouts + Playwright render (stills and hook frames). Free; no network.
# python3 poster.py stills OUTDIR            -> poster-<variant>-<size>.png for variants A/B
# python3 poster.py frames VARIANT SIZE OUTDIR WHIP_IMG FPS DUR  -> hook frames f0000.jpg...
import json, sys, os, threading, http.server, functools
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
HOOK = 'GTA 6 drops tomorrow. Calgary is playable today.'
LEGAL = 'Not affiliated with Rockstar Games.'
def chips(y, size, gap): return {'y': y, 'size': size, 'gap': gap, 'items': [['calgaryinsight.ca/game', 'a'], ['FREE • PLAY IN YOUR BROWSER', 'b']]}
def P(img, x, y, w, h, rot, pos=None, pin=None, z=None):
    d = dict(img=img, x=x, y=y, w=w, h=h, rot=rot)
    if pos: d['pos'] = pos
    if pin: d['pin'] = pin
    if z: d['z'] = z
    return d
WM_A = lambda y, s1, s2, mw, st, dp, cy=50: dict(font='Bowlby', y=y, lines=[['GRAND TOUR', s1], ['CALGARY', s2]], maxW=mw, stroke=st, depth=dp, cy=cy)
WM_B = lambda y, s1, s2, mw, st, dp, cy=50: dict(font='Anton', y=y, lines=[['YYC CITY', s1], ['STORIES', s2]], maxW=mw, stroke=st, depth=dp, cy=cy)
L = {}
# ---------------- 1080x1920 ----------------
L['A', '1080x1920'] = dict(W=1080, H=1920, bw=10, gut=8, panels=[
    P('tower', 22, 104, 610, 668, -2, '58% 50%'), P('stage', 588, 66, 470, 384, 3, '50% 40%'), P('heli', 600, 438, 456, 352, -2),
    P('river', 14, 772, 1052, 400, 1, '50% 60%'), P('midway', 22, 1166, 524, 380, 2), P('ctrain', 516, 1150, 542, 420, -3, '50% 60%'),
    P('r311', 22, 1532, 352, 368, -2, '35% 50%', [50, 62, 150]), P('chinook', 356, 1556, 364, 340, 2, '62% 45%'), P('dome', 702, 1540, 356, 362, -3)],
    wm=WM_A(812, 150, 236, 1010, 24, 13), tag=dict(text='Cowtown City', y=1064, size=112, rot=-6),
    sub=dict(text='YYC City Stories · a free game on the real map of Calgary', y=1252, size=34), chips=chips(1316, 31, 18),
    hook=dict(text=HOOK, y=22, size=38), legal=dict(text=LEGAL, y=1880, size=22))
L['B', '1080x1920'] = dict(W=1080, H=1920, bw=10, gut=8, panels=[
    P('tower', 18, 92, 352, 566, -2, '55% 50%'), P('stage', 362, 82, 362, 566, 2, '50% 40%'), P('heli', 712, 96, 352, 556, -1, '40% 50%'),
    P('midway', 16, 664, 330, 590, 1, '40% 50%'), P('chinook', 330, 700, 420, 520, 0, '72% 45%'), P('dome', 734, 664, 332, 590, -2, '35% 50%'),
    P('ctrain', 18, 1268, 352, 610, 2, '55% 60%'), P('r311', 362, 1282, 362, 596, -2, '35% 50%', [50, 58, 160]), P('skyline', 712, 1266, 352, 612, 1, '50% 50%')],
    wm=WM_B(742, 236, 262, 1000, 22, 13), tag=dict(text='Cowtown City', y=1112, size=104, rot=-6),
    chips=chips(1206, 31, 18), hook=dict(text=HOOK, y=20, size=38), legal=dict(text=LEGAL, y=1886, size=22))
# ---------------- 1280x720 (YouTube thumbnail; rendered x1.5 for the 1920x1080 hook) ----------------
L['A', '1280x720'] = dict(W=1280, H=720, bw=8, gut=6, panels=[
    P('tower', 12, 14, 404, 694, -2, '58% 50%'), P('heli', 402, 10, 470, 262, 1, '50% 45%'), P('stage', 860, 14, 408, 334, 2, '50% 40%'),
    P('midway', 404, 452, 470, 258, -1), P('ctrain', 864, 356, 404, 352, -2, '50% 60%')],
    wm=WM_A(196, 92, 150, 860, 16, 9), tag=dict(text='Cowtown City', y=388, size=74, rot=-6),
    chips=dict(y=522, size=24, gap=12, items=[['FREE • PLAY IN YOUR BROWSER', 'b']]), hook=dict(text=HOOK, y=8, size=24))
L['B', '1280x720'] = dict(W=1280, H=720, bw=8, gut=6, panels=[
    P('tower', 12, 14, 404, 694, -2, '58% 50%'), P('stage', 402, 10, 470, 262, 1, '50% 40%'), P('heli', 860, 14, 408, 334, 2),
    P('r311', 404, 452, 470, 258, -1, '35% 50%', [50, 66, 96]), P('ctrain', 864, 356, 404, 352, -2, '50% 60%')],
    wm=WM_B(180, 140, 160, 760, 15, 9), tag=dict(text='Cowtown City', y=430, size=70, rot=-6),
    chips=dict(y=552, size=24, gap=12, items=[['FREE • PLAY IN YOUR BROWSER', 'b']]), hook=dict(text=HOOK, y=8, size=24))
# ---------------- 1080x1350 (Facebook full-video cover) ----------------
L['A', '1080x1350'] = dict(W=1080, H=1350, bw=10, gut=8, panels=[
    P('tower', 22, 84, 560, 470, -2, '58% 45%'), P('stage', 560, 60, 498, 270, 3, '50% 40%'), P('heli', 570, 318, 488, 250, -2),
    P('river', 14, 548, 1052, 310, 1, '50% 60%'), P('midway', 22, 852, 380, 470, 2), P('ctrain', 384, 846, 330, 480, -3, '50% 60%'),
    P('dome', 700, 852, 358, 470, 2)],
    wm=WM_A(566, 130, 210, 980, 22, 12), tag=dict(text='Cowtown City', y=800, size=96, rot=-6),
    chips=chips(938, 30, 16), hook=dict(text=HOOK, y=16, size=36), legal=dict(text=LEGAL, y=1316, size=20))
L['B', '1080x1350'] = dict(L['B', '1080x1920'])
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=HERE); h.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv
def page_for(b, cfg, scale=1):
    pg = b.new_page(viewport={'width': cfg['W'], 'height': cfg['H']}, device_scale_factor=scale)
    pg.add_init_script('window.CFG = ' + json.dumps(cfg) + ';')
    pg.goto(f'http://127.0.0.1:{PORT}/poster.html'); pg.evaluate('window.READY'); return pg
if __name__ == '__main__':
    srv = serve(); PORT = srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch()
        if sys.argv[1] == 'stills':
            out = sys.argv[2]; os.makedirs(out, exist_ok=True)
            for (v, sz), cfg in L.items():
                if (v, sz) == ('B', '1080x1350'): continue
                pg = page_for(b, cfg); pg.screenshot(path=f'{out}/poster-{v}-{sz}.png'); pg.close(); print(v, sz)
        elif sys.argv[1] == 'final':   # the chosen variant A as JPEG covers, one per post
            out = sys.argv[2]; os.makedirs(out, exist_ok=True)
            jobs = [('poster-teaser-9x16.jpg', '1080x1920', None), ('poster-part1-9x16.jpg', '1080x1920', 'PART 1 · THE CITY'),
                    ('poster-part2-9x16.jpg', '1080x1920', 'PART 2 · GETTING AROUND'), ('poster-part3-9x16.jpg', '1080x1920', 'PART 3 · THE STORIES'),
                    ('poster-yt-thumb.jpg', '1280x720', None), ('poster-fb-4x5.jpg', '1080x1350', None)]
            for name, sz, badge in jobs:
                cfg = dict(L['A', sz])
                if badge: cfg['badge'] = dict(text=badge, y=730, size=40)
                pg = page_for(b, cfg); pg.screenshot(path=f'{out}/{name}', type='jpeg', quality=90); pg.close(); print(name)
        elif sys.argv[1] == 'frames':
            v, sz, out, whip, fps, dur = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], int(sys.argv[6]), float(sys.argv[7])
            cfg = dict(L[v, sz]); cfg['whipImg'] = 'whip/' + os.path.basename(whip)
            os.makedirs(os.path.join(HERE, 'whip'), exist_ok=True); os.system(f'cp "{whip}" "{HERE}/whip/"')
            n = len(cfg['panels']); hits = [-0.2 + i * 0.78 / (n - 1) for i in range(n)]
            cfg['anim'] = dict(hits=hits, wm=hits[-1] + 0.18, tag=hits[-1] + 0.36, whip=dur - 0.3, end=dur - 1 / fps)
            scale = 1.5 if sz == '1280x720' else 1
            pg = page_for(b, cfg, scale); os.makedirs(out, exist_ok=True)
            N = int(round(dur * fps))
            for i in range(N):
                pg.evaluate(f'render({i / fps})'); pg.screenshot(path=f'{out}/f{i:04d}.jpg', type='jpeg', quality=92)
            json.dump(cfg['anim'], open(f'{out}/anim.json', 'w')); print(N, 'frames', cfg['anim'])
        b.close()
