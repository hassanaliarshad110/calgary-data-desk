import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='sec184'); GT=s['start']+s['dur']*0.97
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.sec184(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.6)';ctx.fillRect(0,0,W,260);ctx.fillRect(0,1240,W,680);
txtStroke('GTA RED LIGHT vs INDIA',CX,165,84,C.white,C.ink,12);
txtStroke('JAIL YA JURMANA?',CX,1410,124,'#F4D06F',C.ink,18);txtStroke('₹1,000 – ₹5,000',CX,1570,104,C.white,C.ink,12);
txt('MV ACT DHAARA 184 · GTA 6 × BHARAT',CX,1720,40,'#2BFF88','Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
