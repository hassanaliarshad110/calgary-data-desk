import json
info=json.load(open('aud_info.json'))
# (scene_id, [lines], pre, post)  ; chapter cards have lines=[] and fixed dur
PLAN=[
('dinner',['n01','n02'],0.5,0.3),('alice',['n03'],0.2,0.3),('agents',['n04'],0.2,0.3),('cork',['n05'],0.2,0.3),
('toast',['n06','d01'],0.2,0.6),('tease',['n07'],0.2,0.2),('title',[],3.2,0),
('ch1',[],2.6,0),('flight',['n08'],0.3,0.4),('school',['n09'],0.2,0.4),('chores',['n10'],0.2,0.4),('roomie',['n11'],0.2,0.3),
('teach',['n12'],0.2,0.4),('diner',['n13'],0.2,0.4),('booth',['n14'],0.2,0.3),('six',['n15'],0.2,0.6),
('ch2',[],2.6,0),('chef',['n16'],0.2,0.3),('cooks',['n17'],0.2,0.4),('ai',['n18'],0.2,0.3),('five',['n19'],0.2,0.5),('keyman',['n20'],0.2,0.6),
('ch3',[],2.6,0),('call',['n21','d02'],0.3,0.4),('share',['n22'],0.2,0.4),('rent',['n23','n24'],0.2,0.6),
('ch4',[],2.6,0),('mega',['n25'],0.2,0.4),('bar',['n26','d03','d04','d05'],0.2,0.6),('ship',['n27'],0.2,0.3),('dc',['n28'],0.2,0.3),
('boxes',['n29','d06','d07','d08'],0.2,0.5),('doj',['n30'],0.2,0.3),('big',['n31'],0.2,0.6),
('ch5',[],2.6,0),('listen',['n32','d09','d10','d11'],0.2,0.5),('memo',['n33','n34'],0.2,0.4),('nobody',['n35'],0.2,0.4),('paper',['n36'],0.2,0.6),
('ch6',[],2.6,0),('letter',['n37','n38'],0.2,0.6),('board',['n39'],0.2,0.3),('caveat',['n40'],0.2,0.6),
('empty',['n41'],0.4,0.5),('question',['n42'],0.2,0.4),('end',['n43'],0.2,3.0),
]
GAP={('n','n'):0.32,('n','d'):0.45,('d','d'):0.35,('d','n'):0.45}
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
for s in scenes: print(s['id'],s['start'],s['dur'])
