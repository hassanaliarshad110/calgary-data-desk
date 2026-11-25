import json
info=json.load(open('aud_info.json'))
GAP={'n2':0.15,'q1':0.2,'n5':0.15,'q2':0.25,'n6':0.15,'n7':0.2,'n8':0.2,'n9':0.15,'n10':0.2,'n11':0.15,'n12':0.15}
PLAN=[('sc1',['h1']),('sc2',['n2']),('sc3',['n3']),('sc4',['n4']),('sc5',['q1']),('sc6',['n5']),('sc7',['q2']),('sc8',['n6']),('sc9',['n7']),('sc10',['n8']),('sc11',['n9']),('sc12',['n10']),('sc13',['n11']),('sc14',['n12'])]
T=0.1; lines={}; scenes=[]
for sid,ids in PLAN:
    for i in ids:
        if lines: T+=GAP.get(i,0.1)
        lines[i]=dict(start=round(T,3),dur=info[i]['dur'],kind=info[i]['kind'],words=info[i]['words'],cap=info[i]['cap']); T+=info[i]['dur']
    if scenes: scenes[-1]['dur']=round(lines[ids[0]]['start']-0.06-scenes[-1]['start'],3)
    scenes.append(dict(id=sid,start=round(lines[ids[0]]['start']-0.06 if scenes else 0,3),lines=ids))
TOTAL=round(T+1.0,3); scenes[-1]['dur']=round(TOTAL-scenes[-1]['start'],3)
open('timeline.js','w').write('const SCENES='+json.dumps(scenes)+';\nconst LINES='+json.dumps(lines,ensure_ascii=False)+';\nconst TOTAL='+str(TOTAL)+';\n')
json.dump(dict(scenes=scenes,lines={k:{kk:vv for kk,vv in v.items() if kk!='words'} for k,v in lines.items()},total=TOTAL),open('timeline.json','w'),indent=0)
print('total',TOTAL); [print(s['id'],s['start'],s['dur'],s['lines']) for s in scenes]
