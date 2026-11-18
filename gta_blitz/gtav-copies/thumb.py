import json, base64, sys
sys.path.insert(0,'/home/claude/kit'); import shorts as S
from playwright.sync_api import sync_playwright
js="""()=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);GT=0.5;ctx.save();DRAWV.hook1(3.2,3.45);ctx.restore();
ctx.fillStyle='rgba(8,11,18,0.6)';ctx.fillRect(0,0,W,260);ctx.fillRect(0,1240,W,680);
txtStroke('~23.5 CRORE COPIES...',CX,165,80,C.white,C.ink,12);
txtStroke('GTA V KI COPIES =',CX+40,1390,100,C.white,C.ink,14);txtStroke('EK POORA DESH!',CX+40,1530,118,'#F4D06F',C.ink,18);
txt('BRAZIL SE BHI BADA? · GTA 6 × BHARAT',CX,1690,40,'#2BFF88','Oswald',700);
watermarkV(); return document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1];}"""
with sync_playwright() as p:
    b,pg,msgs=S.page(p,'portrait.html',1080,1920); open('shorts/thumb1.jpg','wb').write(base64.b64decode(pg.evaluate(js))); print(msgs[:5]); b.close()
