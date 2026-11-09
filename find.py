import json, urllib.request, io, time, re
from pypdf import PdfReader
import alberta
H={'User-Agent':'Mozilla/5.0 CalgaryInsight/1.0'}
def get(u):
    for t in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=120).read()
        except Exception as e: err=e; time.sleep(5)
    raise err
def pkg(n): return json.loads(get('https://open.alberta.ca/api/3/action/package_show?id='+n))['result']['resources']
def pdf(u, pages=2, n=45, tag=''):
    r=PdfReader(io.BytesIO(get(u))); print('CHK FILE',tag,len(r.pages),'pages')
    for i,p in enumerate(r.pages[:pages]):
        for l in (p.extract_text() or '').splitlines()[:n]: print('CHK',tag,i,l[:220])
mf=pkg('municipal-financial-and-statistical-data'); print('CHK MF',[ (r['name'],r['url']) for r in mf][-4:])
fp=pkg('projected-operational-funding-2026-2027-school-year-by-jurisdiction'); 
cal=[r for r in fp if re.search('calgary|edmonton-school|edmonton-catholic|edmonton-public',r['url'])]; print('CHK FP',len(fp),[r['url'] for r in cal])
if cal: pdf(cal[0]['url'],2,70,'PROFILE')
pdf('https://open.alberta.ca/dataset/fe4e405c-0bff-46e5-92b7-fd00524e9553/resource/1d06db2f-e69c-40c6-9c81-daad4035a8b7/download/ecc-afs-2024-2025-report-revenues-by-program.pdf',1,40,'REV')
pdf('https://open.alberta.ca/dataset/fe4e405c-0bff-46e5-92b7-fd00524e9553/resource/6dd374f4-5146-4696-8eef-5d8e96571074/download/ecc-afs-2024-2025-report-expenses-by-program.pdf',1,40,'EXP')
pdf('https://www.alberta.ca/system/files/educ-approved-school-capital-list-2025.pdf',1,45,'CAP25')
pdf('https://www.alberta.ca/system/files/ecc-class-size-reduction-grant-2026-27-school-year-allocations.pdf',1,25,'CSR')
x=mf[-1]['url']; rows=alberta.read_xlsx(get(x)); print('CHK MFX',x[-40:],len(rows)); print('CHK MFH',rows[0][:40])
for r in rows[1:]:
    if any('Calgary' == c.strip() or 'City of Calgary'==c.strip() for c in r[:4]): print('CHK MFC',r[:40]); break
