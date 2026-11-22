"""Render the danger-first compilation graphics (comp9.html / comp9.js) with Playwright.
Usage: python3 render_comp9_gfx.py <outdir> '<json {"n":9,"hook":"BANDAR KHATRE MEIN!","eps":[5,6,...]}>'
-> thumb_16x9.png/.jpg (1280x720), hook.png (1920x1080, transparent), badge.png + badge_s.png (75%), ep<N>.png (transparent)"""
import os, sys, json, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
out = sys.argv[1]; spec = json.loads(sys.argv[2]); os.makedirs(out, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=root)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
jobs = [('thumb', {'n': spec['n']}, 'thumb_16x9', False), ('hook', {'txt': spec['hook']}, 'hook', True), ('badge', {}, 'badge', True)] + [('ep', {'ep': e}, f'ep{e}', True) for e in spec['eps']]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/compilations/comp9.html'); pg.wait_for_function('document.getElementById("sk").contentWindow.SK_READY === true', timeout=60000)
    pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
    for cid, o, name, transp in jobs:
        w, h = pg.evaluate(f"drawComp9('{cid}', {json.dumps(o)})"); pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(300)
        png = os.path.join(out, name + '.png'); pg.locator('#s').screenshot(path=png, omit_background=transp)
        if name == 'thumb_16x9': Image.open(png).convert('RGB').save(os.path.join(out, name + '.jpg'), quality=92)
        if name == 'badge': im = Image.open(png); im.resize((int(w * .75), int(h * .75)), Image.LANCZOS).save(os.path.join(out, 'badge_s.png'))
        print(name, w, h)
    print('errors:', errs); b.close()
