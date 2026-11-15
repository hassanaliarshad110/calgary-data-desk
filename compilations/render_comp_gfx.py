"""Render the compilation's title card, episode cards and thumbnail to PNG/JPG with Playwright.
Usage: python3 render_comp_gfx.py <outdir> <json spec: {"n":4,"eps":[{"ep":1,"title":"...","animal":"cat"},...]}>"""
import os, sys, json, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
out = sys.argv[1]; spec = json.loads(sys.argv[2]); os.makedirs(out, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=root)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
jobs = [('title', {'n': spec['n']}, 'title_card'), ('thumb', {'n': spec['n']}, 'thumb_16x9')] + [('card', e, f"card_ep{e['ep']}") for e in spec['eps']]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/compilations/comp.html'); pg.wait_for_function('document.getElementById("sk").contentWindow.SK_READY === true', timeout=60000)
    pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
    for cid, o, name in jobs:
        w, h = pg.evaluate(f"drawComp('{cid}', {json.dumps(o)})"); pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(300)
        png = os.path.join(out, name + '.png'); pg.screenshot(path=png)
        if name == 'thumb_16x9': Image.open(png).convert('RGB').save(os.path.join(out, name + '.jpg'), quality=92)
        print(name, w, h)
    print('errors:', errs); b.close()
