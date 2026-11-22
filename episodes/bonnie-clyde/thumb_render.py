import os,base64
from playwright.sync_api import sync_playwright
here=os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--allow-file-access-from-files']); pg=b.new_page(viewport={'width':1920,'height':1080})
    pg.goto('file://'+here+'/thumb.html'); pg.wait_for_timeout(500); pg.evaluate("Promise.all(['700 50px Oswald','700 50px Kalam','800 50px Baloo2'].map(f=>document.fonts.load(f)))"); pg.wait_for_timeout(300)
    open('thumb_full.jpg','wb').write(base64.b64decode(pg.evaluate('drawThumb()'))); b.close()
