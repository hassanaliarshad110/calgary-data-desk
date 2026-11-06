import subprocess, sys, os
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True)
from playwright.sync_api import sync_playwright
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
URL = 'https://calgaryinsight.ca/?v=' + str(os.getpid())
log = []
def L(*a):
    s = ' '.join(str(x) for x in a); print(s); log.append(s)
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h in ((390, 844), (1440, 1000)):
        p = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        p.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        p.goto(URL, wait_until='networkidle', timeout=120000); p.wait_for_timeout(6000)
        L(w, 'url', p.url)
        L(w, 'title', p.title())
        L(w, 'brand', p.evaluate("(document.querySelector('.brand-text')||{}).innerText"))
        L(w, 'Data Desk in text', p.evaluate("document.body.innerText.includes('Data Desk')"))
        L(w, 'first video card', p.evaluate("(document.querySelector('#vid-grid > *')||{}).id"))
        L(w, 'video src', p.evaluate("(()=>{const v=document.querySelector('#vid-fedbudget2026 video');return v?(v.currentSrc||v.src||(v.querySelector('source')||{}).src):'none'})()"))
        L(w, 'hscroll', p.evaluate('document.documentElement.scrollWidth - innerWidth'))
        p.screenshot(path=f'{out}/home_{w}.jpg', quality=60)
        L(w, 'errors', errs[:8] or 'none')
        p.close()
    r = subprocess.run(['curl', '-sIL', 'https://calgaryinsight.ca/video/budget-2026-alberta-calgary.mp4'], capture_output=True, text=True)
    L('mp4 head', ' / '.join(l for l in r.stdout.splitlines() if l.lower().startswith(('http/', 'content-length', 'content-type'))))
    r = subprocess.run(['curl', '-sI', 'http://calgaryinsight.ca/'], capture_output=True, text=True)
    L('http->', ' / '.join(l for l in r.stdout.splitlines() if l.lower().startswith(('http/', 'location'))))
    b.close()
open(f'{out}/log.txt', 'w').write('\n'.join(log))
