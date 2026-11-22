import sys, os, base64, subprocess
from playwright.sync_api import sync_playwright
here=os.path.dirname(os.path.abspath(__file__))
mode=sys.argv[1]; act=sys.argv[2]
VP={'long':(1920,1080),'short':(1080,1920)}[mode]
def page(p):
    b=p.chromium.launch(args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':VP[0],'height':VP[1]})
    msgs=[]; pg.on('console',lambda m: msgs.append(m.text)); pg.on('pageerror',lambda e: msgs.append('ERR '+str(e)))
    pg.goto(f'file://{here}/index_{mode}.html'); pg.wait_for_timeout(400); pg.wait_for_function("document.getElementById('logo').complete")
    pg.evaluate("Promise.all(['700 50px Oswald','900 50px Montserrat','600 50px CrimsonText','700 50px CrimsonText','italic 600 50px CrimsonText'].map(f=>document.fonts.load(f)))"); pg.wait_for_timeout(300)
    return b,pg,msgs
with sync_playwright() as p:
    b,pg,msgs=page(p)
    if act=='preview':
        os.makedirs('prev',exist_ok=True)
        for T in sys.argv[3:]:
            d=pg.evaluate(f"grab({T})"); open(f'prev/{mode[0]}_{float(T):07.2f}.jpg','wb').write(base64.b64decode(d))
    elif act=='still':
        d=pg.evaluate(sys.argv[3]); open(sys.argv[4],'wb').write(base64.b64decode(d))
    else:
        a,bb,out=float(sys.argv[3]),float(sys.argv[4]),sys.argv[5]
        tmp=out.replace('.mp4','.part.mp4')
        ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-crf','19','-preset','veryfast','-pix_fmt','yuv420p','-r','30',tmp],stdin=subprocess.PIPE)
        for i in range(round(a*30),round(bb*30)):
            ff.stdin.write(base64.b64decode(pg.evaluate(f"grab({i/30})")))
        ff.stdin.close(); ff.wait()
        if ff.returncode==0: os.rename(tmp,out)
    print('\n'.join(msgs[:20]))
    b.close()
