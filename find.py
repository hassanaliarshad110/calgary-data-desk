import json, urllib.request, io, zipfile, csv, time
H={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0)'}
def get(u):
    for t in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=300).read()
        except Exception as e: err=e; time.sleep(5)
    raise err
for pid in (17100155, 17100142):
    try:
        url=json.loads(get(f'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{pid}/en'))['object']
        b=get(url); print('CHK',pid,'zip',len(b))
        z=zipfile.ZipFile(io.BytesIO(b)); name=next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
        n=0; hits=[]
        with z.open(name) as f:
            rd=csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig'))
            print('CHK cols',rd.fieldnames)
            for r in rd:
                n+=1
                g=r['GEO']
                if (g.startswith('Calgary') or g.startswith('Edmonton') or g=='Alberta') and r['REF_DATE']>='2024': hits.append((r['REF_DATE'],g,{k:v for k,v in r.items() if k not in ('REF_DATE','GEO','DGUID','UOM','UOM_ID','SCALAR_FACTOR','SCALAR_ID','VECTOR','COORDINATE','STATUS','SYMBOL','TERMINATED','DECIMALS')}))
        print('CHK rows',n); [print('CHK hit',h) for h in hits[:12]]
    except Exception as e: print('CHK err',pid,e)
