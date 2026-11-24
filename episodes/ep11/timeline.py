"""Episode 11 "Train Ka Safar" timeline (RETENTION STRUCTURE, Nov 18 2026 + the Nov 20 ending): cold open on the puppy left alone at the
platform edge while Pari's train pulls out (matches the Ep 10 flash), no narrator before the flush; the narrator speaks only at the flush
and in the closing lesson on the end screen. Writes timeline.js + timeline.json. Durations from aud/<id>.wav. Roman captions: Mama (never Ammi)."""
import json, wave
LINES = {
 'c1': ('SAKINA', 'Arre! Pilla platform par|akela reh gaya!'),
 'p1': ('PARI', 'Golu! Mera Golu|neeche reh gaya!'),
 'd1': ('DHARMENDER', 'Arre! Ye to Pari ka pilla hai!|Khidki se kood gaya!'),
 'l1': ('LATIFA', 'Aur train chal padi!|Pari andar ro rahi hai!'),
 'b1': ('BABA', 'Sab peeli line ke peeche!|Kinaare se door!'),
 'q1': ('QASIM', 'Golu akela hai...|aur Pari bhi ro rahi hai!'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a2': ('MAMA', 'Station par?!|Chalo, main saath chalti hoon!'),
 'k2': ('SAKINA', 'Mamaaa... mujhe garam|samosa chahiyeee... abhiii...'),
 'a3': ('MAMA', 'Achha achha, rona band!|Samosa laati hoon!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Daro mat Golu!|Main aa gaya!'),
 'd2': ('DHARMENDER', 'Pilla patri par gir gaya!'),
 'l2': ('LATIFA', 'Neeche mat utro!|Doosri train aa rahi hai!'),
 'q4': ('QASIM', 'Pakad liya!'),
 'q5': ('QASIM', 'Pari! Ye lo,|tumhara Golu!'),
 'p2': ('PARI', 'Golu! Shukriya, superhero!'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'l3': ('LATIFA', 'Koi SUPERHERO aaya tha...|pilla train tak pahuncha diya!'),
 'q6': ('QASIM', 'Achha?|Mujhe to suusuu aayi thi!'),
 'b2': ('BABA', 'Hamari train aa gayi!|Sab Mama-Baba ka haath pakdo!'),
 'x1': ('BASIM', 'Arre! Ball seedhi|khidki ki taraf!'),
 'n3': ('NARR', 'Bachcho, hamesha Mama-Baba ke saath raho,|aur platform ke kinaare se door raho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before | '@local_start')], post)
PLAN = [
 ('cold',    0.0, [('c1', .3), ('p1', .4)], 0.4),
 ('why',     0.2, [('d1', 0), ('l1', .35), ('b1', .4), ('q1', .4)], 0.5),
 ('gag',     0.3, [('qs', 0), ('pf', .2), ('a2', .2), ('k2', .4), ('a3', .6), ('jj', .25)], 1.1),
 ('power',   0.6, [('n2', 0), ('qp', .8)], 1.2),
 ('rescue',  0.0, [('q3', '@1.0'), ('d2', '@4.7'), ('l2', '@6.5'), ('q4', '@12.3')], 3.6),
 ('handoff', 0.0, [('q5', '@3.0'), ('p2', .5)], 5.2),
 ('secret',  0.5, [('kt', 0), ('kn', .2), ('l3', .5), ('q6', .3), ('b2', .6)], 1.8),
 ('cliff',   0.4, [('x1', 0)], 1.0),
 ('endcard', 0.8, [('n3', 0)], 7.6),
]
def dur(i):
    try:
        w = wave.open(f'aud/{i}.wav'); return w.getnframes() / w.getframerate()
    except FileNotFoundError:
        print('MISSING', i); return 2.5
scenes, lines, t = [], {}, 0.0
for sid, pre, ls, post in PLAN:
    loc = pre
    for lid, gap in ls:
        if isinstance(gap, str): loc = max(loc, float(gap[1:]))
        else: loc += gap
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
