import base64, os
from playwright.sync_api import sync_playwright
here=os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--allow-file-access-from-files']); pg=b.new_page(viewport={'width':1920,'height':1080})
    msgs=[]; pg.on('pageerror',lambda e: msgs.append(str(e)))
    pg.goto('file://'+here+'/thumb.html'); pg.wait_for_function("document.getElementById('logo').complete")
    pg.evaluate("Promise.all(['700 50px Oswald','700 50px Kalam','800 50px Baloo2'].map(f=>document.fonts.load(f)))"); pg.wait_for_timeout(300)
    d=pg.evaluate("thumb();document.getElementById('c').toDataURL('image/jpeg',0.92).split(',')[1]")
    open('thumb.jpg','wb').write(base64.b64decode(d)); print(msgs); b.close()
