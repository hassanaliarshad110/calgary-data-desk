import json, urllib.request, io, sys
from pypdf import PdfReader
def get(u): return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'CalgaryInsight/1.0'}),timeout=120).read()
for u in sys.argv[1:]:
    b=get(u); r=PdfReader(io.BytesIO(b)); print('CHK FILE',u,len(r.pages),'pages')
    for i,p in enumerate(r.pages[:3]):
        for line in (p.extract_text() or '').splitlines()[:60]: print('CHK',i,line)
