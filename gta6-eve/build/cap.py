# usage: python3 cap.py W H clipsfile name[,name..]|all [--stills]
import asyncio, time, sys, json, base64, os
from playwright.async_api import async_playwright
W, H = int(sys.argv[1]), int(sys.argv[2]); CL = json.load(open(sys.argv[3])); names = sys.argv[4].split(','); stills = '--stills' in sys.argv
orient = 'land' if W > H else 'port'
CSS_BASE = "#data-credits,.credits,[data-t=by]{display:none!important} #gattr-logo,#gattr-data,#fps{display:none!important} #mp-online,#mp-chat,#mp-talk{display:none!important} "
async def steps(pg, n, js, sleep_every=10, sl=0.5):
    for k in range(n):
        await pg.evaluate("(() => { const W=innerWidth, H=innerHeight; " + js + "; __autopilot(); __step(1)})()")
        if k % sleep_every == 0: await asyncio.sleep(sl)
async def run_clip(p, c):
    out = f"clips/{orient}/{c['name']}"; os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'])
    pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    logs = []; pg.on('pageerror', lambda e: logs.append('ERR ' + str(e)[:200]))
    await pg.add_init_script(path='clock.js'); await pg.add_init_script(path='helpers.js')
    st = {"v": 2, "q": "high", "shadows": c.get('shadows', False), "glow": c.get('glow', True), "radius": c.get('radius', 2), "photo": False}
    pre = f"localStorage.setItem('yyc-settings', {json.dumps(json.dumps(st))}); localStorage.setItem('yyc-char', {json.dumps(c.get('story', 'leo'))}); localStorage.setItem('yyc-lang', {json.dumps(c.get('lang', 'en'))}); localStorage.setItem('yyc-halloween','0');"
    for k, v in (c.get('progress') or {}).items():
        pre += f"localStorage.setItem('yyc-story-{k}', {json.dumps(json.dumps({'done': v, 'money': 40, 'landmarks': [], 'items': [], 'home': True}))});"
    await pg.add_init_script(script=pre)
    await pg.goto('http://localhost:8765/city-stories/index.html' + c.get('hash', '#play'))
    await pg.add_style_tag(content=CSS_BASE + c.get('css', ''))
    await pg.wait_for_function("window.game && game.player && !document.querySelector('#btn-story').disabled", timeout=600000)
    if c.get('start', 'story') != 'none':
        await pg.evaluate(f"document.querySelector('#btn-{c.get('start', 'story')}').click()")
    await asyncio.sleep(3)
    await pg.evaluate("window.__manual(); __wrapRender(); __noRender = true; game.dyn.on = false; game.dyn.scale = 1; game.dyn.setBase(%s, 0.5); Object.assign(window.__auto, %s);" % (c.get('pr', 0.8), json.dumps(c.get('auto', {}))))
    if c.get('setup'): await pg.evaluate("(async () => {" + c['setup'] + "})()")
    await steps(pg, c.get('preroll', 60), c.get('pre', ''))
    if c.get('until'):
        for k in range(c.get('untilmax', 600)):
            if await pg.evaluate("(() => {try{return !!(" + c['until'] + ")}catch(e){return false}})()"): break
            await pg.evaluate("(() => { const W=innerWidth, H=innerHeight; " + c.get("pre", "") + "; __autopilot(); __step(1)})()")
            if k % 10 == 0: await asyncio.sleep(0.3)
        print(c['name'], 'until met after', k, flush=True)
        await steps(pg, c.get('preroll3', 0), c.get('pre', ''))
    cdp = await pg.context.new_cdp_session(pg)
    n = c['n']; idx = set([0, n // 2, n - 1] if stills else range(n)); t1 = time.time()
    for f in range(n):
        nr = 'true' if (f not in idx or c.get('norender')) else 'false'
        m = c.get('m', 1)
        js = "(() => { const f=%d, n=%d, t=f/30, k=f/(n-1), W=innerWidth, H=innerHeight; %s; __autopilot(); __noRender = true; if (%d > 1) __step(%d); __noRender = %s; __step(1); })()" % (f, n, c.get('frame', ''), m, m - 1, nr)
        await pg.evaluate(js)
        if f in idx:
            r = await cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 92, 'optimizeForSpeed': True})
            open(f"{out}/{'s' if stills else 'f'}_{f:04d}.jpg", 'wb').write(base64.b64decode(r['data']))
    print(c['name'], orient, 'frames', len(idx), 'took', round(time.time() - t1), 's', logs[:3], flush=True)
    await b.close()
async def main():
    async with async_playwright() as p:
        for c in CL:
            if c['name'] in names or names == ['all']:
                try: await run_clip(p, c)
                except Exception as e: print('FAIL', c['name'], str(e)[:300], flush=True)
asyncio.run(main())
