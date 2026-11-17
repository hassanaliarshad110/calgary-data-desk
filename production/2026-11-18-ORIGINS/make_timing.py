import json,sys
sys.path.insert(0,'/home/claude/work'); import episode as E
d=json.load(open('/home/claude/sp_out_final/durs.json'))
cues=json.load(open('/home/claude/work/out/cues_film.json'))
t=.3; rows=[]; starts=[]
for i,l in enumerate(E.L):
    starts.append(t); g=l['gap'] if l['gap'] is not None else .85; t+=d['v'][i]+g
starts.append(t); tot=t+d['e'][0]+4.2
def fmt(x): m=int(x//60); return f"{m:02d}:{x-60*m:05.2f}"
for i,l in enumerate(E.L):
    a=0 if i==0 else starts[i]; b=starts[i+1]
    sfx=[c['sfx'] for c in cues if a<=c['t']<b]
    rows.append(dict(i=f"S{i:02d}",**{'in':fmt(a)},out=fmt(b),dur=round(b-a,2),scene=f"P{l['ch']} {l['v']['kind']}",trans='—',cap=f"L{i}",sfx=', '.join(sorted(set(sfx))) or 'music bed'))
rows.append(dict(i='END',**{'in':fmt(starts[-1])},out=fmt(tot),dur=round(tot-starts[-1],2),scene='end card (Comment below · Follow + Subscribe · More at calgaryinsight.ca)',trans='dissolve',cap='E-film',sfx='swell, click'))
ch=[]
for n in range(1,5):
    i=[k for k,l in enumerate(E.L) if l['ch']==n][0]; x=0 if i==0 else starts[i]
    ch.append(dict(n=n,title=E.CH_TITLES[n],t=f"{int(x//60)}:{int(x%60):02d}"))
json.dump(dict(film=rows,chapters=ch,total=round(tot,2)),open('/home/claude/work/timing.json','w'),indent=1)
print(ch, round(tot,2))
