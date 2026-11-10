import csv, io, json, urllib.request, zipfile, re, time
WDS='https://www150.statcan.gc.ca/t1/wds/rest/'
UA={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0; civic data)'}
def get(u,d=None):
    h=dict(UA)
    if d is not None: h['Content-Type']='application/json'
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,data=d,headers=h),timeout=900) as r: return r.read()
        except Exception as e:
            print('retry',u,e); time.sleep(10)
    raise RuntimeError(u)
CITY=re.compile(r'^(Calgary|Edmonton|Vancouver|Winnipeg|Ottawa|Toronto), [A-Za-z ]+, municipal')
out={}
meta=json.loads(get(WDS+'getCubeMetadata',json.dumps([{'productId':t} for t in [18100005,35100179,35100180,35100181,35100182,35100183]]).encode()))
for m in meta:
    if m.get('status')=='SUCCESS': o=m['object']; print(o['productId'],o.get('cubeTitleEn'),o.get('cubeEndDate'))
def full(t):
    url=json.loads(get(f'{WDS}getFullTableDownloadCSV/{t}/en'))['object']
    z=zipfile.ZipFile(io.BytesIO(get(url)))
    name=next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
    return z, name
# CPI annual
z,n=full(18100005); rows=[]
with z.open(n) as f:
    for r in csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig')):
        if r['GEO'] in ('Calgary, Alberta','Alberta','Canada','Edmonton, Alberta') and r['Products and product groups']=='All-items' and r['REF_DATE']>='2015':
            rows.append((r['REF_DATE'],r['GEO'],r['VALUE']))
out['cpi']=rows; print('cpi',len(rows))
KEEP={'Total, all Criminal Code violations (excluding traffic) [50]','Total violent Criminal Code violations [100]','Total property crime violations [200]','Total, all violations [0]','Total Criminal Code violations (excluding traffic) [50]'}
STATS={'Actual incidents','Rate per 100,000 population','Total cleared','Cleared by charge','Cleared otherwise'}
for t in [35100180,35100181,35100183,35100184]:
    try:
        z,n=full(t); rows=[]; viol=set()
        with z.open(n) as f:
            for r in csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig')):
                if CITY.match(r['GEO']) and r['REF_DATE']>='2015' and r['Statistics'] in STATS:
                    if r['Violations'].startswith('Total'): viol.add(r['Violations'])
                    if r['Violations'] in KEEP: rows.append((r['REF_DATE'],r['GEO'],r['Violations'],r['Statistics'],r['VALUE']))
        print(t,len(rows),sorted(viol)[:30]); out[str(t)]=rows
    except Exception as e: print(t,'ERR',e)
json.dump(out,open('out/statcan2.json','w')); print('done')
