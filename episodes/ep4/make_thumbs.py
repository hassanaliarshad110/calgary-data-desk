import os, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(os.path.dirname(here))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=root)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch()
    for tid, out in [('ep4_v', 'cover_vertical'), ('ep4_h', 'thumb_16x9')]:
        pg = b.new_page(viewport={'width': 1920, 'height': 1920}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/episodes/ep4/thumb4.html'); pg.wait_for_function('document.getElementById("sk").contentWindow.SK_READY === true', timeout=60000)
        pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
        w, h = pg.evaluate(f"drawThumb('{tid}')"); pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(300)
        pg.screenshot(path=out + '.png'); Image.open(out + '.png').convert('RGB').save(out + '.jpg', quality=92); print(tid, w, h, errs)
    b.close()
