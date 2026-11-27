import json
info=json.load(open('aud_info.json'))
GAP={'q1':0.12,'q2':0.12,'n5':0.1,'n7':0.12,'n11':0.1}
ORDER=['h1','n2','n3','q1','n4','q2','n5','n6','n7','n8','n9','n10','n11']
PLAN=[(f'sc{k+1}',[i]) for k,i in enumerate(ORDER)]
T=0.05; lines={}; scenes=[]
for sid,ids in PLAN:
    for i in ids:
        if lines: T+=GAP.get(i,0.05)
        lines[i]=dict(start=round(T,3),dur=info[i]['dur'],kind=info[i]['kind'],words=info[i]['words'],cap=info[i]['cap']); T+=info[i]['dur']
    if scenes: scenes[-1]['dur']=round(lines[ids[0]]['start']-0.06-scenes[-1]['start'],3)
    scenes.append(dict(id=sid,start=round(lines[ids[0]]['start']-0.06 if scenes else 0,3),lines=ids))
TOTAL=round(max(T+0.5, lines['n11']['start']+2.3),3); scenes[-1]['dur']=round(TOTAL-scenes[-1]['start'],3)
open('timeline.js','w').write('const SCENES='+json.dumps(scenes)+';\nconst LINES='+json.dumps(lines,ensure_ascii=False)+';\nconst TOTAL='+str(TOTAL)+';\n')
json.dump(dict(scenes=scenes,lines={k:{kk:vv for kk,vv in v.items() if kk!='words'} for k,v in lines.items()},total=TOTAL),open('timeline.json','w'),indent=0)
print('total',TOTAL); [print(s['id'],s['start'],s['dur'],s['lines']) for s in scenes]
