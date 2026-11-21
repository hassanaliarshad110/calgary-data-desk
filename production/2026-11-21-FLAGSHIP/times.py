import sys
VD=[4.523,5.463,5.44,7.127,6.913,6.677,14.04,8.641,8.108,6.807,17.433,2.688,3.2,9.921,5.5,3.358]
IDX={'T0':0,'T1':13,'T2':14,'L13':15}
O={'wide':['L0','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13'],'short':['L0','L1','L3','L5','L6','L8','L10','L13'],'teaser':['T0','T1','T2']}
def sched(cut):
    t=.3; out=[]; gap=.35 if cut=='teaser' else .4; tail=1.0 if cut=='teaser' else .6
    ids=O[cut]
    for i,id in enumerate(ids):
        d=VD[IDX.get(id, int(id[1:]) if id[0]=='L' else 0)]
        g=.8 if id==('L3' if cut=='short' else 'L4') else (tail if i==len(ids)-1 else gap)
        out.append((id,t,d)); t+=d+g
    return out,t
cut=sys.argv[1]; s,tot=sched(cut)
for i,(id,st,d) in enumerate(s):
    s0=0 if i==0 else st; s1=s[i+1][1] if i+1<len(s) else tot
    print(id, round(s0,2), round(s1,2), 'mid', round((s0+s1)/2,2), 'late', round(s0+(s1-s0)*.8,2))
print('total', round(tot,3))
