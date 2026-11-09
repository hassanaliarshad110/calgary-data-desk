import json, urllib.request, re
H={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0)'}
d=json.loads(urllib.request.urlopen(urllib.request.Request('https://www150.statcan.gc.ca/t1/wds/rest/getAllCubesListLite',headers=H),timeout=300).read())
pat=re.compile(r'(airport|port of entry|census metropolitan area visits|travellers entering|non-resident visitors|visitor travel|national travel survey|tourism|traveller accommodation|overnight|trips and expenditures|frontier)',re.I)
for c in d:
    t=c.get('cubeTitleEn','')
    if pat.search(t) and not c.get('archived')=='1':
        print('CHK',c['productId'],c.get('cubeStartDate','')[:7],c.get('cubeEndDate','')[:7],c.get('archived'),t[:170])
