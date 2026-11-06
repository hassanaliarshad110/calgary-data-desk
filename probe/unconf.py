import json, os, re, sys, subprocess
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True, capture_output=True)
from playwright.sync_api import sync_playwright
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'unconf.json')))
EXTRA = {'BDGI': 'https://www.badgerinc.com/contact-us/', 'TVK': 'https://terravestindustries.com/contact/', 'SDE': 'https://www.spartandelta.com/contact-us', 'MRD': 'https://www.melcor.ca/contact-us/',
         'RGSI': 'https://rgsi.com/contact/', 'CEMX': 'https://cematrix.com/contact/', 'GTE': 'https://www.grantierra.com/contact-us/', 'OLY': 'https://www.olympiafinancial.com/contact',
         'SHLE': 'https://www.sourceenergyservices.com/contact-us', 'LCFS': 'https://www.tidewater-renewables.com/', 'E': 'https://evolutionpowerx.com/', 'GASX': 'https://www.ngenergyintl.com/contact/'}
PC = re.compile(r'\b([A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b')
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale='en-CA')
    for t, (name, site) in T.items():
        urls = [EXTRA[t]] if t in EXTRA else []
        if site:
            base = '/'.join(site.split('/')[:3]); urls += [base, base + '/contact', base + '/contact-us', base + '/about', base + '/investors']
        found = None
        for u in urls:
            pg = ctx.new_page()
            try:
                pg.goto(u, timeout=25000, wait_until='domcontentloaded'); pg.wait_for_timeout(1800)
                txt = ' '.join(pg.inner_text('body').split())
                hq = [txt[max(0, m.start() - 10):m.start() + 170] for m in re.finditer(r'(head office|headquarters|corporate office|head-office|registered office|our office|address)', txt, re.I)][:3]
                pcs = sorted({' '.join(x) for x in PC.findall(txt)})[:6]
                m = PC.search(txt)
                if pcs or hq:
                    found = {'url': pg.url, 'hq': hq, 'postal': pcs, 'ctx': ' '.join(txt[max(0, m.start() - 170):m.end() + 5].split()) if m else '', 'title': pg.title()[:80]}
                    if pcs: pg.close(); break
            except Exception:
                pass
            pg.close()
        res[t] = found
        print('##', t, '|', name[:30], '|', json.dumps(found)[:520] if found else None, flush=True)
    b.close()
json.dump(res, open(os.path.join(out, 'unconf_res.json'), 'w'), indent=1)
