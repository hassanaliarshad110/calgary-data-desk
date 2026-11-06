import subprocess, sys, os, json
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True)
from playwright.sync_api import sync_playwright
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
URL = 'https://hassanaliarshad110.github.io/calgary-data-desk/?v=' + str(os.getpid())
log = []
def L(*a):
    s = ' '.join(str(x) for x in a); print(s); log.append(s)
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h in ((390, 844), (1440, 1000)):
        p = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        p.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        p.goto(URL, wait_until='networkidle', timeout=120000); p.wait_for_timeout(4000)
        hero = p.query_selector('#kpis .kpi.hero')
        if hero:
            L(w, 'hero height', round(hero.bounding_box()['height'])); hero.screenshot(path=f'{out}/hero_{w}.png')
        L(w, 'live-pop', p.evaluate("(document.querySelector('.live-pop')||{}).innerText"))
        L(w, 'capmkt tab', bool(p.query_selector('.tab[data-view="capmkt"]')))
        # Since the election -> Civic Accountability
        try:
            p.evaluate("show('elections')"); p.wait_for_timeout(3000)
            subs = p.eval_on_selector_all('[data-elsub]', 'e => e.map(x => x.dataset.elsub + ":" + x.innerText.trim())')
            L(w, 'election subs', subs)
            p.click('[data-elsub="civic"]'); p.wait_for_timeout(3500)
            L(w, 'civic text len', p.evaluate("(document.querySelector('#ca-body')||{innerText:''}).innerText.length"))
            for k in ('reps', 'records'):
                p.click(f'[data-capage="{k}"]'); p.wait_for_timeout(1500)
                L(w, k, 'hscroll', p.evaluate('document.documentElement.scrollWidth - innerWidth'))
            p.screenshot(path=f'{out}/civic_{w}.jpg', quality=60)
        except Exception as e:
            L(w, 'civic FAIL', e)
        try:
            p.evaluate("show('capmkt')"); p.wait_for_timeout(3000)
            L(w, 'capmkt kpis', p.evaluate("(document.querySelector('#cm-body')||{innerText:''}).innerText.slice(0,400)").replace('\n', ' | '))
            p.screenshot(path=f'{out}/capmkt_{w}.jpg', quality=60)
        except Exception as e:
            L(w, 'capmkt FAIL', e)
        try:
            p.evaluate("show('invest')"); p.wait_for_timeout(3000)
            p.click('[data-ivsub="list"]'); p.wait_for_timeout(4000)
            L(w, 'dir sub', p.evaluate("(document.querySelector('#iv-body .card-sub')||{}).innerText"))
            L(w, 'dirmap', bool(p.query_selector('#iv-dirmap canvas')))
            p.screenshot(path=f'{out}/ivdir_{w}.jpg', quality=60)
        except Exception as e:
            L(w, 'invest FAIL', e)
        L(w, 'errors', errs[:8] or 'none')
        p.close()
    b.close()
open(f'{out}/log.txt', 'w').write('\n'.join(log))
