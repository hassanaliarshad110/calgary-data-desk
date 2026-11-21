import subprocess, json, numpy as np, wave
from lines import L
SR=44100; A=1.12; SRC='/tmp/claude-0/t3'
W=json.load(open(f'{SRC}/words.json')); info={}
for i,s,t,c in L:
    w=W[i]; st=max(0,w[0][0]-0.04); en=w[-1][0]+w[-1][1]+0.16
    out=f'aud/{i}.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{SRC}/{i}.mp3','-af',f'atrim={st}:{en},asetpts=N/SR/TB,atempo={A},afade=t=out:st={(en-st)/A-0.08}:d=0.08','-ar',str(SR),'-ac','1',out],check=True)
    wv=wave.open(out); n=wv.getnframes(); a=np.frombuffer(wv.readframes(n),dtype=np.int16).astype(float)/32768; wv.close()
    toks=t.split(); ctoks=c.replace('"','').split()
    words=[[round((x[0]-st)/A,3),round(x[1]/A,3),toks[k]] for k,x in enumerate(w)]
    info[i]=dict(dur=round(n/SR,3),kind=s,words=words,cap=c)
json.dump(info,open('aud_info.json','w'),indent=0)
print(round(sum(v['dur'] for v in info.values()),2)); [print(k,v['dur']) for k,v in info.items()]
