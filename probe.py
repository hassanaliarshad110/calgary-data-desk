import csv, io, json, urllib.request, zipfile, re, time
WDS='https://www150.statcan.gc.ca/t1/wds/rest/'
UA={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0; civic data)'}
def get(u,d=None):
    h=dict(UA)
    if d is not None: h['Content-Type']='application/json'
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,data=d,headers=h),timeout=600) as r: return r.read()
        except Exception as e:
            print('retry',u,e); time.sleep(10)
    raise RuntimeError(u)
CITIES=['Calgary','Edmonton','Vancouver','Winnipeg','Ottawa','Toronto']
def want(geo):
    g=re.sub(r'\s*\[\d+\]\s*$','',geo)
    return any(g.startswith(c+',') for c in CITIES) or g.startswith('Ottawa') or g.startswith('Toronto')
out={}
tables=[35100077,35100186,35100187,35100188,35100189,35100061,35100190,35100063,35100064,35100026,35100178,35100184,35100059,35100076]
meta=json.loads(get(WDS+'getCubeMetadata',json.dumps([{'productId':t} for t in tables]).encode()))
for m in meta:
    if m.get('status')=='SUCCESS':
        o=m['object']; print(o['productId'],o.get('cubeTitleEn'),o.get('cubeStartDate'),o.get('cubeEndDate'),o.get('releaseTime'))
for t in tables:
    try:
        url=json.loads(get(f'{WDS}getFullTableDownloadCSV/{t}/en'))['object']
        z=zipfile.ZipFile(io.BytesIO(get(url)))
        name=next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
        rows=[];cols=None;stats=set();geos=set()
        with z.open(name) as f:
            rd=csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig'))
            cols=rd.fieldnames
            for r in rd:
                stats.add(r.get('Statistics') or r.get('Violations') or '')
                if want(r['GEO']) and r['REF_DATE']>='2015':
                    geos.add(r['GEO'])
                    rows.append({k:r[k] for k in cols if k not in ('DGUID','UOM_ID','SCALAR_ID','VECTOR','COORDINATE','SYMBOL','TERMINATED','DECIMALS')})
        print(t,'cols',cols); print(t,'stats',sorted(stats)[:80]); print(t,'geos',sorted(geos))
        if len(rows)<60000:
            out[t]=rows
        else:
            print(t,'rows',len(rows),'too many; filtering to Total violations-ish')
            out[t]=[r for r in rows if re.search(r'Total|Homicide|Total violent|Total property|Total, all', r.get('Violations',''))]
    except Exception as e:
        print(t,'ERR',e)
json.dump(out,open('out/statcan_police.json','w'))
print('done',{k:len(v) for k,v in out.items()})
