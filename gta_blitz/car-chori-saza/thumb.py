import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
TL=json.load(open('timeline.json')); s=next(x for x in TL['scenes'] if x['id']=='highway'); GT=s['start']+s['dur']*0.95
js=f"""()=>{{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT={GT};ctx.save();DRAWV.highway(GT-{s['start']},{s['dur']});ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.6)';ctx.fillRect(0,0,W,260);ctx.fillRect(0,1240,W,680);
txtStroke('GTA JAISI GAADI CHHEENI?',CX,165,84,C.white,C.ink,12);
txtStroke('14 SAAL',CX,1410,200,'#E63946',C.ink,18);txtStroke('TAK QAID!',CX,1590,130,'#F4D06F',C.ink,14);
txt('RAAT MEIN HIGHWAY PAR LOOT · BNS 309',CX,1730,50,C.white,'Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
