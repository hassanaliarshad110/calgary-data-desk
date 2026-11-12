import os
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    b = p.chromium.launch()
    for tid, out in [('ep2_v', 'cover_vertical.png'), ('ep2_h', 'thumb_16x9.png'), ('wide_bg', 'wide_bg.png')]:
        pg = b.new_page(viewport={'width': 1920, 'height': 1920}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.path.join(here, 'thumb2.html')); pg.wait_for_timeout(400)
        pg.evaluate("Promise.all([document.fonts.load('800 50px Baloo2'), document.fonts.load('50px Bangers')])"); pg.wait_for_timeout(300)
        w, h = pg.evaluate(f"drawThumb('{tid}')"); pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(200)
        pg.screenshot(path=out); print(tid, w, h, errs)
    b.close()
