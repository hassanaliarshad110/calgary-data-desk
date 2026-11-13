import json, sys, base64, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).parent.resolve()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1080,'height':1920})
    pg.goto((HERE/'page2.html').as_uri())
    for lang in ('ur','ar'):
        cfg = json.load(open(HERE/f'ep2_{lang}/cfg.json')); cfg['thumb'] = True
        pg.evaluate('c => window.setup(c)', cfg)
        d = cfg['scenes'][0]['dur']
        data = pg.evaluate('([s,t]) => window.frame(s,t,.92)', [0, d*0.75])
        (HERE/f'ep2_{lang}/thumb_{lang}.jpg').write_bytes(base64.b64decode(data.split(',',1)[1]))
    b.close()
