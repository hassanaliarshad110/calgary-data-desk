"""Episode 9 timeline (RETENTION STRUCTURE, Nov 18 2026): cold open on the danger at frame 0, no narrator recap.
Writes timeline.js (drawing) and timeline.json (mix). Durations come from aud/<id>.wav. Roman captions: Mama (never Ammi)."""
import json, wave
LINES = {
 'b1': ('BASIM', 'Arre!|Chidiya gir gayi!'),
 'd1': ('DADI', 'Haaye! Garmi se|behosh ho gayi bechaari!'),
 'z1': ('ZAHRA MISS', 'Itni garmi mein parindon ko|paani kahan se milega?'),
 'q1': ('QASIM', 'Dadi, chidiya ko|paani chahiye!'),
 'zs': ('ZAHRA MISS', 'Bachcho,|kinaare se door raho!'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a2': ('MAMA', 'Itni garmi mein neeche akele?|Chalo, main saath chalti hoon!'),
 'k2': ('SAKINA', 'Mamaaa... mujhe pehle thanda thanda|nimbu paani chahiye... abhi...'),
 'a3': ('MAMA', 'Achha achha, rona band!|Pehle tumhein deti hoon!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Daro mat, nanhi chidiya!|Main aa gaya!'),
 'z2': ('ZAHRA MISS', 'Tanki phat gayi!|Chidiya neeche gir rahi hai!'),
 'q4': ('QASIM', 'Pakad liya!'),
 'd3': ('DADI', 'Arre!|Saara paani beh jayega!'),
 'q5': ('QASIM', 'Lo! Ab sab parindon ko|paani milega!'),
 'b2': ('BASIM', 'Waah!|Chidiya ne paani pi liya!'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'd2': ('DADI', 'Koi hero aaya tha... parindon ko|paani pila kar chala gaya!'),
 'q6': ('QASIM', 'Achha?|Mujhe to suusuu aayi thi!'),
 'v1': ('DANIEL', 'Breaking news! Mystery hero ne|garmi mein chidiya ko bachaya!'),
 'v2': ('AMARA', 'Aur chhat par parindon ke liye|paani bhi rakh diya!'),
 'z3': ('ZAHRA MISS', 'Bachcho, garmi mein chhat par|parindon ke liye paani zaroor rakho!'),
 'bv': ('BASIM', 'Arre! School van|apne aap chal padi!'),
 'qe': ('QASIM', 'LIKE aur SUBSCRIBE karo!|Bye bye!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('cold',    0.0, [('b1', .3), ('d1', 1.0)], 0.4),
 ('garmi',   0.3, [('z1', 0), ('q1', .3), ('zs', .3)], 0.5),
 ('gag',     0.3, [('qs', 0), ('pf', .2), ('a2', .2), ('k2', .4), ('a3', .6), ('jj', .25)], 1.1),
 ('power',   0.6, [('n2', 0), ('qp', .8)], 1.2),
 ('rescue',  3.4, [('q3', 0), ('z2', 1.2), ('q4', 1.4), ('d3', .8)], 0.6),
 ('fix',     0.8, [('q5', 2.2), ('b2', 1.4)], 3.0),
 ('secret',  0.5, [('kt', 0), ('kn', .2), ('d2', .5), ('q6', .3)], 1.0),
 ('tv',      0.5, [('v1', 0), ('v2', .2)], 0.5),
 ('lesson',  0.4, [('z3', 0)], 1.8),
 ('cliff',   0.4, [('bv', 0)], 1.5),
 ('endcard', 0.8, [('qe', 0)], 11.2),
]
def dur(i):
    w = wave.open(f'aud/{i}.wav'); return w.getnframes() / w.getframerate()
scenes, lines, t = [], {}, 0.0
for sid, pre, ls, post in PLAN:
    loc = pre
    for lid, gap in ls:
        loc += gap
        d = dur(lid); sp, txt = LINES[lid]
        lines[lid] = {'scene': sid, 's': round(loc, 3), 'd': round(d, 3), 'abs': round(t + loc, 3), 'sp': sp, 'txt': txt}
        loc += d
    loc += post
    scenes.append({'id': sid, 'start': round(t, 3), 'dur': round(loc, 3)})
    t += loc
TL = {'scenes': scenes, 'lines': lines, 'total': round(t, 3)}
open('timeline.js', 'w').write('window.TL = ' + json.dumps(TL) + ';')
json.dump(TL, open('timeline.json', 'w'), indent=1)
print('total', round(t, 2)); [print(s['id'], s['start'], s['dur']) for s in scenes]
for k, l in lines.items(): print(' ', k, l['scene'], l['s'], round(l['s'] + l['d'], 2), 'abs', l['abs'])
