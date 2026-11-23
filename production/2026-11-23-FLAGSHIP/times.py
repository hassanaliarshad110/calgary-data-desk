import json,sys
VD=json.load(open('/home/claude/sp_out/durs.json'))['v']
IDX={'T0':0,'T1':16,'T2':17}
O={'wide':['L%d'%i for i in range(16)],'short':['L0','L1','L2','L3','L5','L6','L8','L9','L11','L12','L15'],'teaser':['T0','T1','T2']}
cut=sys.argv[1]; ids=O[cut]; t=.3; gap=.35 if cut=='teaser' else .4; tail=1.2 if cut=='teaser' else 1.4; out=[]
for i,id in enumerate(ids):
    d=VD[IDX.get(id, int(id[1:]) if id[0]=='L' else 0)]
    g=.8 if i+1<len(ids) and ids[i+1]=='L8' else (tail if i==len(ids)-1 else gap)
    out.append((id,t,d)); t+=d+g
for i,(id,st,d) in enumerate(out):
    s0=0 if i==0 else st; s1=out[i+1][1] if i+1<len(out) else t
    print(id, round(s0,2), round(s1,2), 'mid', round((s0+s1)/2,2), 'late', round(s0+(s1-s0)*.85,2))
print('total', round(t,2))
