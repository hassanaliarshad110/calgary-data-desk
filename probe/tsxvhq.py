import json, os, re, socket, ssl, sys, urllib.request, concurrent.futures as cf
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
L = [x for x in json.load(open(os.path.join(here, 'ab_issuers_internal.json'))) if x[0] == 'TSXV']
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
SUF = {'inc', 'ltd', 'limited', 'corp', 'corporation', 'company', 'the', 'co', 'incorporated', 'plc'}
GEN = {'resources', 'energy', 'gold', 'metals', 'mining', 'exploration', 'capital', 'technologies', 'holdings', 'group', 'oil', 'petroleum', 'international', 'canada', 'global', 'ventures', 'industries', 'investment', 'financial', 'pharmaceuticals', 'software', 'royalties', 'properties', 'partners', 'scientific', 'sustainable', 'natural', 'acquisition', 'management', 'equity', 'mines', 'technology', 'corp', 'mortgage'}
def words(n):
    n = re.sub(r'\(.*?\)', ' ', n.lower()).replace('&', ' and ').replace("'", '')
    return [w for w in re.sub(r'[^a-z0-9 ]', ' ', n).split() if w not in SUF]
def cands(n):
    w = words(n); core = [x for x in w if x not in GEN] or w
    bases = {''.join(w), ''.join(core), '-'.join(w), ''.join(w[:2]), core[0] + (w[w.index(core[-1]) + 1] if w.index(core[-1]) + 1 < len(w) else ''), core[0]}
    if len(w) > 1: bases.add(w[0] + w[1][0])
    out = []
    for b in bases:
        if len(b) < 4: continue
        for tld in ('.com', '.ca'):
            out.append(b + tld)
    return list(dict.fromkeys(out))
def resolves(d):
    try: socket.getaddrinfo(d, 443); return True
    except Exception: return False
def fetch(u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36'}), timeout=15, context=CTX) as r:
            return r.geturl(), r.read(500000).decode('utf-8', 'replace')
    except Exception: return None, ''
PC = re.compile(r'\b([A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b')
CITY = re.compile(r'\b(Calgary|Edmonton|Vancouver|Toronto|Red Deer|Okotoks|Cochrane|Airdrie|Lethbridge|Saskatoon|Regina|Houston|Denver|London|Sherwood Park|St\. Albert|Nisku|Leduc|Canmore|Medicine Hat|Grande Prairie|Montreal|Winnipeg)\b')
def text(h): return ' '.join(re.sub(r'<[^>]+>', ' ', re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S | re.I)).replace('&nbsp;', ' ').split())
def one(x):
    ex, t, n, sec = x; w = [y for y in words(n) if len(y) > 2]
    key = [y for y in w if y not in GEN] or w
    res = {'ticker': t, 'name': n, 'site': None}
    for d in cands(n):
        if not resolves(d) and not resolves('www.' + d): continue
        for host in ('https://www.' + d, 'https://' + d):
            u, h = fetch(host)
            if not u: continue
            tt = text(h)[:20000].lower()
            hits = sum(1 for y in key if y in tt)
            if hits >= max(1, min(2, len(key))) and (t.lower() in tt or len(key) >= 2 or (key and len(key[0]) >= 6)):
                res['site'] = u.rstrip('/'); break
        if res['site']: break
    if not res['site']: return res
    base = res['site'].split('/')[0] + '//' + res['site'].split('/')[2]
    for p in ('', '/contact', '/contact-us', '/contact-us/', '/contact/', '/about', '/about-us', '/investors', '/company/contact'):
        u, h = fetch(base + p)
        if not u: continue
        tt = text(h)
        pcs = sorted({' '.join(m) for m in PC.findall(tt)})
        hq = [tt[max(0, m.start() - 10):m.start() + 160] for m in re.finditer(r'(head office|headquarters|corporate office|head-office|registered office)', tt, re.I)][:2]
        cities = {}
        for c in CITY.findall(tt): cities[c] = cities.get(c, 0) + 1
        if pcs or hq:
            m = PC.search(tt); res.update(page=u, postal=pcs[:6], hq=hq, cities=cities, ctx=' '.join(tt[max(0, m.start() - 150):m.end() + 5].split()) if m else '')
            break
    return res
with cf.ThreadPoolExecutor(16) as ex:
    R = list(ex.map(one, L))
json.dump(R, open(os.path.join(out, 'tsxv_hq.json'), 'w'), indent=1)
print('found sites', sum(1 for r in R if r['site']), 'with address', sum(1 for r in R if r.get('postal') or r.get('hq')), 'of', len(R))
