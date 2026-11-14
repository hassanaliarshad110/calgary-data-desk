import json
info=json.load(open('aud_info.json'))
ids=['s01','s02','s03','s04','s05','s06','s07','s08']
T=0.15; scenes=[]; lines={}
for k,i in enumerate(ids):
    st=T if k else 0; pre=0.15 if k==0 else 0.05
    ls=T+ (0 if k else 0)
    lines[i]=dict(start=round(T+ (0.0),3),dur=info[i]['dur'],spk='N',roman=info[i]['roman'])
    end=T+info[i]['dur']+(0.25 if k<7 else 1.4)
    scenes.append(dict(id=i,start=round(st,3),dur=round(end-st,3),lines=[i])); T=end
amp={k:info[k]['amp'] for k in lines}
open('timeline.js','w').write('const SCENES='+json.dumps(scenes)+';\nconst LINES='+json.dumps(lines,ensure_ascii=False)+';\nconst AMP='+json.dumps(amp)+';\nconst TOTAL='+str(round(T,3))+';\n')
json.dump(dict(scenes=scenes,lines=lines,total=T),open('timeline.json','w'),ensure_ascii=False,indent=0)
print('total',round(T,2)); [print(s['id'],s['start'],s['dur']) for s in scenes]
