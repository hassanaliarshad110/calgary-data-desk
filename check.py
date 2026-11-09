import json, re
from playwright.sync_api import sync_playwright
B='https://calgaryinsight.ca/'
NEW=open('new-livemap.js',encoding='utf-8').read()
with sync_playwright() as p:
    br=p.chromium.launch(); c=br.new_context(**p.devices['Pixel 7'])
    c.add_init_script("localStorage.setItem('lm-on', JSON.stringify({crime:false,traffic:false}))")  # as on Hassan's phone
    c.route(re.compile(r'livemap\.js'), lambda r: r.fulfill(status=200, content_type='application/javascript', body=NEW))
    pg=c.new_page(); errs=[]
    pg.on("request", lambda r: print("CHK req", r.url[:120]) if "livemap" in r.url else None)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(B+'?view=livemap',wait_until='domcontentloaded',timeout=90000)
    for t in (4,10,25,45):
        pg.wait_for_timeout((t - (0 if t==4 else {10:4,25:10,45:25}[t]))*1000)
        st=pg.evaluate("""()=>({on:LM.on,city:!!LM.city,news:lmNews().length,newsPins:document.querySelectorAll('#lm-map .lm-news').length,traffic:document.querySelectorAll('#lm-map .lm-tr').length,paths:document.querySelectorAll('#lm-map .leaflet-overlay-pane path').length,labels:lmNews().slice(0,6).map(a=>a.location.label)})""")
        print('CHK t',t,json.dumps(st))
    print('CHK wards geo sample', pg.evaluate("()=>{const w=(LM.city.geo||{}).wards;return w?[Array.isArray(w),Object.keys(w).slice(0,3),JSON.stringify(Object.values(w)[0]).slice(0,120)]:null}"))
    for e in errs: print('CHK err',e[:300])
    br.close()
