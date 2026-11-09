import json, urllib.request
from playwright.sync_api import sync_playwright
B='https://calgaryinsight.ca/'
d=json.loads(urllib.request.urlopen(urllib.request.Request(B+'data/city_actual/w0.json',headers={'User-Agent':'x'}),timeout=90).read())
cr=d.get('crime') or {}
print('CHK w0 keys has crime',bool(cr),'by_comm',len(cr.get('by_comm') or []),'period',cr.get('period'),'geo comms',len((d.get('geo') or {}).get('communities') or {}),'communities',len(d.get('communities') or []),'with crime_per_1000',sum(1 for c in d.get('communities') or [] if isinstance(c.get('crime_per_1000'),(int,float))))
print('CHK built_at',d.get('built_at'))
print('CHK crime keys',list(cr.keys())[:30])
with sync_playwright() as p:
    for name,ctx in [('desktop',dict(viewport={'width':1300,'height':900})),('phone',p.devices['Pixel 7'])]:
        br=p.chromium.launch(); pg=br.new_context(**ctx).new_page()
        errs=[]; pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None); pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        pg.goto(B+'?view=livemap',wait_until='domcontentloaded',timeout=90000)
        pg.wait_for_timeout(45000)
        st=pg.evaluate("""()=>{try{return {on:LM.on,groups:Object.keys(LM.groups),err:LM.err,city:!!LM.city,traffic:(LM.traffic||[]).length,paths:document.querySelectorAll('#lm-map .leaflet-overlay-pane path').length,markers:document.querySelectorAll('#lm-map .leaflet-marker-pane > *').length,stamp:(document.querySelector('#lm-stamp')||{}).textContent,legend:(document.querySelector('#lm-legend')||{}).textContent,view:document.querySelector('.view.is-on')&&document.querySelector('.view.is-on').id}}catch(e){return 'ERR '+e}}""")
        print('CHK',name,json.dumps(st))
        for e in errs[:12]: print('CHK err',name,e[:300])
        pg.screenshot(path=f'{name}.png'); br.close()
