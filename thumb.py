"""Cover image for each language: python3 thumb.py [episode_dir]  (default episodes/ep02)
Scene 0 at 75% of its length, without captions. Writes <out_dir>/thumb_<lang>.jpg."""
import json, sys, base64, pathlib
from playwright.sync_api import sync_playwright
EP = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else pathlib.Path(__file__).parent.resolve() / 'episodes' / 'ep02'
page = EP / 'page.html' if (EP / 'page.html').exists() else EP / 'page2.html'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto(page.as_uri())
    for lang in ('ur', 'ar'):
        out = EP / f'out_{lang}' if (EP / f'out_{lang}').exists() else EP / f'ep2_{lang}'
        cfg = json.load(open(out / 'cfg.json')); cfg['thumb'] = True
        pg.evaluate('c => window.setup(c)', cfg)
        d = cfg['scenes'][0]['dur']
        data = pg.evaluate('([s,t]) => window.frame(s,t,.92)', [0, d * 0.75])
        (out / f'thumb_{lang}.jpg').write_bytes(base64.b64decode(data.split(',', 1)[1]))
        print(out / f'thumb_{lang}.jpg')
    b.close()
