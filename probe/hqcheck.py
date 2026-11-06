import json, os, re, sys, urllib.request, concurrent.futures as cf
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
D = dict(l.split(' ', 1) for l in '''ENB enbridge.com
CNQ cnrl.com
SU suncor.com
CP cpkcr.com
TRP tcenergy.com
IMO imperialoil.ca
CVE cenovus.com
PPL pembina.com
TOU tourmalineoil.com
WCP wcpd.com
ALA altagas.ca
KEY keyera.com
CU canadianutilities.com
STN stantec.com
CPX capitalpower.com
SOBO southbow.com
SCR strathconaresources.com
PSK prairiesky.com
ACO atco.com
TA transalta.com
TVE tamarackvalley.ca
GEI gibsonenergy.com
ATH atha.com
PEY peyto.com
BTE baytexenergy.com
TPZ topazenergy.ca
POU paramountres.com
EFX enerflex.com
CEU cesenergysolutions.com
BDGI badgerinc.com
HWX headwaterexp.com
BEI bwalk.com
FRU freeholdroyalties.com
MTL mullen-group.com
PXT parexresources.com
SDE spartandelta.com
VET vermilionenergy.com
TVK terravestindustries.com
CJ cardinalenergy.ca
TNZ tenazenergy.com
KEL keltexploration.com
GFR greenfireres.com
AAV advantageog.com
SVI storagevaultcanada.com
BIR birchcliffenergy.com
MEQ mainst.biz
AD alarisequitypartners.com
PD precisiondrilling.com
BDI blackdiamondgroup.com
TOT totalenergy.ca
ACX actenergy.com
AKT akita-drilling.com
ACB auroramj.com
ACQ autocan.ca
BNG bengalenergy.ca
BR bigrockbeer.com
BNE bonterraenergy.com
BRY brichem.com
CFW calfrac.com
CVVY cavvyenergy.com
CEMX cematrix.com
CMG cmgl.ca
CDR condorenergies.ca
CIU canadianutilities.com
DXT dexterra.com
DRT dirtt.com
ESI ensignenergy.com
FLNT flintcorp.com
GDC genesisland.com
GTE grantierra.com
HWO haes.ca
IPO inplayoil.com
JOY journeyenergy.ca
KRN karnalyte.com
KBL k-brolinen.com
MXG maximpowercorp.com
MCB mccoyglobal.com
MRD melcor.ca
GASX ngenergyintl.com
NOA nacg.ca
SFD nxtenergy.com
OBE obsidianenergy.com
OLY olympiafinancial.com
PSI pason.com
PRQ petrusresources.com
PHX phxtech.com
PNE pinecliffenergy.com
PPR ppr.ca
PSD pulseseismic.com
QEC questerre.com
RVX resverlogix.com
RGSI rockpointgs.com
RBY rubelliteenergy.com
SHLE sourceenergyservices.com
SGY surgeenergy.ca
SYZ sylogist.com
TWM tidewatermidstream.com
LCFS tidewaterrenewables.com
TXP touchstoneexploration.com
TCW trican.ca
WRG wesc.ca
YGR yangarra.ca
E evolutionpowerx.com'''.splitlines())
PATHS = ['', '/contact', '/contact-us', '/contact-us/', '/about-us/contact-us', '/contact/', '/company/contact-us', '/investors', '/about']
PC = re.compile(r'\b(T\d[A-Z])\s?(\d[A-Z]\d)\b')
CITY = re.compile(r'\b(Calgary|Edmonton|Okotoks|Vegreville|Acheson|Red Deer|Toronto|Vancouver|Houston|Denver|Kansas City|Saskatoon|Mississauga|Sherwood Park|Leduc|Spruce Grove|Lethbridge)\b')
def fetch(u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}), timeout=25) as r:
            return r.geturl(), r.read(600000).decode('utf-8', 'replace')
    except Exception as e:
        return None, str(e)[:80]
def one(t):
    dom = D[t]; res = {'ticker': t, 'site': 'https://www.' + dom, 'pages': []}
    for p in PATHS:
        u, h = fetch('https://www.' + dom + p)
        if not u:
            if p == '':
                u, h = fetch('https://' + dom)
                if not u: res['error'] = h; break
            else: continue
        txt = re.sub(r'<[^>]+>', ' ', h)
        pcs = sorted({' '.join(m) for m in PC.findall(txt)})
        cities = {}
        for c in CITY.findall(txt): cities[c] = cities.get(c, 0) + 1
        # the street line around the first postal code
        m = PC.search(txt); ctx = ' '.join(txt[max(0, m.start() - 160):m.end() + 10].split()) if m else ''
        title = re.search(r'<title[^>]*>([^<]{0,120})', h, re.I)
        res['pages'].append({'url': u, 'title': title.group(1).strip() if title else '', 'postal': pcs[:6], 'cities': cities, 'ctx': ctx[-200:]})
        if pcs: break
    return res
with cf.ThreadPoolExecutor(12) as ex:
    R = list(ex.map(one, list(D)))
json.dump(R, open(os.path.join(out, 'hq.json'), 'w'), indent=1)
for r in R:
    p = next((x for x in r['pages'] if x['postal']), r['pages'][-1] if r['pages'] else {})
    print(r['ticker'], '|', r.get('error', ''), '|', p.get('url'), '|', p.get('postal'), '|', dict(sorted(p.get('cities', {}).items(), key=lambda x: -x[1])[:3]), '|', p.get('ctx', '')[-110:])
