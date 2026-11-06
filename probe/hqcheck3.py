import json, os, re, sys, subprocess, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True, capture_output=True)
from playwright.sync_api import sync_playwright
U = {'SU': 'https://www.suncor.com/en-ca/contact-us', 'IMO': 'https://www.imperialoil.ca/en-ca/contact-us', 'CVE': 'https://www.cenovus.com/', 'PPL': 'https://www.pembina.com/',
 'CU': 'https://www.canadianutilities.com/en-ca.html', 'CIU': 'https://www.canadianutilities.com/en-ca.html', 'ACO': 'https://www.atco.com/en-ca.html', 'STN': 'https://www.stantec.com/en/about/contact',
 'POU': 'https://www.paramountres.com/', 'BDGI': 'https://www.badgerinc.com/', 'TVK': 'https://terravestindustries.com/', 'SVI': 'https://www.storagevaultcanada.com/',
 'SDE': 'https://www.spartandelta.com/', 'ACQ': 'https://www.autocan.ca/', 'MRD': 'https://www.melcor.ca/', 'RGSI': 'https://rgsi.com/', 'ACB': 'https://www.auroramj.com/contact/',
 'CEMX': 'https://cematrix.com/contact/', 'GTE': 'https://www.grantierra.com/contact-us/', 'OLY': 'https://www.olympiafinancial.com/contact', 'SHLE': 'https://www.sourceenergyservices.com/contact-us',
 'LCFS': 'https://www.tidewater-renewables.com/', 'E': 'https://evolutionpowerx.com/', 'BEI': 'https://www.bwalk.com/en-ca/contact-us/'}
WIKI = {'SU': 'Suncor Energy', 'IMO': 'Imperial Oil', 'CVE': 'Cenovus Energy', 'PPL': 'Pembina Pipeline', 'CU': 'Canadian Utilities', 'ACO': 'ATCO', 'STN': 'Stantec', 'POU': 'Paramount Resources',
 'BDGI': 'Badger Infrastructure Solutions', 'TVK': 'TerraVest Industries', 'SVI': 'StorageVault Canada', 'ACQ': 'AutoCanada', 'MRD': 'Melcor Developments', 'ACB': 'Aurora Cannabis',
 'GTE': 'Gran Tierra Energy', 'BEI': 'Boardwalk Real Estate Investment Trust', 'SDE': 'Spartan Delta', 'CEMX': 'CEMATRIX', 'OLY': 'Olympia Financial Group', 'SHLE': 'Source Energy Services'}
PC = re.compile(r'\b([A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b')
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale='en-CA')
    for t, u in U.items():
        pg = ctx.new_page()
        try:
            pg.goto(u, timeout=40000, wait_until='domcontentloaded'); pg.wait_for_timeout(2500)
            txt = ' '.join(pg.inner_text('body').split())
            hits = [txt[m.start():m.start() + 170] for m in re.finditer(r'(head office|headquarters|corporate office|head-office)', txt, re.I)][:2]
            pcs = sorted({' '.join(x) for x in PC.findall(txt)})[:6]
            foot = txt[-260:]
            print('##', t, pg.url, '|', json.dumps({'hq': hits, 'postal': pcs, 'foot': foot})[:700])
        except Exception as e:
            print('##', t, 'ERR', str(e)[:100])
        pg.close()
    b.close()
for t, n in WIKI.items():
    try:
        q = urllib.parse.urlencode({'action': 'parse', 'page': n, 'prop': 'wikitext', 'section': 0, 'format': 'json', 'redirects': 1})
        w = json.loads(urllib.request.urlopen(urllib.request.Request('https://en.wikipedia.org/w/api.php?' + q, headers={'User-Agent': 'CalgaryDataDesk/1.0 (https://hassanaliarshad110.github.io/calgary-data-desk/)'}), timeout=30).read())
        wt = w['parse']['wikitext']['*']
        m = re.search(r'\|\s*(hq_location_city|hq_location|headquarters|location_city|location)\s*=\s*([^\n]+)', wt)
        print('WIKI', t, '|', m.group(2)[:120] if m else None)
    except Exception as e:
        print('WIKI', t, 'ERR', str(e)[:80])
