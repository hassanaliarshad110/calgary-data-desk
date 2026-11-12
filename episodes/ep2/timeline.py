"""Episode 2 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Kya ek chaar saal ka bachcha...|is nanhe kabootar ko bacha paayega?'),
 'n2': ('NARR', 'Aaj hai patang ka din!|Har chhat par... patang hi patang!'),
 'q1': ('QASIM', 'Bunty bhai! Mujhe bhi|patang udaani hai!'),
 'b1': ('BUNTY', 'Ye manjha bahut tez hai!|Tu bahut chhota hai!'),
 'g1': ('GUDDU', 'Chhotu, tu bas charkhi pakad!'),
 'g2': ('GUDDU', 'Bo kaata!|Arre... apni hi kat gayi!'),
 'q2': ('QASIM', 'Ammi! Suusuu aayi hai!'),
 'a1': ('AMMI', 'Phir se?! Abhi to gaye the!'),
 'g3': ('GUDDU', 'Arre! Kabootar manjhe mein|phas gaya!'),
 'b2': ('BUNTY', 'Itna upar... aur manjha tez hai!|Ab kya karein?'),
 'n3': ('NARR', 'Lekin koi nahi jaanta...|har flush ke saath Qasim ban jata hai...'),
 'q3': ('QASIM', 'SUUU-SUUU-MAN!'),
 'b3': ('BUNTY', 'Wo superhero phir aa gaya!'),
 'g4': ('GUDDU', 'Usne kabootar bacha liya!'),
 'b4': ('BUNTY', 'Mera manjha...|parindon ko zakhmi karta hai.'),
 'b5': ('BUNTY', 'Aaj se sirf saada dhaaga!|Aa ja Chhotu, tu bhi uda!'),
 'q4': ('QASIM', 'Dekho! Sabse oonchi patang!'),
 'n4': ('NARR', 'Kabootar ne bhi apni dosti nibhaayi!'),
 'q5': ('QASIM', 'Ammiii! Suusuu aayi hai!'),
 'a2': ('AMMI', 'Phir se?! Aur baalon mein|ye pankh kahan se aaya?'),
 'q6': ('QASIM', 'Kuch nahi Ammi!'),
 'n5': ('NARR', 'Bachcho, manjha parindon ko|zakhmi karta hai...~Saada dhaaga istemaal karo!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.5, [('n1', 0)], 2.5),
 ('intro',   1.2, [('n2', 0)], 4.6),
 ('ask',     1.8, [('q1', 0), ('b1', .25), ('g1', .2)], 1.7),
 ('fight',   5.0, [('g2', 0)], 2.4),
 ('home',    1.8, [('q2', 0), ('a1', .3)], 1.7),
 ('danger',  3.2, [('g3', 0), ('b2', .3)], 1.6),
 ('power',   0.7, [('n3', 0), ('q3', .9)], 1.6),
 ('rescue',  7.0, [('b3', 0), ('g4', .25)], 2.4),
 ('lesson',  1.4, [('b4', 0), ('b5', .3), ('q4', 3.2), ('n4', .4)], 2.0),
 ('ending',  1.0, [('q5', 0), ('a2', .3), ('q6', .25)], 1.9),
 ('endcard', 0.6, [('n5', 0)], 3.4),
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
