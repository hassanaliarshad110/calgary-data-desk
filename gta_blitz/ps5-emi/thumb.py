import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='emi12'); GT=s['start']+s['dur']-0.2
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.emi12(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.55)';ctx.fillRect(0,0,W,330);ctx.fillRect(0,1240,W,680);
txtStroke('GTA 6',CX,170,170,C.white,C.ink,16);
txtStroke('+ PS5 = EMI',CX,1360,140,C.amber,C.ink,16);txtStroke('KITNE MAHINE?',CX,1520,130,C.amber,C.ink,16);
withT(CX,1690,1,-0.03,()=>{{P(rr(-300,-55,600,110,55),C.red,C.ink,5);txt('₹70,989 KA BILL',0,4,56,C.white);}});
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
