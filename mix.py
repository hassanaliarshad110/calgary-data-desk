import numpy as np, wave
SR=44100; DUR=31.6; N=int(SR*DUR)
rng=np.random.default_rng(7)
def rd(f):
    w=wave.open(f); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768; return a
voice=np.zeros(N,np.float32); sfx=np.zeros(N,np.float32); mus=np.zeros(N,np.float32)
def put(buf,a,t,g=1.0):
    i=int(t*SR); a=a[:max(0,N-i)]; buf[i:i+len(a)]+=a*g
for k,t in [('l0',.5),('l1',6.0),('l2',7.8),('l3',11.6),('l4',16.5),('l5',21.0),('l6',22.85),('l7',24.4)]:
    a=rd(f'aud/{k}.wav'); a=a/ (np.abs(a).max()+1e-6)*.85; put(voice,a,t)
tt=lambda d: np.arange(int(d*SR))/SR
def env(d,a=.005,r=None):
    x=tt(d); r=r or d; return np.clip(x/a,0,1)*np.exp(-x/(r/4))
def lp(x,k):  # one-pole lowpass, k in (0,1)
    y=np.zeros_like(x); s=0.
    for i in range(len(x)): s+=k*(x[i]-s); y[i]=s
    return y
def whoosh(d=.45):
    n=rng.standard_normal(int(d*SR)).astype(np.float32); x=tt(d)
    e=np.sin(np.pi*x/d)**2; return lp(n,.08)*e*1.4
def thump(f=70,d=.5,g=1):
    x=tt(d); s=np.sin(2*np.pi*(f*x+ f*2*(1-np.exp(-x*20))/20 )); return s*np.exp(-x*8)*g
def pop(f=900,d=.12): x=tt(d); return np.sin(2*np.pi*f*x*(1+3*x))*np.exp(-x*35)
def ding(f=1320,d=.8): x=tt(d); return (np.sin(2*np.pi*f*x)+.5*np.sin(2*np.pi*f*2.01*x))*np.exp(-x*5)*.5
def sweep(f0,f1,d,g=.25):
    x=tt(d); f=f0*(f1/f0)**(x/d); ph=2*np.pi*np.cumsum(f)/SR; return (np.sin(ph)+.3*np.sin(2*ph))*g*np.clip(x/.1,0,1)
def flush(d=1.8):
    n=rng.standard_normal(int(d*SR)).astype(np.float32); x=tt(d)
    g=lp(n,.05)*(1+.6*np.sin(2*np.pi*7*x))*np.clip(x/.08,0,1)*np.exp(-x*1.3)*2.2
    gurg=np.sin(2*np.pi*(180+80*np.sin(2*np.pi*11*x))*x)*np.exp(-x*2)*.15
    return g+gurg
def sparkle(d=.7):
    out=np.zeros(int(d*SR),np.float32)
    for i in range(7):
        s=ding(1500+i*230,.35)*.5; j=int(i*.07*SR); out[j:j+len(s)]+=s[:len(out)-j]
    return out
# hook
put(sfx,whoosh(.35),.2,.5); put(sfx,whoosh(.35),2.85,.5); put(sfx,thump(60,.6),1.45,.5); put(sfx,sparkle(),3.15,.6)
# call / ammi
put(sfx,whoosh(.5),5.3,.8); put(sfx,thump(90,.25),5.9,.4); put(sfx,pop(),6.0,.5)
for i in range(5): put(sfx,pop(700+i*120,.1),8.95+i*.24,.45)
# door
put(sfx,whoosh(.45),11.0,.8); put(sfx,thump(55,.6),11.7,1.0); put(sfx,rng.standard_normal(int(.06*SR))*np.exp(-tt(.06)*60),11.7,.6)
put(sfx,flush(),13.0,.75); put(sfx,sweep(200,900,2.4,.18),13.2)
for i in range(4): put(sfx,thump(110,.12),14.7+i*.22,.35)
# reveal
put(sfx,thump(45,1.2,1.2),15.95); put(sfx,whoosh(.8),15.9,.9); put(sfx,sparkle(1.0),16.3,.7); put(sfx,thump(70,.5,.9),16.55)
# lift
put(sfx,whoosh(.5),18.95,.7); put(sfx,sweep(300,600,.4,.12),19.0); put(sfx,thump(40,.9,1.3),20.6); put(sfx,rng.standard_normal(int(.08*SR))*np.exp(-tt(.08)*40),20.6,.5)
put(sfx,whoosh(.4),21.8,.5); put(sfx,ding(1760,.6),23.5,.7)
# end
put(sfx,whoosh(.4),24.3,.5); put(sfx,pop(1000,.15),27.8,.5); put(sfx,pop(1400,.08),28.95,.7); put(sfx,ding(1320,.9),29.15,.6)
# music: playful 118 bpm loop, C major pentatonic
bpm=118; beat=60/bpm
mel=[0,4,7,9,7,4,2,4, 0,4,7,12,9,7,4,2]; base=261.63
def note(f,d,g=.2):
    x=tt(d); return (np.sin(2*np.pi*f*x)+.35*np.sin(2*np.pi*2*f*x)+.12*np.sin(2*np.pi*3*f*x))*np.exp(-x*7)*g
bass=[130.81,130.81,174.61,196.0]
t=0.; i=0
while t<DUR:
    put(mus,note(base*2**(mel[i%16]/12),beat*.9,.11),t)
    if i%2==0: put(mus,note(bass[(i//4)%4]/2,beat*1.8,.22),t); put(mus,thump(55,.25,.25),t)
    if i%2==1: put(mus,rng.standard_normal(int(.05*SR))*np.exp(-tt(.05)*80)*.08,t)
    t+=beat/2*2/2 if False else beat/2; i+=1
# music: quieter in hook start, silent during reveal boom, duck under voice
venv=np.convolve(np.abs(voice),np.ones(2205)/2205,'same'); duck=1-.6*np.clip(venv/.05,0,1)
duck=np.convolve(duck,np.ones(4410)/4410,'same')
x=np.arange(N)/SR; gate=np.where((x>15.9)&(x<16.9),.2,1.0)
fade=np.clip((DUR-x)/1.5,0,1)
mix=voice*1.0+sfx*.55+mus*.55*duck*gate
mix*=fade
mix=np.tanh(mix*1.2)/np.tanh(1.2)
mix/=np.abs(mix).max()/.95
w=wave.open('mix.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes()); w.close()
print('ok')
