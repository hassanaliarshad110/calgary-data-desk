import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); req=[a.split(':') for a in sys.argv[1:]]
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); outs=[]
    for sid,fr in req:
        s=next((x for x in TL['scenes'] if x['id']==sid),None); d=s['dur'] if s else float(fr.split('/')[1]); t=float(fr.split('/')[0]) if s is None else d*float(fr); st=s['start'] if s else 0
        js=f"()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={st+t};ctx.save();DRAWV.{sid}({t},{d});ctx.restore();return document.getElementById('c').toDataURL('image/jpeg',0.8).split(',')[1];}}"
        fn=f'shorts/peek_{sid}_{fr.replace("/","-")}.jpg'; open(fn,'wb').write(base64.b64decode(pg.evaluate(js))); outs.append(fn)
    print(msgs[:5]); b.close()
import subprocess
subprocess.run(['ffmpeg','-loglevel','error','-y']+sum([['-i',f] for f in outs],[])+['-filter_complex',''.join(f'[{i}]' for i in range(len(outs)))+f'hstack={len(outs)},scale=1800:-1','peek.jpg'])
