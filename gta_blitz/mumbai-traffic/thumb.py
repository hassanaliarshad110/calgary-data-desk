import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='mia10'); GT=s['start']+s['dur']*0.97
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.mia10(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.6)';ctx.fillRect(0,0,W,250);ctx.fillRect(0,1240,W,680);
txtStroke('VICE CITY vs MUMBAI',CX+40,170,78,C.white,C.ink,12);
txtStroke('10 KM = 28+ MIN',CX,1400,120,'#F4D06F',C.ink,18);txtStroke('MUMBAI KA TRAFFIC!',CX,1560,96,C.white,C.ink,12);
txt('MIAMI: SIRF 17 MIN · TOMTOM 2025',CX,1715,40,'#2BFF88','Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
