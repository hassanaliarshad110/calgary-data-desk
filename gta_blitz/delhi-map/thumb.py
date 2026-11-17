import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='cp'); GT=s['start']+s['dur']*0.7
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.cp(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.55)';ctx.fillRect(0,0,W,250);ctx.fillRect(0,1240,W,680);
txtStroke('AGAR GTA KA MAP',CX,170,104,C.white,C.ink,14);
txtStroke('DILLI',CX,1400,190,C.amber,C.ink,18);txtStroke('HOTA?',CX,1570,140,C.amber,C.ink,16);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
