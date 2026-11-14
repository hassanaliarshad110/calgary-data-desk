import numpy as np, json, wave
from scipy.signal import lfilter
SR=44100; tl=json.load(open('timeline.json')); TOT=tl['total']+0.5; N=int(TOT*SR)
L=np.zeros(N); R=np.zeros(N)
BPM=86; beat=60/BPM; bar=beat*4
def hz(m): return 440*2**((m-69)/12)
def lp(x,a): return lfilter([1-a],[1,-a],x)
CH={'Dm':(38,[50,53,57,62]),'Bb':(34,[46,50,53,58]),'A':(33,[45,49,52,57]),'F':(41,[53,57,60,65]),'C':(36,[48,52,55,60]),'Gm':(31,[43,50,55,58])}
SEC={'tense':(['Dm','Dm','Bb','A'],dict(pad=.5,bass=.55,hat=.25,kick=0,pno=0)),
 'warm':(['F','C','Dm','Bb'],dict(pad=.45,bass=.3,hat=0,kick=0,pno=.5)),
 'bright':(['F','C','Dm','Bb'],dict(pad=.4,bass=.5,hat=.3,kick=.45,pno=.45)),
 'dark':(['Dm','Gm','Dm','A'],dict(pad=.55,bass=.6,hat=.15,kick=.3,pno=0)),
 'spy':(['Dm','Bb','Gm','A'],dict(pad=.45,bass=.6,hat=.35,kick=.35,pno=.3)),
 'sad':(['Dm','Bb','F','C'],dict(pad=.55,bass=.2,hat=0,kick=0,pno=.5)),
 'resolve':(['Bb','C','Dm','Dm'],dict(pad=.55,bass=.35,hat=0,kick=0,pno=.45))}
start={s['id']:s['start'] for s in tl['scenes']}
bounds=[(0,'tense'),(start['title'],'spy'),(start['ch1'],'warm'),(start['ch2'],'dark'),(start['rewind'],'tense'),(start['lesson'],'resolve'),(start['ch3'],'spy'),(start['ch4'],'tense'),(start['ch5'],'bright'),(start['question'],'resolve')]
def sec_at(t):
    s='tense'
    for b,n in bounds:
        if t>=b: s=n
    return s
rng=np.random.default_rng(3)
def add(sig,t0,gain=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(sig),N-i)
    if n<=0: return
    L[i:i+n]+=sig[:n]*gain*(1-pan)*0.5*2**0.5; R[i:i+n]+=sig[:n]*gain*(1+pan)*0.5*2**0.5
def env(n,a,r):
    e=np.ones(n); ai=int(a*SR); ri=int(r*SR)
    e[:ai]=np.linspace(0,1,ai); e[n-ri:]=np.linspace(1,0,ri); return e
nb=int(TOT/bar)+1
for b in range(nb):
    t0=b*bar; sname=sec_at(t0+0.01)
    if t0>TOT-1: break
    chords,lay=SEC[sname]; ch=chords[b%4]; root,notes=CH[ch]
    # pad
    n=int(bar*1.25*SR); tt=np.arange(n)/SR; pad=np.zeros(n)
    for m in notes:
        for det in (-0.12,0.12):
            f=hz(m+det/1)
            pad+=np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt)+0.12*np.sin(2*np.pi*3*f*tt)
    pad=lp(pad,0.94)*env(n,0.6,0.7)*0.03*lay['pad']*(1+0.15*np.sin(2*np.pi*0.25*tt))
    add(pad,t0,1,-0.15); add(pad,t0+0.012,1,0.15)
    # bass pulse 8ths
    if lay['bass']:
        for k in range(8):
            n=int(beat/2*SR*0.95); tt=np.arange(n)/SR; f=hz(root+12)
            s=(np.sin(2*np.pi*f*tt)+0.25*np.sin(2*np.pi*2*f*tt))*np.exp(-tt*7)*(0.9 if k%2==0 else 0.6)
            add(lp(s,0.6)*0.11*lay['bass'],t0+k*beat/2)
    if lay['hat']:
        for k in range(8):
            if k%2==1 or rng.random()<0.3:
                n=int(0.05*SR); s=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*90); s=s-lp(s,0.5)
                add(s*0.03*lay['hat'],t0+k*beat/2,1,0.35)
    if lay['kick']:
        for k in (0,2):
            n=int(0.35*SR); tt=np.arange(n)/SR; f=55+70*np.exp(-tt*30)
            s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)
            add(s*0.22*lay['kick'],t0+k*beat)
    if lay['pno']:
        arp=[notes[1]+12,notes[2]+12,notes[3]+12,notes[2]+12] if b%2==0 else [notes[3]+12,notes[2]+12,notes[1]+12,notes[2]+12]
        for k,m in enumerate(arp):
            n=int(1.6*SR); tt=np.arange(n)/SR; f=hz(m)
            s=(np.sin(2*np.pi*f*tt)+0.35*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*3)+0.1*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*6))*np.exp(-tt*2.6)
            s[:200]*=np.linspace(0,1,200)
            add(s*0.05*lay['pno'],t0+k*beat,1,0.2*(k%2*2-1))
# ending fade
fo=int(4*SR); L[N-fo:]*=np.linspace(1,0,fo); R[N-fo:]*=np.linspace(1,0,fo)
# gentle stereo reverb-ish (multi-tap)
for d,g in ((0.031,0.25),(0.053,0.2),(0.089,0.15),(0.137,0.1)):
    k=int(d*SR); L[k:]+=R[:-k]*g; R[k:]+=L[:-k]*g*0.9
st=np.stack([L,R],1); st/=np.max(np.abs(st))*1.05
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('ok',TOT)
