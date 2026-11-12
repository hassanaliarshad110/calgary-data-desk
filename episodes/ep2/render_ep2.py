"""Render Episode 2. preview <scene>:<t> ... | full [scene ids] (frames -> one MP4 per scene, 30 fps). Set PART=i/n to split scenes over parallel workers."""
import sys, os, subprocess, json
from playwright.sync_api import sync_playwright
mode = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
scenes = json.load(open(os.path.join(here, 'timeline.json')))['scenes']
with sync_playwright() as p:
    WIDE = os.environ.get('WIDE') == '1'; FN = 'drawFrameW' if WIDE else 'drawFrame'; PRE = 'ep2w_' if WIDE else 'ep2_'
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080} if WIDE else {'width': 1080, 'height': 1920}, device_scale_factor=1)
    pg.goto('file://' + os.path.join(here, 'ep2.html')); pg.wait_for_timeout(500)
    pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
    if mode == 'preview':
        os.makedirs('prev', exist_ok=True)
        for spec in sys.argv[2:]:
            sid, t = spec.split(':'); pg.evaluate(f"{FN}('{sid}', {t})")
            pg.screenshot(path=f'prev/{"w_" if WIDE else ""}{sid}_{t}.jpg', type='jpeg', quality=85)
    elif mode == 'cast':
        pg.evaluate("drawCast()"); pg.screenshot(path='Susuman_side_cast.jpg', type='jpeg', quality=90)
    else:
        only = sys.argv[2:] or [s['id'] for s in scenes]
        for s in scenes:
            if s['id'] not in only: continue
            d = f'{"framesw" if WIDE else "frames"}/{s["id"]}'; os.makedirs(d, exist_ok=True)
            n = round(s['dur'] * 30)
            for i in range(n):
                pg.evaluate(f"{FN}('{s['id']}', {i/30})")
                pg.screenshot(path=f'{d}/f_{i:05d}.jpg', type='jpeg', quality=92)
            tmp = f'{PRE}{s["id"]}.tmp.mp4'
            r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{d}/f_%05d.jpg', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', tmp])
            if r.returncode == 0: os.replace(tmp, f'{PRE}{s["id"]}.mp4'); print('ok', s['id'], n, flush=True)
    b.close()
