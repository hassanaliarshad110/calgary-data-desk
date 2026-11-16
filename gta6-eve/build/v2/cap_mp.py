# Multiplayer capture: several real game clients online together (lockstep, deterministic clock), filmed from one of them.
# usage: python3 cap_mp.py W H shots.json name[,name..]|all [--stills]
import asyncio, time, sys, json, base64, os
from playwright.async_api import async_playwright
W, H = int(sys.argv[1]), int(sys.argv[2]); SPEC = json.load(open(sys.argv[3])); names = sys.argv[4].split(','); stills = '--stills' in sys.argv
orient = 'land' if W > H else 'port'
CSS = ("#data-credits,.credits,[data-t=by]{display:none!important} #gattr-logo,#gattr-data,#fps{display:none!important} "
       "#dialog,#card,#quiz,#cine,#gamebar,#realbtn,#objective,#loc{display:none!important}")
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
        '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']

async def client(b, cl, film):
    vw, vh = (W, H) if film else (400, 240)
    ctx = await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1)
    pg = await ctx.new_page(); pg.logs = []; pg.on('pageerror', lambda e: pg.logs.append('ERR ' + str(e)[:160]))
    for s in ('clock.js', 'helpers.js', 'media.js'): await pg.add_init_script(path=s)
    st = {"v": 2, "q": "high" if film else "low", "shadows": False, "glow": True, "radius": SPEC.get("film_radius", 1) if film else 1, "photo": False}
    pre = (f"localStorage.setItem('yyc-settings', {json.dumps(json.dumps(st))}); localStorage.setItem('yyc-char', {json.dumps(cl['char'])});"
           f"localStorage.setItem('yyc-lang','en'); localStorage.setItem('yyc-halloween','0'); localStorage.setItem('yyc-mp-name', {json.dumps(cl['name'])});")
    await pg.add_init_script(script=pre)
    await pg.goto('http://localhost:8765/city-stories/index.html#play')
    await pg.add_style_tag(content=CSS + ('' if film else ' canvas{display:none}'))
    pg.cl = cl; pg.film = film
    return pg

async def all_eval(pages, js_by_page):
    await asyncio.wait_for(asyncio.gather(*[p.evaluate(js) for p, js in zip(pages, js_by_page)]), 180)   # a crashed client must not hang the run

async def run(p, shot):
    clients = SPEC['clients']; out = f"clips/{orient}/{shot['name']}"; os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    b = await p.chromium.launch(args=ARGS)
    pages = []
    for i, cl in enumerate(clients):          # one at a time: loading the city is the memory peak
        pg = await client(b, cl, i == 0); pages.append(pg)
        await pg.wait_for_function("window.game && game.player && !document.querySelector('#btn-free').disabled", timeout=900000)
        await asyncio.sleep(4)
        print('loaded', cl['name'], os.popen("free -m | awk 'NR==2{print $3}'").read().strip(), flush=True)
    for pg in pages:
        await pg.evaluate("document.querySelector('#btn-free').click()")
        if not pg.film:   # off-screen clients: don't load the city around them (memory); what they send is unchanged
            await pg.evaluate("game.tiles && (game.tiles.update = () => {});")
    await asyncio.sleep(6)       # free roam joins the online room after 1.5 s (real time)
    for pg in pages:
        await pg.evaluate("window.__manual(); __wrapRender(); __noRender = true; window.__gameTimers = true; game.dyn.on = false; game.dyn.scale = 1; game.dyn.setBase(%s, 0.5);" % (0.6 if pg.film else 0.3))
    on = await asyncio.gather(*[pg.evaluate("[game.mp.on, game.mp.ws && game.mp.ws.readyState, game.mp.others.size]") for pg in pages])
    print('online state', on, flush=True)
    G = shot.get('global', '')
    async def tick(js_list, render=False, m=3):
        # every client: per-frame script, m game frames; the filmer renders its last one
        await all_eval(pages, ["(() => { const W=innerWidth, H=innerHeight; %s; %s; __noRender = true; __step(%d); window.__tickTimers && __tickTimers(); })()" % (G, js, m - 1) for js in js_list])
        await asyncio.sleep(0.04)
        await all_eval(pages, ["(() => { __noRender = %s; __step(1); window.__tickTimers && __tickTimers(); })()" % ('false' if (render and pg.film) else 'true') for pg in pages])
        await asyncio.sleep(0.03)
    # setup each client
    await all_eval(pages, ["(() => { %s; %s })()" % (G, shot['setup'].get(pg.cl['key'], '')) for pg in pages])
    for k in range(shot.get('preroll', 40)):
        await tick([shot.get('pre', {}).get(pg.cl['key'], '') for pg in pages])
    on = await asyncio.gather(*[pg.evaluate("[game.mp.others.size, game.player.mode]") for pg in pages])
    print(shot['name'], 'after preroll', on, flush=True)
    cdp = await pages[0].context.new_cdp_session(pages[0])
    n = shot['n']; idx = set([0, n // 2, n - 1] if stills else range(n)); t1 = time.time()
    for f in range(n):
        js = []
        for pg in pages:
            fr = shot['frame'].get(pg.cl['key'], '')
            js.append("const f=%d, n=%d, t=f/30, k=f/(n-1); %s" % (f, n, fr))
        await tick(js, render=f in idx, m=shot.get('m', 3))
        if f in idx:
            r = await cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 92, 'optimizeForSpeed': True})
            open(f"{out}/{'s' if stills else 'f'}_{f:04d}.jpg", 'wb').write(base64.b64decode(r['data']))
    print(shot['name'], orient, 'frames', len(idx), 'took', round(time.time() - t1), 's', [pg.logs[:2] for pg in pages], flush=True)
    await b.close()
    os.system('pkill -f chrome-headless >/dev/null 2>&1'); await asyncio.sleep(2)

async def main():
    async with async_playwright() as p:
        for s in SPEC['shots']:
            if s['name'] in names or names == ['all']:
                try: await run(p, s)
                except Exception as e:
                    print('FAIL', s['name'], str(e)[:400], flush=True); os.system('pkill -f chrome-headless >/dev/null 2>&1'); await asyncio.sleep(3)
asyncio.run(main())
