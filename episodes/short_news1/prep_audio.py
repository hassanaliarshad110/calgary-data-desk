import subprocess, json, numpy as np, wave, os
from lines import L
SR=44100
F='atempo=1.07,silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
info={}
for i,s,t,r in L:
    if i.startswith('h'): continue
    out=f'aud/{i}.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'/home/claude/short1/mp3/{i}.mp3','-af',F,'-ar',str(SR),'-ac','1',out],check=True)
    w=wave.open(out); n=w.getnframes(); a=np.frombuffer(w.readframes(n),dtype=np.int16).astype(float)/32768; w.close()
    hop=SR//30; env=[float(np.sqrt(np.mean(a[k:k+hop]**2))) for k in range(0,len(a),hop)]
    m=max(env) or 1; env=[round(min(1,e/m*1.4),2) for e in env]
    info[i]=dict(dur=round(n/SR,3),amp=env,spk=s,roman=r)
json.dump(info,open('aud_info.json','w'))
print(sum(v['dur'] for v in info.values()))
for k,v in info.items(): print(k,v['dur'],end='; ')
