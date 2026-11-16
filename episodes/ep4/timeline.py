import json,sys
info=json.load(open('aud_info.json'))
PLAN=[
('blr',['n01'],0.3,0.4),('midnight',['n02'],0.2,0.3),('preorder',['n03'],0.2,0.3),('who',['n04','n05'],0.2,0.4),('promise',['n06'],0.2,0.5),
('title',[],3.6,0),
('ch1',[],2.6,0),('y1997',['n07','n08'],0.3,0.5),('y2016',['n09','n10'],0.2,0.5),('deal',['n11','n12'],0.2,0.5),('tease1',['n13'],0.2,0.6),
('ch2',[],2.6,0),('reports',['n14'],0.3,0.4),('quarter',['n15','n16'],0.2,0.6),('vicebeach',['n17'],0.2,0.4),('check',['n18','n19'],0.2,0.7),
('ch3',[],2.6,0),('hiring',['n20','n21'],0.3,0.4),('tester',['d01','n22'],0.2,0.4),('review',['n23','n24'],0.2,0.5),('syllabus',['n25'],0.2,0.5),('sides',['n26','n27'],0.2,0.7),
('ch4',[],2.6,0),('done',['n28'],0.3,0.4),('bookings',['n29','n30'],0.2,0.6),('price',['n31'],0.2,0.4),('twist',['n32','d02'],0.6,0.5),('ticket',['n33'],0.2,0.5),('mobile',['n34','n35'],0.2,0.6),('jeb',['n36'],0.2,0.7),
('question',['n37'],0.3,0.6),('next',['n38'],0.2,0.6),('end',['n39'],0.2,3.0),
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
