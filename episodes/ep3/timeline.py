import json,sys
info=json.load(open('aud_info.json'))
PLAN=[
('stock',['n01'],0.5,0.4),('memo',['n02'],0.2,0.3),('mss',['n03'],0.2,0.5),('world',['n04'],0.2,0.4),('india',['n05','n06'],0.2,0.6),
('title',[],3.6,0),
('ch1',[],2.6,0),('honey',['n07'],0.3,0.3),('chat',['n08','d01','d02'],0.2,0.6),('phone',['n09'],0.2,0.5),
('ch2',[],2.6,0),('nagpur',['n10'],0.3,0.3),('engineer',['n11'],0.2,0.3),('profiles',['n12'],0.2,0.5),('arrest',['n13'],0.2,0.4),('files',['n14'],0.2,0.5),
('verdict',['n15'],0.2,0.5),('rewind',['n16'],0.2,0.5),('hc',['n17','n18'],0.2,0.6),('lesson',['n19'],0.2,0.7),
('ch3',[],2.6,0),('pune',['n20'],0.3,0.3),('zchat',['n21','n22'],0.2,0.5),('quote',['n23'],0.2,0.6),('list',['n24'],0.2,0.5),('court2',['n25','n26'],0.2,0.6),('wanted',['n27'],0.2,0.7),
('ch4',[],2.6,0),('pattern',['n28'],0.3,0.5),('compare',['n29','n30'],0.2,0.6),('caveat',['n31'],0.2,0.7),
('ch5',[],2.6,0),('tips',['n32','n33','n34','n35'],0.3,0.8),('next',['n36','n37'],0.2,0.6),('question',['n38'],0.2,0.5),('end',['n39'],0.2,3.0),
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
if '-v' in sys.argv:
    for s in scenes: print(s['id'],s['start'],s['dur'])
