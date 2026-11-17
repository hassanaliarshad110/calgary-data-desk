import json,sys
info=json.load(open('aud_info.json'))
PLAN=[('mission',['n02'],0.12,0.3),('player',['n03'],0.12,0.3),('twist',['n04'],0.3,0.3),('lock',['n05'],0.12,0.3),('alone',['n06'],0.12,0.3),('lesson',['n07'],0.12,0.3)]
T=0; scenes=[]; lines={}
for sid,ls,pre,post in PLAN:
    st=T; t=st+pre; li=[]
    for i,l in enumerate(ls):
        if i: t+=0.32
        lines[l]=dict(start=round(t,3),dur=info[l]['dur'],spk=info[l]['spk'],roman=info[l]['roman']); li.append(l); t+=info[l]['dur']
    t+=post; scenes.append(dict(id=sid,start=round(st,3),dur=round(t-st,3),lines=li)); T=t
json.dump(dict(scenes=scenes,lines=lines,total=T),open('timeline.json','w'),ensure_ascii=False,indent=0)
print('total',round(T,1))
