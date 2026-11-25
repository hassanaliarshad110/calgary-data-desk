import subprocess, json, numpy as np, wave
from lines import L
SR=44100; A=1.21; SRC="/home/claude/tts"; MAXGAP=0.26
W=json.load(open(f'{SRC}/words.json')); info={}
def rd(p):
    wv=wave.open(p); n=wv.getnframes(); a=np.frombuffer(wv.readframes(n),dtype=np.int16).astype(float)/32768; wv.close(); return a
def wr(p,a):
    wv=wave.open(p,'wb'); wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes()); wv.close()
for i,s,t,c in L:
    w=W[i]; st=max(0,w[0][0]-0.04); en=w[-1][0]+w[-1][1]+0.16
    out=f'aud/{i}.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{SRC}/{i}.mp3','-af',f'atrim={st}:{en},asetpts=N/SR/TB,atempo={A},afade=t=out:st={(en-st)/A-0.08}:d=0.08','-ar',str(SR),'-ac','1',out],check=True)
    a=rd(out); toks=t.split()
    words=[[(x[0]-st)/A,x[1]/A,toks[k]] for k,x in enumerate(w)]
    # compress long internal pauses (between words) to MAXGAP, keep pacing weighty
    cuts=[]  # (time, removed)
    for k in range(len(words)-1):
        g0=words[k][0]+words[k][1]; g1=words[k+1][0]
        # find true silence inside the gap by energy
        a0,a1=int(g0*SR),int(g1*SR)
        if a1-a0 < int(MAXGAP*SR): continue
        seg=np.abs(a[a0:a1]); fr=int(0.01*SR); e=np.array([seg[j:j+fr].mean() for j in range(0,len(seg)-fr,fr)]) if len(seg)>fr else np.array([])
        quiet=np.where(e<0.006)[0]
        if len(quiet)==0: continue
        q0=a0+quiet[0]*fr; q1=a0+quiet[-1]*fr+fr; ql=(q1-q0)/SR
        if ql>MAXGAP: cuts.append(((q0+q1)/2/SR, ql-MAXGAP))
    for tc,rm in sorted(cuts,reverse=True):
        c0=int((tc-rm/2)*SR); c1=int((tc+rm/2)*SR); a=np.concatenate([a[:c0],a[c1:]])
        for x in words:
            if x[0]>tc: x[0]-=rm
    wr(out,a)
    words=[[round(x[0],3),round(x[1],3),x[2]] for x in words]
    info[i]=dict(dur=round(len(a)/SR,3),kind=s,words=words,cap=c)
json.dump(info,open('aud_info.json','w'),indent=0)
print(round(sum(v['dur'] for v in info.values()),2)); [print(k,v['dur']) for k,v in info.items()]
