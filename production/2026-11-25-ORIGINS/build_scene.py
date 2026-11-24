import json, re, sys, os
sys.path.insert(0, '/home/claude/work')
import episode as E, posts as PO
DURS = '/home/claude/sp_out_final/durs.json'
d = json.load(open(DURS)) if os.path.exists(DURS) else None
def dur(key, i, text):
    if d and key in d and isinstance(d[key], list): return d[key][i]
    return round(len(text.split()) / 2.45 + .3 * len(re.findall(r'[.?!:] ', text)), 2)
cap = lambda t: re.sub(r'calgary insight dot c a', 'calgaryinsight.ca', t, flags=re.I)
lines = [dict(ch=l['ch'], text=l['text'], caption=cap(l['text']), dur=dur('v', i, l['text']), gap=l['gap'], v=l['v']) for i, l in enumerate(E.L)]
ends = [E.END_FILM] + [E.END_PART[n] for n in range(1, 5)]
endd = [dict(text=t, caption=cap(t), dur=dur('e', i, t)) for i, t in enumerate(ends)]
EP = dict(lines=lines, endFilm=endd[0], endPart={n: endd[n] for n in range(1, 5)}, chTitles=E.CH_TITLES,
          partLines={n: E.PART_LINES[n] for n in range(1, 5)}, partQ=E.PART_Q, thumbText=PO.THUMB_TEXT)
tpl = open('/home/claude/work/scene_tpl.js').read()
out = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/work/scene.js'
open(out, 'w').write(tpl.replace('__EP__', json.dumps(EP, ensure_ascii=False, separators=(',', ':'))))
print(out, os.path.getsize(out), 'measured' if d else 'ESTIMATED durations')
