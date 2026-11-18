import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='route'); GT=s['start']+s['dur']*0.85
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.route(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.55)';ctx.fillRect(0,0,W,250);ctx.fillRect(0,1240,W,680);
txtStroke('AGAR VARANASI MEIN',CX,170,92,C.white,C.ink,14);
txtStroke('GTA',CX,1400,180,C.amber,C.ink,18);txtStroke('MISSION?',CX,1580,160,C.white,C.ink,16);txt('FAN THEORY · 84 GHAAT · NAAV RACE',CX,1730,44,'#2BFF88','Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
