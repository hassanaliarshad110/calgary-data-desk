import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='final'); GT=s['start']+s['dur']-0.2
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.final(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.6)';ctx.fillRect(0,1240,W,680);
txtStroke('AGAR HASTINAPUR MEIN',CX,1370,92,C.amber,C.ink,16);txtStroke('GTA JAISA CHASE HOTA?',CX,1505,88,C.white,C.ink,16);
withT(CX,1680,1,-0.03,()=>{{P(rr(-300,-55,600,110,55),'#B23AEE',C.ink,5);txt('KALPANA / FAN THEORY',0,4,50,C.white);}});
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
