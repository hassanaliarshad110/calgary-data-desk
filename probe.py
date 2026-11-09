import json, urllib.request, io, re, sys
import alberta
def get(u): return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'CalgaryInsight/1.0'}),timeout=120).read()
from pypdf import PdfReader
def pdftext(b, pages=3):
    r=PdfReader(io.BytesIO(b)); print('CHK pages',len(r.pages)); return '\n'.join((p.extract_text() or '') for p in r.pages[:pages])
# 1. requisition comparison report
for q in ['education-property-tax-requisition-comparison-report','education property tax requisition comparison']:
    try:
        u='https://open.alberta.ca/api/3/action/package_show?id='+q if '-' in q else 'https://open.alberta.ca/api/3/action/package_search?rows=20&q='+urllib.parse.quote(q)
        d=json.loads(get(u))
        res=d['result']
        pk=[res] if 'resources' in res else res['results']
        for p in pk:
            print('CHK PKG',p.get('name'),p.get('id'),p.get('title'))
            for r in p.get('resources',[]): print('CHK   RES',r.get('name'),r.get('format'),r.get('url'),r.get('last_modified') or r.get('created'))
    except Exception as e: print('CHK ERR',q,e)
