import json, os, re, sys, ssl, urllib.request, concurrent.futures as cf
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
U = {'SU': ['https://www.suncor.com/en-ca/contact-us', 'https://www.suncor.com/en-ca/about-us'], 'IMO': ['https://www.imperialoil.ca/en-ca/contact-us', 'https://www.imperialoil.ca/contact-us'],
 'CP': ['https://www.cpkcr.com/en/contact-us', 'https://investor.cpkcr.com/contact-us', 'https://www.cpkcr.com/en/about-cpkc'], 'CVE': ['https://www.cenovus.com/Contact-us', 'https://www.cenovus.com/contact-us'],
 'PPL': ['https://www.pembina.com/contact-us/', 'https://www.pembina.com/contact/'], 'CU': ['https://www.canadianutilities.com/en-ca/contact-us.html', 'https://www.canadianutilities.com/en-ca/about-us.html'],
 'ACO': ['https://www.atco.com/en-ca/contact-us.html', 'https://www.atco.com/en-ca/about-us.html'], 'STN': ['https://www.stantec.com/en/about/contact', 'https://www.stantec.com/en/offices/edmonton-head-office', 'https://www.stantec.com/en/about'],
 'POU': ['https://www.paramountres.com/contact-us/', 'https://www.paramountres.com/contact/'], 'BDGI': ['https://www.badgerinc.com/contact/', 'https://www.badgerinc.com/contact-us/'],
 'TVK': ['https://terravestindustries.com/contact/', 'https://terravestindustries.com/contact-us/'], 'SVI': ['https://www.storagevaultcanada.com/en/contact', 'https://www.storagevaultcanada.com/en/investors'],
 'SDE': ['https://www.spartandelta.com/contact', 'https://spartandelta.com/'], 'ACQ': ['https://www.autocan.ca/contact', 'https://www.autocan.ca/about-us', 'https://autocan.ca/'],
 'MRD': ['https://www.melcor.ca/contact-us', 'https://www.melcor.ca/contact'], 'MCB': ['https://www.mccoyglobal.com/contact', 'https://www.mccoyglobal.com/'],
 'RGSI': ['https://www.rockpointgs.com/contact', 'https://www.rockpointgs.com/'], 'ACB': ['https://www.auroramj.com/contact/', 'https://www.auroramj.com/contact-us/'],
 'CEMX': ['https://cematrix.com/contact/', 'https://cematrix.com/contact-us/'], 'GTE': ['https://www.grantierra.com/about-us/', 'https://www.grantierra.com/'],
 'OLY': ['https://www.olympiafinancial.com/contact', 'https://www.olympiafinancial.com/contact-us'], 'SHLE': ['https://www.sourceenergyservices.com/contact', 'https://www.sourceenergyservices.com/contact-us'],
 'LCFS': ['https://www.tidewater-renewables.com/contact', 'https://www.tidewater-renewables.com/contact-us'], 'E': ['https://evolutionpowerx.com/contact/', 'https://evolutionpowerx.com/contact-us/'],
 'WCP': ['https://www.wcap.ca/contact', 'https://www.wcap.ca/'], 'BEI': ['https://www.bwalk.com/en-ca/contact-us/', 'https://www.bwalk.com/en-ca/investors/'],
 'KRN': ['https://karnalyte.com/contact/'], 'SYZ': ['https://www.sylogist.com/contact/'], 'DXT': ['https://dexterra.com/en-ca/contact/'], 'CIU': ['https://www.canadianutilities.com/en-ca/contact-us.html']}
PC = re.compile(r'\b(T\d[A-Z]|[A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b')
def fetch(u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'Accept-Language': 'en-CA,en;q=0.9', 'Accept': 'text/html'}), timeout=25, context=CTX) as r:
            return r.geturl(), r.read(800000).decode('utf-8', 'replace')
    except Exception as e:
        return None, str(e)[:60]
def one(t):
    res = []
    for u in U[t]:
        g, h = fetch(u)
        if not g: res.append((u, 'ERR ' + h)); continue
        txt = ' '.join(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S | re.I).replace('&nbsp;', ' ').split())
        txt = re.sub(r'<[^>]+>', ' ', txt); txt = ' '.join(txt.split())
        hits = []
        for m in re.finditer(r'(head office|headquarters|corporate office|head-office|corporate head office)', txt, re.I):
            hits.append(txt[m.start():m.start() + 170])
        pcs = [' '.join(x) for x in PC.findall(txt)][:6]
        res.append((g, {'hq_text': hits[:3], 'postal': pcs}))
        if hits or pcs: break
    return t, res
with cf.ThreadPoolExecutor(10) as ex:
    for t, res in ex.map(one, list(U)):
        print('##', t)
        for u, r in res: print('   ', u, '|', json.dumps(r)[:600])
