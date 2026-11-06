import subprocess, sys, os
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
    for w, h in ((390, 844), (860, 1000), (1440, 1000)):
        p = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        p.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        p.goto(URL, wait_until='networkidle', timeout=120000); p.wait_for_timeout(6000)
        L(w, 'first tab', p.evaluate("(document.querySelector('.tab')||{}).innerText"))
        L(w, 'active view', p.evaluate("(document.querySelector('.view.active')||document.querySelector('.view:not([hidden])')||{}).id"))
        L(w, 'kpis', p.evaluate("document.querySelectorAll('#kpis .kpi').length"))
        L(w, 'kpi labels', p.evaluate("[...document.querySelectorAll('#kpis .kpi .label, #kpis .kpi-label')].map(x=>x.innerText.trim()).join(' | ')"))
        L(w, 'childcare list visible', p.evaluate("(()=>{const e=document.querySelector('.ccc-card');return e?getComputedStyle(e).display:'none-missing'})()"))
        L(w, 'bench hidden', p.evaluate("(document.querySelector('#bench-card')||{}).hidden"))
        L(w, 'dash height', p.evaluate("(document.querySelector('#view-dashboard')||{}).scrollHeight"))
        L(w, 'hscroll', p.evaluate('document.documentElement.scrollWidth - innerWidth'))
        p.screenshot(path=f'{out}/dash_{w}.jpg', quality=60)
        L(w, 'errors', errs[:8] or 'none')
        p.close()
    b.close()
open(f'{out}/log.txt', 'w').write('\n'.join(log))
