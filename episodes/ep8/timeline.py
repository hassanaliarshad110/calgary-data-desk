"""Episode 8 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav. Roman captions: Mama (never Ammi)."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Mama ko nahi pata...|ye nanha sa Qasim hi hai...'),
 'qh': ('QASIM', 'SUUU-SUUU-MAN!'),
 'n1b': ('NARR', 'Aur aaj beech sadak par|ek gaay ne poora shehar rok diya!'),
 'b1': ('BABA', 'Chalo bachcho! Aaj itwaar hai,|seedha chidiya ghar!'),
 'bs': ('BASIM', 'Yay! Sher dekhenge,|haathi dekhenge!'),
 'o1': ('OFFICER GILL', 'Hato bhai, hato! Gaay ji,|thoda side ho jaiye!'),
 'dd': ('DADA ABU', 'Horn bajane se gaay nahi hilegi.|Sabr karo, sabr!'),
 'k1': ('SAKINA', 'Baba, dekho! Gaay ka bachhda|bus ke peeche phans gaya!'),
 'dm': ('DADA ABU', 'Maa apne bachche ke bina|kahin nahi jaati.'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a2': ('MAMA', 'Yahan beech sadak pe?!|Achha chalo, main saath chalti hoon!'),
 'k2': ('SAKINA', 'Mamaaa... mujhe akele gaadi mein|dar lagta haiii... mat jaaooo...'),
 'a3': ('MAMA', 'Arre arre, rona band!|Main yahin hoon, meri jaan!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Daro mat, Chhotu!|Chalo, apni Maa ke paas!'),
 'q4': ('QASIM', 'Sab log, horn band karo!|Gaay dar rahi hai!'),
 'q5': ('QASIM', 'Aaram se, gaay ji...|wahan hari-hari ghaas hai!'),
 'o2': ('OFFICER GILL', 'Shabash!|Lekin ye tha kaun?!'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'bs2': ('BASIM', 'Qasim, tune dekha? Ek SUPERHERO|ne gaay ko hata diya!'),
 'q6': ('QASIM', 'Achha?|Mujhe to suusuu aayi thi!'),
 'dd2': ('DADA ABU', 'Dekha? Sabr se kaam lo,|to har jam khul jaata hai!'),
 'k3': ('SAKINA', 'Babaaa...|mujhe ice cream chahiyeee...'),
 'b3': ('BABA', 'Achha achha, rona band!|Sab ko ice cream milegi!'),
 'qs2': ('QASIM', 'Mamaaa!|Phir se suusuu aayi hai!'),
 'pf2': ('MAMA', 'Phir se?!'),
 'n3': ('NARR', 'Bachcho, sadak par sabr karo,|aur janwaron se door raho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.5, [('n1', 0), ('qh', .1), ('n1b', .3)], 1.5),
 ('car',     0.6, [('b1', 0), ('bs', .3)], 2.6),
 ('jam',     1.5, [('o1', 0), ('dd', 1.4), ('k1', .4), ('dm', .5)], 0.7),
 ('cry',     0.4, [('qs', 0), ('pf', .25), ('a2', .2), ('k2', .45), ('a3', .8), ('jj', .25)], 1.4),
 ('power',   0.7, [('n2', 0), ('qp', .9)], 1.4),
 ('rescue',  2.4, [('q3', 0), ('q4', 3.4), ('q5', .5), ('o2', 1.4)], 0.9),
 ('secret',  0.8, [('kt', 0), ('kn', .25), ('bs2', .4), ('q6', .3), ('dd2', .5)], 0.9),
 ('ending',  0.4, [('k3', 0), ('b3', .6), ('qs2', 1.4), ('pf2', .2)], 1.6),
 ('endcard', 0.5, [('n3', 0)], 3.0),
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
