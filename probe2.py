import urllib.request, io, sys, time
from pypdf import PdfReader
H={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) CalgaryInsight/1.0','Accept':'application/pdf,*/*'}
def get(u): return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=120).read()
for u in sys.argv[1:]:
    for t in range(3):
        try:
            b=get(u); break
        except Exception as e:
            print('CHK fail',t,u[-70:],e); b=None; time.sleep(5)
    if not b: continue
    r=PdfReader(io.BytesIO(b)); print('CHK FILE',u[-70:],len(r.pages),'pages')
    for i,p in enumerate(r.pages[:3]):
        for line in (p.extract_text() or '').splitlines()[:60]: print('CHK',i,line)
