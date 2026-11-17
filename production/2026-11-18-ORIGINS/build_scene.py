import json, re, sys, os
sys.path.insert(0, '/home/claude/work')
import episode as E

DURS = '/home/claude/sp_out_final/durs.json'
d = json.load(open(DURS)) if os.path.exists(DURS) else None
def dur(key, i, text):
    if d and f'{key}_{i}' in d: return d[f'{key}_{i}']
    if d and key in d and isinstance(d[key], list): return d[key][i]
    return round(len(text.split()) / 2.55 + .3 * text.count('. '), 2)   # estimate (dev only)
cap = lambda t: re.sub(r'calgary insight dot c a', 'calgaryinsight.ca', t, flags=re.I)

lines = [dict(ch=l['ch'], text=l['text'], caption=cap(l['text']), dur=dur('v', i, l['text']), gap=l['gap'], v=l['v']) for i, l in enumerate(E.L)]
ends = [E.END_FILM, E.END_PART[1], E.END_PART[2], E.END_PART[3]]
endd = [dict(text=t, caption=cap(t), dur=dur('e', i, t)) for i, t in enumerate(ends)]

reg = json.load(open('/home/claude/work/regional.json'))
keep = {'Alberta', 'British Columbia', 'Saskatchewan', 'Manitoba', 'Montana', 'Idaho', 'Washington', 'Oregon', 'Wyoming', 'North Dakota', 'Ontario'}
provs = [p for p in reg['provinces'] if p['name'] in keep]
def simp(poly, step):
    return poly[::step] + [poly[0]]
for p in provs: p['polys'] = [simp(q, 2) for q in p['polys'] if len(q) > 8]
# hand-drawn rivers (schematic, lon/lat; positions approximate, the map is labelled schematic)
rivers = [
 {'name': 'Bow', 'main': True, 'lines': [[[-115.57, 51.18], [-115.35, 51.09], [-115.05, 51.07], [-114.85, 51.13], [-114.6, 51.19], [-114.47, 51.18], [-114.27, 51.10], [-114.06, 51.05], [-113.95, 50.93], [-113.7, 50.8], [-113.0, 50.55], [-112.1, 50.1], [-111.68, 49.93]]]},
 {'name': 'Elbow', 'lines': [[[-114.95, 50.85], [-114.57, 50.95], [-114.2, 50.99], [-114.05, 51.045]]]},
 {'name': 'Highwood', 'lines': [[[-114.6, 50.45], [-114.2, 50.52], [-113.87, 50.58], [-113.6, 50.75], [-113.85, 50.93]]]},
 {'name': 'Oldman', 'main': True, 'lines': [[[-114.2, 49.6], [-113.8, 49.7], [-113.41, 49.72], [-112.86, 49.69], [-112.3, 49.8], [-111.68, 49.93]]]},
 {'name': 'Belly', 'lines': [[[-113.8, 49.05], [-113.45, 49.3], [-113.25, 49.45], [-113.0, 49.65], [-112.9, 49.8]]]},
 {'name': 'South Saskatchewan', 'main': True, 'lines': [[[-111.68, 49.93], [-111.0, 50.1], [-110.68, 50.04], [-110.0, 50.6]]]},
]
for r in reg['rivers']:
    if r['name'] in ('Missouri', 'Snake', 'Columbia', 'Fraser', 'North Saskatchewan', 'South Saskatchewan', 'Saskatchewan'):
        rivers.append({'name': r['name'], 'lines': [l[::2] + [l[-1]] for l in r['lines']]})
front = [(-114.0, 49.0), (-114.35, 49.6), (-114.55, 50.2), (-114.75, 50.8), (-115.0, 51.2), (-115.5, 51.7), (-116.3, 52.3), (-117.2, 52.9), (-118.3, 53.5), (-119.5, 54.2)]
rock = []
for i in range(len(front) - 1):
    (a0, b0), (a1, b1) = front[i], front[i + 1]
    for k in range(5):
        u = k / 5; lo, la = a0 + (a1 - a0) * u, b0 + (b1 - b0) * u
        for j in range(4): rock.append([round(lo - .18 - j * .28 + (k % 2) * .1, 3), round(la + .03 * j, 3)])
places = {  # lon, lat (approximate; map labelled schematic)
 'calgary': [-114.07, 51.045], 'cochrane': [-114.467, 51.189], 'morley': [-114.85, 51.16], 'macleod': [-113.41, 49.724], 'highriver': [-113.871, 50.58],
 'baru': [-114.24, 50.42], 'nanton': [-113.77, 50.349], 'oxley': [-113.7, 49.98], 'belly': [-113.25, 49.45], 'benton': [-110.667, 47.818], 'montana': [-111.5, 48.0],
 'bc': [-116.6, 50.95], 'idaho': [-114.6, 44.2], 'edmonton': [-113.49, 53.55], 'vancouver': [-123.12, 49.28], 'regina': [-104.62, 50.45], 'winnipeg': [-97.14, 49.9], 'seattle': [-122.33, 47.61],
}
labels = {'calgary': 'Calgary', 'cochrane': 'Cochrane Ranche', 'morley': 'Morleyville (Morley)', 'macleod': 'Fort Macleod', 'highriver': 'High River', 'baru': 'Bar U (Pekisko Creek)', 'nanton': 'Nanton',
 'oxley': 'Oxley Ranch', 'belly': 'Belly River', 'benton': 'Fort Benton', 'montana': 'Montana', 'bc': 'British Columbia', 'idaho': 'Idaho', 'edmonton': 'Edmonton', 'vancouver': 'Vancouver', 'regina': 'Regina',
 'winnipeg': 'Winnipeg', 'seattle': 'Seattle'}
EP = dict(lines=lines, endFilm=endd[0], endPart={1: endd[1], 2: endd[2], 3: endd[3], 4: endd[0]}, chTitles=E.CH_TITLES,
          places=places, placeLabels=labels, geo=dict(provinces=provs, rivers=rivers, rockies=rock))
tpl = open('/home/claude/work/scene_tpl.js').read()
out = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/work/scene.js'
open(out, 'w').write(tpl.replace('__EP__', json.dumps(EP, ensure_ascii=False, separators=(',', ':'))))
print(out, os.path.getsize(out), 'measured' if d else 'ESTIMATED durations')
