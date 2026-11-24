import json, sys
sys.path.insert(0,'/home/claude/work')
src=open('/home/claude/work/scene.js').read(); i=src.index('const EP = ')+11; j=src.index(';\n{ const P2')
EP=json.loads(src[i:j])
def starts(part=0):
    if part: L=[EP['lines'][k] for k in EP['partLines'][str(part)]]+[dict(EP['endPart'][str(part)],gap=.7)]+[EP['lines'][EP['partQ'][str(part)]]]
    else: L=EP['lines']+[EP['endFilm']]
    t=.3; out=[]
    for l in L:
        out.append((t,l['dur'])); g=l.get('gap'); t+=l['dur']+(g if g is not None else .85)
    return out
if __name__=='__main__':
    part=int(sys.argv[1]); fr=float(sys.argv[2]) if len(sys.argv)>2 else .6
    idx=[int(x) for x in sys.argv[3].split(',')] if len(sys.argv)>3 else None
    s=starts(part); sel=idx if idx is not None else range(len(s))
    print(','.join(f"{s[k][0]+s[k][1]*fr:.2f}" for k in sel))
