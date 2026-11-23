# renders cover.jpg (1080x1920) from drawCover() in mindset.js
import os, base64
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    b = p.chromium.launch(args=['--allow-file-access-from-files']); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    pg.goto('file://' + here + '/index.html'); pg.wait_for_timeout(400); pg.wait_for_function("document.getElementById('logo').complete")
    pg.evaluate("Promise.all(['700 50px Oswald','900 50px Montserrat','600 50px CrimsonText','700 50px CrimsonText'].map(f=>document.fonts.load(f)))"); pg.wait_for_timeout(300)
    open(os.path.join(here, 'cover.jpg'), 'wb').write(base64.b64decode(pg.evaluate("grabCover()"))); b.close()
