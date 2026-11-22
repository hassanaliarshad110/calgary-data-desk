import json, sys
info=json.load(open('aud_info.json'))
MODE=sys.argv[1] if len(sys.argv)>1 else 'long'
if MODE=='long':
    PLAN=[('L01',['h1']),('L02',['n1','n2','n3']),('L03',['n4']),
      ('L04',['c1a']),('L05',['c1b']),('L06',['c1c']),('L07',['c1d']),('L08',['c1e']),('L09',['c1f']),('L10',['c1g','c1h']),('L11',['c1i']),('L12',['q1','q1b']),('L13',['c1k','q2']),('L14',['c1m']),('L15',['c1n','c1o','c1p','c1q']),('L16',['c1r']),
      ('L17',['c2a','c2b']),('L18',['q3','c2c']),('L19',['c2d','c2e','c2f']),('L20',['c2g','c2h','c2i']),
      ('L21',['c3a','c3b']),('L22',['c3c']),('L23',['c3d','c3e','c3f']),('L24',['q4']),('L25',['c3g','c3h','c3i']),('L26',['c3j']),('L27',['c3k','c3l','c3m']),('L28',['c3n']),
      ('L29',['c4a','c4b']),('L30',['c4c','c4d']),('L31',['c4e','c4f']),('L32',['c4g','c4h','c4i']),
      ('L33',['c5a','c5b','c5c','c5d','c5e']),('L34',['c5f']),('L35',['c5g'])]
    CHAP={'L04':(1,'The Duke Who Hoped'),'L17':(2,'A Ladder Built by Enemies'),'L21':(3,'The Sword in the Sand'),'L29':(4,'Mind vs Heart'),'L33':(5,'One Move for Today')}
    GAP_DEF=0.42; END=5.0
else:
    PLAN=[('S1',['s1']),('S2',['sA','sE']),('S3',['sQ']),('S4',['c3h']),('S5',['sB']),('S6',['sC']),('S7',['s2']),('S8',['s3']),('S9',['s4'])]
    CHAP={}; GAP_DEF=0.2; END=2.3
T=0.15; lines={}; scenes=[]
for sid,ids in PLAN:
    if sid in CHAP and scenes: T+=1.6   # breath + chapter card before narration
    for k,i in enumerate(ids):
        if lines and not (sid in CHAP and k==0): T+=(0.55 if info[i]['kind']=='Q' else GAP_DEF)
        lines[i]=dict(start=round(T,3),dur=info[i]['dur'],kind=info[i]['kind'],words=info[i]['words'],cap=info[i]['cap']); T+=info[i]['dur']
    first=lines[ids[0]]['start']; s0=0 if not scenes else round(first-(1.5 if sid in CHAP else 0.12),3)
    if scenes: scenes[-1]['dur']=round(s0-scenes[-1]['start'],3)
    scenes.append(dict(id=sid,start=s0,lines=ids,chap=CHAP.get(sid)))
TOTAL=round(T+END,3); scenes[-1]['dur']=round(TOTAL-scenes[-1]['start'],3)
open(f'timeline_{MODE}.js','w').write('const SCENES='+json.dumps(scenes)+';\nconst LINES='+json.dumps(lines,ensure_ascii=False)+';\nconst TOTAL='+str(TOTAL)+';\n')
json.dump(dict(scenes=scenes,lines={k:{kk:vv for kk,vv in v.items()} for k,v in lines.items()},total=TOTAL),open(f'timeline_{MODE}.json','w'),indent=0)
print(MODE,'total',TOTAL)
for s in scenes: print(s['id'],s['start'],s['dur'],s['lines'],s['chap'] or '')
