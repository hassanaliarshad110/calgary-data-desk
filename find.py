import json, urllib.request, io, time, re
from pypdf import PdfReader
import alberta
H={'User-Agent':'Mozilla/5.0 CalgaryInsight/1.0'}
def get(u):
    for t in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=120).read()
        except Exception as e: err=e; time.sleep(5)
    raise err
def pkg(n): return json.loads(get('https://open.alberta.ca/api/3/action/package_show?id='+n))['result']
def pdftext(u): return [l for p in PdfReader(io.BytesIO(get(u))).pages for l in (p.extract_text() or '').splitlines()]
pl=pkg('8dae0ffd-dbb7-46f7-89eb-efa64b2ce385')
print('CHK POPNAMES',[(x['name'],x['format']) for x in pl['resources']][:6])
r=sorted([x for x in pl['resources'] if x['format'].upper() in ('XLSX','CSV')], key=lambda x: x['name'])
if r:
    b=get(r[-1]['url']); print('CHK POPFILE',r[-1]['name'],r[-1]['url'][-60:],len(b))
    try:
        rows=alberta.read_xlsx(b)
    except Exception as e:
        print('CHK popxlsx err',e); rows=[]
    print('CHK POPROWS',len(rows))
    for x in rows[:6]: print('CHK POPR',x[:12])
    for x in [x for x in rows if any('Calgary' in c for c in x[:4])][:3]: print('CHK POPC',x[:12])
fp=pkg('projected-operational-funding-2026-2027-school-year-by-jurisdiction')['resources']
for x in fp:
    if re.search(r'(calgary|edmonton)', x['url']) : print('CHK FPU',x['name'],x['url'])
for y in (2023,2022,2021):
    for pre in ('educ','ecc','edc'):
        u=f'https://www.alberta.ca/system/files/{pre}-approved-school-capital-list-{y}.pdf'
        try:
            L=pdftext(u); print('CHK CAP',y,u,[l for l in L if re.search(r'total of|Calgary|Edmonton',l)][:6]); break
        except Exception as e: print('CHK nocap',y,pre,e)
L=pdftext('https://www.alberta.ca/system/files/educ-approved-school-capital-list-2024.pdf'); print('CHK CAP24',[l for l in L if re.search(r'total of|Calgary|Edmonton',l)][:8])
