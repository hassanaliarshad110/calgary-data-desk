import json, sys, wave, numpy as np
VD=json.load(open('/home/claude/sp_out/durs.json'))['v']
IDX={'Q':16,'C':17,'T1':18,'T2':19,'T0':0}
O={'wide':['L%d'%i for i in range(16)]+['Q','C'],'short':['L0','L1','L2','L3','L4','L5','L10','L11','L12','L13','L14','Q','C'],'teaser':['T0','T1','T2']}
cut=sys.argv[1]; order=O[cut]
gap=.35 if cut=='teaser' else .4; tail=1.4 if cut=='teaser' else 1.3
t=.3; starts=[]
for i,id in enumerate(order):
    k=IDX.get(id, int(id[1:]) if id[0]=='L' else 0)
    if id=='Q': g=.25
    elif cut=='teaser': g={'T0':.8,'T1':.7}.get(id, tail if i==len(order)-1 else gap)
    else: g=.8 if i+1<len(order) and order[i+1] in ('L6','L10') else (tail if i==len(order)-1 else gap)
    starts.append((id,k,t)); t+=VD[k]+g
total=t
def rd(p):
    w=wave.open(p); sr=w.getframerate(); ch=w.getnchannels(); sw=w.getsampwidth(); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16 if sw==2 else np.int32).astype(np.float32)
    if ch>1: a=a.reshape(-1,ch).mean(1)
    return a/ (32768 if sw==2 else 2**31), sr
_,sr=rd('/home/claude/sp_out/v_0.wav')
out=np.zeros(int((total+.5)*sr),np.float32)
for id,k,st in starts:
    a,_=rd('/home/claude/sp_out/v_%d.wav'%k); i=int(st*sr); out[i:i+len(a)]+=a[:len(out)-i]
out=out[:int(total*sr)]
w=wave.open('/home/claude/out/vo_%s.wav'%cut,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes()); w.close()
open('/home/claude/out/edl_%s.txt'%cut,'w').write('\n'.join('%s %.2f-%.2f'%(id,st,st+VD[k]) for id,k,st in starts)+'\ntotal %.3f\n'%total)
print(cut,'total',round(total,3),'sr',sr)
