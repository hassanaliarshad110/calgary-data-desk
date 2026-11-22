import json,sys
info=json.load(open('aud_info.json'))
PLAN=[
('poem',['n01'],0.6,0.5),('poemcard',['n02'],0.3,0.6),('dawncar',['n03'],0.3,0.6),('graves',['n04'],0.3,0.8),('name',['n05'],0.3,0.6),('promise',['n06'],0.3,0.6),
('title',[],4.0,0),
('ch1',[],2.6,0),('rowena',['n07'],0.3,0.5),('wedding',['n08','n09'],0.3,0.6),('clyde',['n10'],0.3,0.6),('meet',['n11','n12'],0.3,0.8),
('ch2',[],2.6,0),('jail',['n13','n14'],0.3,0.5),('axe',['n15','n16'],0.3,0.5),('free',['n17'],0.3,0.8),
('ch3',[],2.6,0),('road',['n18'],0.4,0.6),('robin',['n19'],0.3,0.5),('victims',['n20'],0.3,0.8),('crash',['n21','n22'],0.3,0.6),('know',['n23'],0.4,1.4),
('ch4',[],2.6,0),('ambush',['n24'],0.4,0.6),('ford',['n25'],0.3,0.6),('shots',['n26'],1.8,1.2),('ages',['n27'],0.4,0.8),('trail',['n28'],0.3,1.2),
('ch5',[],2.6,0),('wish',['n29'],0.4,0.6),('plot',['n30'],0.3,0.5),('mother',['n31','d01'],0.3,1.0),('crownhill',['n32'],0.3,0.5),('western',['n33'],0.3,0.6),('court',['n34'],0.3,0.9),
('ch6',[],2.6,0),('bloomberg',['n35'],0.4,0.5),('trailer',['n36'],0.3,0.5),('match1',['n37'],0.3,0.8),('match2',['n38'],0.3,0.8),('way',['n39'],0.3,0.6),('launch',['n40'],0.3,0.5),('controller',['n41'],0.3,0.6),('empty',['n42'],0.4,2.0),
('question',['n43'],0.3,0.8),('end',['n44'],0.2,3.0),
]
GAP={('n','n'):0.45,('n','d'):0.7,('d','d'):0.35,('d','n'):0.6}
T=0; scenes=[]; lines={}
for sid,ls,pre,post in PLAN:
    st=T; t=st+pre; prev=None; li=[]
    for l in ls:
        if prev: t+=GAP[(prev[0],l[0])]
        lines[l]=dict(start=round(t,3),dur=info[l]['dur'],spk=info[l]['spk'],roman=info[l]['roman'])
        li.append(l); t+=info[l]['dur']; prev=l
    t+=post; dur=round(t-st,3)
    scenes.append(dict(id=sid,start=round(st,3),dur=dur,lines=li)); T=t
amp={k:info[k]['amp'] for k in lines}
open('timeline.js','w').write('const SCENES='+json.dumps(scenes)+';\nconst LINES='+json.dumps(lines,ensure_ascii=False)+';\nconst AMP='+json.dumps(amp)+';\nconst TOTAL='+str(round(T,3))+';\n')
json.dump(dict(scenes=scenes,lines=lines,total=T),open('timeline.json','w'),ensure_ascii=False,indent=0)
print('total',round(T,1),'scenes',len(scenes))
if '-v' in sys.argv:
    for s in scenes: print(s['id'],s['start'],s['dur'])
