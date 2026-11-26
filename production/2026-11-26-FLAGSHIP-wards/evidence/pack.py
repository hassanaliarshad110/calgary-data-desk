import json, math
d=json.load(open('ward_eras.json')); base=json.load(open('/home/claude/studio/motion/geo/calgary_base.json'))
def dp(pts, tol):
    if len(pts)<4: return pts
    def dist(p,a,b):
        (x,y),(x1,y1),(x2,y2)=p,a,b; dx,dy=x2-x1,y2-y1
        if dx==dy==0: return math.hypot(x-x1,y-y1)
        t=max(0,min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy))); return math.hypot(x-x1-t*dx,y-y1-t*dy)
    st=[(0,len(pts)-1)]; keep={0,len(pts)-1}
    while st:
        i,j=st.pop(); best,bi=0,None
        for k in range(i+1,j):
            dd=dist(pts[k],pts[i],pts[j])
            if dd>best: best,bi=dd,k
        if best>tol: keep.add(bi); st+= [(i,bi),(bi,j)]
    return [pts[k] for k in sorted(keep)]
def simp(polys,tol=35):
    out=[]
    for poly in polys:
        rr=[dp(r,tol) for r in poly]; rr=[r for r in rr if len(r)>=4]
        if rr and abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for r in rr[:1] for i in range(len(r)-1)))/2>20000: out.append(rr)
    return out
def cen(polys):
    best=max((p[0] for p in polys), key=lambda r: abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))))
    A=cx=cy=0
    for i in range(len(best)-1):
        (x0,y0),(x1,y1)=best[i],best[i+1]; c=x0*y1-x1*y0; A+=c; cx+=(x0+x1)*c; cy+=(y0+y1)*c
    return [round(cx/(3*A)), round(cy/(3*A))]
eras={}
for e,v in d['eras'].items():
    eras[e]={'src':v['src'],'wards':{k:{'polys':simp(w['polys']),'c':cen(w['polys']),'pop':w.get('pop')} for k,w in v['wards'].items()}}
lim=[{'label':l['label'],'start':l['start'],'end':l['end'],'polys':simp(l['polys'],30)} for l in d['limits']]
base['eras']=eras; base['limits']=lim
json.dump(base, open('geo_wards.json','w'), separators=(',',':'))
import os; print(os.path.getsize('geo_wards.json')//1024,'KB')
print({e:{k:w['c'] for k,w in v['wards'].items()} for e,v in list(eras.items())[-1:]})
