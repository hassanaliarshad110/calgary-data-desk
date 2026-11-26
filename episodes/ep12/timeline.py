"""Episode 12 "Cricket Final" timeline (RETENTION STRUCTURE, Nov 18 2026 + the Nov 20 ending): cold open on the gali-final six flying
straight at Officer Gill's window (matches the Ep 11 flash) and the CRASH, no narrator before the flush; the narrator speaks only at the
flush and in the closing lesson on the end screen. Writes timeline.js + timeline.json. Durations from aud/<id>.wav. Roman captions: Mama (never Ammi)."""
import json, wave
LINES = {
 'x1': ('BASIM', 'Arre! Ball seedhi|khidki ki taraf!'),
 'g1': ('OFFICER GILL', 'Arre! Meri khidki!|Ye kisne kiya?!'),
 'b1': ('BASIM', 'M... maine nahi!|Hawa se toot gayi!'),
 'd1': ('DHARMENDER', 'Basim, sach bol de yaar!'),
 'g2': ('OFFICER GILL', 'Ruko! Main neeche aata hoon!'),
 'b2': ('BASIM', 'Gill Uncle aa rahe hain!|Main chupke se ball utaar leta hoon!'),
 'da1': ('DADA ABU', 'Basim! Pipe par mat chadho!|Neeche aao!'),
 'b3': ('BASIM', 'Bachao! Main phans gaya!'),
 'q1': ('QASIM', 'Basim latak gaya...|aur pipe hil raha hai!'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a2': ('MAMA', 'Abhi?!|Chalo, main saath chalti hoon!'),
 'k2': ('SAKINA', 'Mamaaa... Ammar Chacha ko bulaooo...|seedhi laooo...'),
 'a3': ('MAMA', 'Achha achha, rona band!|Ammar bhai ko bulati hoon!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Daro mat Basim!|Main aa gaya!'),
 'b4': ('BASIM', 'Pipe toot raha hai!'),
 'q4': ('QASIM', 'Pakad liya!'),
 'm1': ('AMMAR', 'Main seedhi le aaya!|Purana pipe main theek kar doonga!'),
 'q5': ('QASIM', 'Ye lo tumhari ball.|Ab sach bolna!'),
 'b5': ('BASIM', 'Pakka promise!'),
 'g3': ('OFFICER GILL', 'Ab batao,|meri khidki kisne todi?'),
 'b6': ('BASIM', 'Maine todi, Gill Uncle. Sorry!|Maine jhooth bola tha.'),
 'g4': ('OFFICER GILL', 'Sach bolne wala hi asli bahadur hai!|Khidki sab milke theek karenge.'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'da3': ('DADA ABU', 'Koi SUPERHERO aaya tha...|Basim ko hawa mein pakad liya!'),
 'q6': ('QASIM', 'Achha?|Mujhe to suusuu aayi thi!'),
 'x2': ('DADI', 'Arre arre!|Mera cake gir raha hai!'),
 'n3': ('NARR', 'Bachcho, galti ho jaaye to sach bolo,|aur pipe ya deewar par kabhi mat chadho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before | '@local_start')], post)
PLAN = [
 ('cold',    0.0, [('x1', .3), ('g1', .8)], 0.4),
 ('why',     0.2, [('b1', 0), ('d1', .3), ('g2', .3), ('b2', .4), ('da1', .5), ('b3', .5), ('q1', .4)], 0.4),
 ('gag',     0.3, [('qs', 0), ('pf', .2), ('a2', .2), ('k2', .4), ('a3', .6), ('jj', .25)], 1.1),
 ('power',   0.6, [('n2', 0), ('qp', .8)], 1.2),
 ('rescue',  0.0, [('q3', '@1.0'), ('b4', '@5.5'), ('q4', '@9.7'), ('m1', '@13.3'), ('q5', '@18.4'), ('b5', .3)], 2.0),
 ('secret',  0.6, [('g3', 0), ('b6', .4), ('g4', .4), ('kt', .6), ('kn', .2), ('da3', .5), ('q6', .3)], 1.6),
 ('cliff',   0.4, [('x2', 0)], 1.0),
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
