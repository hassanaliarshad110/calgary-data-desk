import numpy as np, json, wave
from scipy.signal import lfilter
SR=44100; tl=json.load(open('timeline.json')); TOT=tl['total']+0.5; N=int(TOT*SR)
def rd(p):
    w=wave.open(p); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768; ch=w.getnchannels(); w.close()
    return a.reshape(-1,ch) if ch>1 else a
V=np.zeros(N)
for k,l in tl['lines'].items():
    a=rd(f'aud/{k}.wav'); i=int(l['start']*SR); V[i:i+len(a)]+=a[:N-i]
M=rd('music.wav')[:N]
if len(M)<N: M=np.vstack([M,np.zeros((N-len(M),2))])
# duck
e=lfilter([1-0.9995],[1,-0.9995],np.abs(V))*30; e=np.clip(e,0,1)
e=np.maximum.accumulate(e[::-1])[::-1]*0+e
g=0.20*(1-0.55*e)
M=M*g[:,None]
S=np.zeros((N,2)); rng=np.random.default_rng(5)
def put(sig,t,gain=1.0):
    i=int(t*SR); n=min(len(sig),N-i)
    if n>0: S[i:i+n]+= (sig[:n,None] if sig.ndim==1 else sig[:n])*gain
def lp(x,a): return lfilter([1-a],[1,-a],x)
def whoosh(d=0.9):
    n=int(d*SR); x=rng.standard_normal(n); tt=np.arange(n)/n; x=0.5*lp(x,0.8)+0.5*lp(x,0.95); return x*np.sin(np.pi*tt)**2*0.5
def thud():
    n=int(0.45*SR); tt=np.arange(n)/SR; f=60+80*np.exp(-tt*25); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*8); s+=lp(rng.standard_normal(n),0.7)*np.exp(-tt*30)*0.6; return s*0.9
def boom():
    n=int(2.2*SR); tt=np.arange(n)/SR; f=42+60*np.exp(-tt*6); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*1.6); s+=lp(rng.standard_normal(n),0.9)*np.exp(-tt*3)*0.5; return s
def click():
    n=int(0.12*SR); x=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*60); x[int(0.05*SR):]+=rng.standard_normal(n-int(0.05*SR))*np.exp(-np.arange(n-int(0.05*SR))/SR*80); return x*0.5
def ding(f=1320,d=1.2):
    n=int(d*SR); tt=np.arange(n)/SR; return (np.sin(2*np.pi*f*tt)+0.4*np.sin(2*np.pi*2.76*f*tt)*np.exp(-tt*4))*np.exp(-tt*3.5)*0.35
def ring():
    n=int(1.0*SR); tt=np.arange(n)/SR; s=(np.sin(2*np.pi*440*tt)+np.sin(2*np.pi*480*tt))*(np.sin(2*np.pi*20*tt)>0); s*=env_(n); return s*0.18
def env_(n): e=np.ones(n); e[:400]=np.linspace(0,1,400); e[-2000:]=np.linspace(1,0,2000); return e
def pop():
    n=int(0.08*SR); tt=np.arange(n)/SR; return np.sin(2*np.pi*(600+900*np.exp(-tt*60))*tt)*np.exp(-tt*50)*0.4
def type_(d):
    n=int(d*SR); s=np.zeros(n)
    for k in range(int(d*11)):
        i=int((k/11+rng.random()*0.03)*SR); m=min(800,n-i)
        if m>0: s[i:i+m]+=rng.standard_normal(m)*np.exp(-np.arange(m)/SR*300)*0.35
    return s
st={s['id']:s['start'] for s in tl['scenes']}; Ls={k:v['start'] for k,v in tl['lines'].items()}
for c in ['ch1','ch2','ch3','ch4','ch5']: put(whoosh(),st[c]-0.2,0.5); put(ding(587,2.5),st[c]+0.5,0.6)
put(thud(),st['stock']+3.0,0.6); put(type_(2.4),st['memo']+0.4,0.4)
put(thud(),st['mss']+3.2,0.6); put(boom(),st['title'],0.9)
put(thud(),Ls['n06']+1.4,0.7)
put(pop(),Ls['d01'],0.5); put(pop(),Ls['d02'],0.5); put(ding(1760,0.6),Ls['d02']+0.8,0.4)
for i in range(3): put(thud(),st['profiles']+2.4+i*0.35,0.45)
for i in range(6): put(ring(),st['arrest']+0.2+i*0.0,0.0)
put(whoosh(1.2),st['arrest']+0.2,0.6)
for i in range(19): put(pop(),st['files']+0.6+i*0.16+0.5,0.25)
put(thud(),st['verdict']+1.25,0.9); put(whoosh(0.8),st['verdict']+2.6,0.5)
put(whoosh(1.4),st['rewind'],0.7)
put(thud(),Ls['n18']+2.4,0.6); put(ding(1318),Ls['n18']+4.0,0.5)
put(ding(988),st['lesson']+0.1,0.5)
put(ding(1568,0.5),Ls['n22']+0.6,0.5); put(thud(),Ls['n22']+0.8,0.6)
put(type_(1.2),st['quote']+1.0,0.4); put(thud(),st['quote']+2.6,0.5)
for i in range(4): put(pop(),st['list']+0.4+i*0.6,0.4)
put(thud(),Ls['n26']+2.3,0.5)
for i in range(4): put(pop(),st['pattern']+0.3+i*0.45,0.35)
for k in ('n33','n34','n35'): put(pop(),Ls[k],0.5)
put(thud(),Ls['n37']+1.4,0.6)
put(pop(),st['end']+0.3,0.6); put(ding(1318),st['end']+1.75,0.5); put(ding(1760,1.5),st['end']+2.0,0.4)
mix=M+V[:,None]+S*0.5
mix/=np.max(np.abs(mix))*1.02
w=wave.open('mix_raw.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes()); w.close()
print('ok')
