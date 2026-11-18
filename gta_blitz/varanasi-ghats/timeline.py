import json,sys
info=json.load(open('aud_info.json'))
PLAN=[('intro',['n02'],0.12,0.2),('twist',['n03'],0.2,0.2),('route',['n04'],0.1,0.2),('real',['n05'],0.12,0.25),('rule',['n06'],0.1,0.2)]
T=0; scenes=[]; lines={}
for sid,ls,pre,post in PLAN:
    st=T; t=st+pre; li=[]
    for i,l in enumerate(ls):
        if i: t+=0.32
        lines[l]=dict(start=round(t,3),dur=info[l]['dur'],spk=info[l]['spk'],roman=info[l]['roman']); li.append(l); t+=info[l]['dur']
    t+=post; scenes.append(dict(id=sid,start=round(st,3),dur=round(t-st,3),lines=li)); T=t
json.dump(dict(scenes=scenes,lines=lines,total=T),open('timeline.json','w'),ensure_ascii=False,indent=0)
print('total',round(T,1))
