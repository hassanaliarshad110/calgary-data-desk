import json, urllib.request, urllib.parse, time
H={'User-Agent':'Mozilla/5.0 CalgaryInsight/1.0'}
def get(u):
    for t in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=90).read()
        except Exception as e: err=e; time.sleep(5)
    raise err
def search(q, rows=12):
    d=json.loads(get('https://open.alberta.ca/api/3/action/package_search?rows=%d&q=%s'%(rows,urllib.parse.quote(q))))
    for p in d['result']['results']:
        print('CHK PKG',q[:30],'|',p['name'],'|',p['title'][:90])
        for r in p.get('resources',[])[:8]: print('CHK    ',r.get('format'),r.get('name','')[:70],r.get('url'))
for q in ['audited financial statements summary reports school authorities','approved school capital list','municipal affairs population list','class size reduction grant allocations','school jurisdiction funding profile','modular classroom allocations']:
    try: search(q)
    except Exception as e: print('CHK ERR',q,e)
for u in ['https://www.alberta.ca/system/files/ecc-class-size-reduction-grant-2026-27-school-year-allocations.pdf','https://www.alberta.ca/system/files/ecc-approved-school-capital-list-2026.pdf','https://www.alberta.ca/system/files/educ-approved-school-capital-list-2025.pdf','https://www.alberta.ca/system/files/educ-approved-school-capital-list-2024.pdf']:
    try: b=get(u); print('CHK GOT',u,len(b))
    except Exception as e: print('CHK NO',u,e)
