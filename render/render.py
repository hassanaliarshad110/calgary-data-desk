#!/usr/bin/env python3
"""Studio renderer: films any engine page (HTML that registers scene(id, dur, fn)) with Playwright.

  python3 render.py page.html preview  <scene>:<t> ...        -> prev_<scene>_<t>.jpg
  python3 render.py page.html still    out.png  <js expr>      -> evaluates expr (draws), saves PNG
  python3 render.py page.html full     [scene ids]            -> scene_<id>.mp4 (30 fps, x264 crf 18)
  python3 render.py page.html scenes                          -> prints SCENES json
Options via env: W, H (default 1920x1080), FPS (30), OUT (output dir, default page dir), JPEG_Q (92)
Each scene is encoded to its own MP4 (written to a temp name, renamed on success) so scenes
can be re-rendered individually and concatenated losslessly with ffmpeg -c copy."""
import sys, os, json, subprocess, shutil, time
from playwright.sync_api import sync_playwright

page_path = os.path.abspath(sys.argv[1]); mode = sys.argv[2]; args = sys.argv[3:]
W, H, FPS = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1080)), int(os.environ.get('FPS', 30))
OUT = os.path.abspath(os.environ.get('OUT', os.path.dirname(page_path))); os.makedirs(OUT, exist_ok=True)
Q = int(os.environ.get('JPEG_Q', 92))


import threading, functools, http.server, socketserver
ROOT = page_path
while ROOT != '/' and not os.path.isdir(os.path.join(ROOT, 'engine')): ROOT = os.path.dirname(ROOT)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/' + os.path.relpath(page_path, ROOT)


def ready(pg):
    pg.goto(URL)
    pg.wait_for_function('window.STUDIO_READY === true && (window.PAGE_READY === undefined || window.PAGE_READY === true)', timeout=120000)
    pg.evaluate("document.fonts ? document.fonts.ready.then(()=>1) : 1")
    pg.wait_for_timeout(200)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    pg.on('console', lambda m: print('[page]', m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: print('[pageerror]', e))
    ready(pg)
    cv = pg.locator('#stage')
    if mode == 'scenes':
        print(json.dumps(pg.evaluate('SCENES')))
    elif mode == 'preview':
        for spec in args:
            sid, t = spec.split(':')
            pg.evaluate(f"(async()=>{{ const r = drawFrame('{sid}', {t}); if (r && r.then) await r; }})()")
            path = os.path.join(OUT, f'prev_{sid}_{t}.jpg'); cv.screenshot(path=path, type='jpeg', quality=88); print(path)
    elif mode == 'still':
        out, expr = args[0], args[1]
        pg.evaluate(f"(async()=>{{ const r = ({expr}); if (r && r.then) await r; }})()")
        cv.screenshot(path=os.path.join(OUT, out), type='png'); print(os.path.join(OUT, out))
    elif mode == 'full':
        scenes = pg.evaluate('SCENES'); only = args or [s['id'] for s in scenes]
        for s in scenes:
            if s['id'] not in only: continue
            t0 = time.time(); d = os.path.join(OUT, f'fr_{s["id"]}'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
            n = round(s['dur'] * FPS)
            for i in range(n):
                pg.evaluate(f"(async()=>{{ const r = drawFrame('{s['id']}', {i / FPS}); if (r && r.then) await r; }})()")
                cv.screenshot(path=f'{d}/f_{i:05d}.jpg', type='jpeg', quality=Q)
            tmp = os.path.join(OUT, f'scene_{s["id"]}.tmp.mp4')
            r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f_%05d.jpg', '-c:v', 'libx264', '-crf', '18',
                                '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp])
            if r.returncode == 0:
                os.replace(tmp, os.path.join(OUT, f'scene_{s["id"]}.mp4')); shutil.rmtree(d)
                print(f'ok {s["id"]} frames={n} secs={time.time() - t0:.1f}', flush=True)
            else:
                print('FAILED', s['id'])
    b.close()
