import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='twins'); GT=s['start']+s['dur']*0.85
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.twins(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.55)';ctx.fillRect(0,0,W,250);ctx.fillRect(0,1240,W,680);
txtStroke('VICE CITY KA',CX,170,110,C.white,C.ink,14);
txtStroke('JUDWAAN',CX,1400,180,C.amber,C.ink,18);txtStroke('MUMBAI?',CX,1580,150,C.white,C.ink,16);txt('FAN THEORY · MARINE DRIVE vs MIAMI ART DECO',CX,1730,38,'#2BFF88','Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
