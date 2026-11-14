import json, subprocess, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
segs=json.load(open('short_segs.json')); os.makedirs('shorts',exist_ok=True)
SRC='Awazzzz_Honey_Trap_Files_Ep1.mp4'
def F(path,size,var=None):
    f=ImageFont.truetype(path,size)
    if var:
        try: f.set_variation_by_name(var)
        except Exception: pass
    return f
OSW=lambda s:F('fonts/Oswald.ttf',s,'Bold'); KAL=lambda s:F('fonts/Kalam-Bold.ttf',s); BAL=lambda s:F('fonts/Baloo2.ttf',s,'ExtraBold')
AMBER=(244,208,111); ORANGE=(255,138,30); WHITE=(246,242,232); RED=(226,72,61)
HEAD={'1':('NVIDIA BOSS KE PEECHE JASOOS?','BHARAT MEIN BHI?'),'2':('EK FRIEND REQUEST...','MISSILE RAAZ KHATRE MEIN?'),'3':("'LONDON KI ENGINEER'",'YA OPERATIVE?'),'4':('HONEY TRAP SE','KAISE BACHEIN?')}
HOOK={'h1o':'Duniya ke sabse taaqatwar tech boss ke peeche Chini jasoos? Aur Bharat mein bhi yahi khel?','h1e':'Bharat ki Honey Trap Files — poori kahaani Awazzzz channel par.',
'h2o':'Ek friend request… aur Bharat ke missile raaz khatre mein?','h2e':'Lekin High Court mein kahaani palat gayi. Poori kahaani Awazzzz channel par.',
'h3o':"London ki software engineer… ya Pakistani operative? DRDO ki sabse badi chargesheet.",'h3e':"Aur 'Zara' aaj tak faraar hai. Poori kahaani Awazzzz channel par.",
'h4o':'Agla nishaana aap ho sakte hain. Honey trap se bachne ke 3 niyam.','h4e':'Asli case jaanne ke liye, poori kahaani dekhiye Awazzzz channel par.'}
logo=Image.open('logo.jpg').convert('RGB')
def circ_logo(r):
    l=logo.resize((2*r,2*r)); m=Image.new('L',(2*r,2*r),0); ImageDraw.Draw(m).ellipse((0,0,2*r-1,2*r-1),fill=255); o=Image.new('RGBA',(2*r,2*r)); o.paste(l,(0,0),m)
    ImageDraw.Draw(o).ellipse((0,0,2*r-1,2*r-1),outline=AMBER,width=max(3,r//14)); return o
def ctext(d,y,s,font,fill,stroke=0,sc=(11,15,23),W=1080):
    w=d.textlength(s,font=font); d.text(((W-w)/2,y),s,font=font,fill=fill,stroke_width=stroke,stroke_fill=sc)
def wrap(d,s,font,maxw):
    rows=['']
    for w in s.split():
        t=(rows[-1]+' '+w).strip()
        if d.textlength(t,font=font)>maxw and rows[-1]: rows.append(w)
        else: rows[-1]=t
    return rows
def background(k):
    im=Image.new('RGB',(1080,1920),(10,16,34)); px=Image.new('RGB',(1080,1920)); d=ImageDraw.Draw(px)
    for y in range(1920):
        c=int(10+8*(1-y/1920)); d.line([(0,y),(1080,y)],fill=(c,c+5,c+20))
    im=px; g=Image.new('RGB',(1080,1920),(0,0,0)); gd=ImageDraw.Draw(g); gd.ellipse((140,180,940,900),fill=(120,90,30)); g=g.filter(ImageFilter.GaussianBlur(160)); im=Image.blend(im,Image.composite(g,im,Image.new('L',(1080,1920),255)),0.45)
    im=im.convert('RGBA'); d=ImageDraw.Draw(im)
    # brand
    L=circ_logo(46); f=OSW(46); w1=d.textlength('Awazzzz ',font=f); w2=d.textlength('ORIGINALS',font=f); x0=(1080-(92+16+w1+w2))/2
    im.alpha_composite(L,(int(x0),70)); d.text((x0+108,80),'Awazzzz ',font=f,fill=WHITE); d.text((x0+108+w1,80),'ORIGINALS',font=f,fill=ORANGE)
    h1,h2=HEAD[k]
    def fit(t,sz):
        while d.textlength(t,font=OSW(sz))>1000: sz-=4
        return OSW(sz)
    ctext(d,230,h1,fit(h1,92),WHITE,8); ctext(d,350,h2,fit(h2,118),AMBER,9)
    d.rounded_rectangle((-10,592,1090,1216),radius=0,outline=AMBER,width=6)
    # bottom
    d.rounded_rectangle((390,1270,690,1340),radius=35,fill=RED); ctext(d,1276,f'PART {k}/4',OSW(46),WHITE)
    ctext(d,1385,'Poori kahaani — Awazzzz channel par',BAL(50),WHITE)
    d.rounded_rectangle((300,1475,780,1565),radius=45,fill=(230,33,23)); ctext(d,1482,'SUBSCRIBE',OSW(58),WHITE)
    return im
def still(t,out): subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(t),'-i',SRC,'-frames:v','1',out],check=True)
def card(bg,frame,text,end):
    im=bg.copy(); fr=Image.open(frame).convert('RGB').resize((1080,608)); fr=ImageEnhance.Brightness(fr.filter(ImageFilter.GaussianBlur(3))).enhance(0.35); im.paste(fr,(0,600))
    d=ImageDraw.Draw(im); f=KAL(70 if len(text)<70 else 62); rows=wrap(d,text,f,960); y=600+304-len(rows)*44
    for r in rows: ctext(d,y,r,f,AMBER if end else WHITE,4); y+=88
    if end:
        im.alpha_composite(circ_logo(70),(470,1060-70)) if False else None
    return im.convert('RGB')
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
for k,(a,b) in segs.items():
    if len(sys.argv)>1 and k not in sys.argv[1:]: continue
    o=f'shorts/s{k}'; os.makedirs(o,exist_ok=True)
    bg=background(k); bg.convert('RGB').save(f'{o}/bg.png')
    still(a+0.6,f'{o}/in.jpg'); still(b-0.4,f'{o}/out.jpg')
    for tag,fr,end in (('o',f'{o}/in.jpg',False),('e',f'{o}/out.jpg',True)):
        hid=f'h{k}{tag}'; card(bg,fr,HOOK[hid],end).save(f'{o}/{tag}.png')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'/home/claude/nvall/{hid}.mp3','-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse','-ar','44100','-ac','2',f'{o}/{tag}.wav'],check=True)
        vd=dur(f'{o}/{tag}.wav'); D=vd+0.9
        ms=a if tag=='o' else b
        subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-framerate','30','-i',f'{o}/{tag}.png','-i',f'{o}/{tag}.wav','-ss',str(ms),'-i','music.wav',
          '-filter_complex',f"[1:a]adelay=300|300,apad[v];[2:a]volume=0.12,afade=t=in:d=0.3,afade=t=out:st={D-0.5}:d=0.5[m];[v][m]amix=inputs=2:duration=longest:normalize=0[a];[0:v]scale=1080:1920,fps=30,format=yuv420p[vv]",
          '-map','[vv]','-map','[a]','-t',str(D),'-c:v','libx264','-crf','19','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-ar','44100',f'{o}/{tag}.mp4'],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(a),'-to',str(b),'-i',SRC,'-loop','1','-i',f'{o}/bg.png',
      '-filter_complex',"[0:v]scale=1080:608[v];[1:v][v]overlay=0:600:shortest=1,fps=30,format=yuv420p[vv]",'-map','[vv]','-map','0:a','-c:v','libx264','-crf','19','-preset','veryfast','-c:a','aac','-ar','44100',f'{o}/main.mp4'],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{o}/o.mp4','-i',f'{o}/main.mp4','-i',f'{o}/e.mp4','-filter_complex','[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a];[a]loudnorm=I=-14:TP=-1.5[aa]',
      '-map','[v]','-map','[aa]','-c:v','libx264','-crf','20','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','44100','-movflags','+faststart',f'shorts/Awazzzz_Short_{k}.mp4'],check=True)
    # cover
    cv=Image.open(f'{o}/o.png'); cv.save(f'shorts/cover_{k}.jpg',quality=92)
    print(k,round(dur(f'shorts/Awazzzz_Short_{k}.mp4'),1))
