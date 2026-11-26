import csv, json, math, sys
csv.field_size_limit(10**9)
LAT0, LON0 = 51.0447, -114.0719
KX = 111320*math.cos(math.radians(LAT0)); KY = 110540
def xy(lon, lat): return [round((lon-LON0)*KX), round((lat-LAT0)*KY)]
def parse_wkt(s):
    s=s.strip(); multi=s.startswith('MULTIPOLYGON'); body=s[s.index('('):]
    import re
    polys=[]
    # split polygons
    if multi:
        parts=re.split(r'\)\)\s*,\s*\(\(', body.strip()[3:-3])
    else:
        parts=[body.strip()[2:-2]]
    for p in parts:
        rings=re.split(r'\)\s*,\s*\(', p)
        pr=[]
        for r in rings:
            pts=[tuple(map(float,q.split())) for q in r.replace('(','').replace(')','').split(',')]
            pr.append([xy(a,b) for a,b in pts])
        polys.append(pr)
    return polys
def geo_polys(g):
    if g['type']=='Polygon': cs=[g['coordinates']]
    else: cs=g['coordinates']
    return [[[xy(a,b) for a,b,*_ in r] for r in poly] for poly in cs]
def area(polys):
    A=0
    for poly in polys:
        for k,r in enumerate(poly):
            a=sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))/2
            A+= abs(a) if k==0 else -abs(a)
    return A/1e6
B=B1=B2='/home/claude/wards/raw/'
eras={}
for era,yr in [(1998,1999),(2001,2002),(2004,2005),(2007,2008),(2010,2011)]:
    r=list(csv.DictReader(open((B if yr<2018 else B2)+f'cw_{yr}.csv')))
    eras[era]={'src':f'Census by Ward {yr}','wards':{x['WARD_NUM'].strip():{'polys':parse_wkt(x['the_geom']),'pop':int(float(x['RES_CNT'] or 0)),'electors':int(float(x['ELECT_CNT'] or 0)) if x.get('ELECT_CNT') else None} for x in r}}
for era,f,src in [(2013,B2+'g_w2013.geojson','Ward Boundaries 2013-2017 (mjit-gete)'),(2017,B1+'w2017.geojson','Ward Boundaries 2017-2021 (au4g-xjwh)'),(2025,B1+'wcur.geojson','Ward Boundaries (tz8z-hyaz)'),(2021,B2+'g_w2021.geojson','Ward Boundaries for 2021 General Election (bxgr-t8xb)')]:
    d=json.load(open(f))
    eras[era]={'src':src,'wards':{}}
    for ft in d['features']:
        p=ft['properties']; n=str(p.get('ward_num') or p.get('WARD_NUM') or p.get('wardnumber') or '').strip().replace('.0','')
        if p.get('sum_res_cnt'): pass
        eras[era]['wards'][n]={'polys':geo_polys(ft['geometry'])}
        if p.get('sum_res_cnt'): eras[era]['wards'][n]['pop']=int(float(p['sum_res_cnt'])); eras[era]['wards'][n]['dev']=float(p['deviation'])
# census pops for 2013+ eras
for era,yr in [(2013,2014),(2017,2018)]:
    f=B+f'cw_{yr}.csv' if yr<2018 else B2+f'cw_{yr}.csv'
    for x in csv.DictReader(open(f)): eras[era]['wards'].setdefault(x['WARD_NUM'].strip(),{})['pop']=int(float(x['RES_CNT'] or 0))
base=json.load(open('/home/claude/studio/motion/geo/calgary_base.json'))
basew={it['name']:it['polys'] for it in base['wards']['items']}; print('proj check base vs mine ward1 first pt', basew['1'][0][0][:2], eras[2025]['wards']['1']['polys'][0][0][:2])
prev=None
for era in sorted(eras):
    ws=eras[era]['wards']; ar={k:area(v['polys']) for k,v in ws.items()}
    tot=sum(ar.values())
    ch=None
    if prev: ch=sum(abs(ar.get(k,0)-prev.get(k,0)) for k in set(ar)|set(prev))/2
    print(era, sorted(ws, key=lambda s:int(s)), 'total km2 %.1f'%tot, 'changed km2 %s'%(round(ch,1) if ch is not None else '-'), {k:round(v) for k,v in sorted(ar.items(), key=lambda z:int(z[0]))})
    prev=ar
lim=json.load(open(B+'limits_a.geojson'))
L=[{'label':f['properties']['label'],'start':int(f['properties']['start_year']),'end':int(f['properties']['end_year'] or 9999),'polys':geo_polys(f['geometry'])} for f in lim['features']]
for l in L: print('limit',l['label'], round(area(l['polys']),1))
json.dump({'eras':{str(k):v for k,v in eras.items()},'limits':L}, open('ward_eras.json','w'))
