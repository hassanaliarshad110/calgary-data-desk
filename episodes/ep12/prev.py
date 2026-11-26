"""quick preview: python3 prev.py out.jpg 'js expr that calls drawFrame' ... -> contact sheet (W for wide)"""
import sys, os, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
out = sys.argv[1]; specs = sys.argv[2:]; WIDE = os.environ.get('WIDE') == '1'
root = '/home/claude/susu'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=root)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
ims = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080} if WIDE else {'width': 1080, 'height': 1920}); pg.on('pageerror', lambda e: print('ERR', e))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/episodes/ep12/ep12.html'); pg.wait_for_function('document.getElementById("sk").contentWindow.SK_READY === true', timeout=60000)
    pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
    for i, s in enumerate(specs):
        if ':' in s and '(' not in s:
            sid, t = s.split(':'); s = f"{'drawFrameW' if WIDE else 'drawFrame'}('{sid}', {t})"
        pg.evaluate(s); pg.screenshot(path=f'/tmp/pv_{i}.jpg', type='jpeg', quality=80); ims.append(Image.open(f'/tmp/pv_{i}.jpg'))
    b.close()
tw, th = (640, 360) if WIDE else (360, 640)
cols = min(len(ims), 3 if WIDE else 5); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * th), 'white')
for i, im in enumerate(ims): S.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
S.save(out, quality=85)
