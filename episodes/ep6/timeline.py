"""Episode 6 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Mama ko nahi pata...|ye nanha sa Qasim hi hai...'),
 'qh': ('QASIM', 'SUUU-SUUU-MAN!'),
 'n1b': ('NARR', 'Aur aaj mele ki bheed mein|ek nanhi bachchi kho gayi hai!'),
 'k1': ('SAKINA', 'Baba! Mele chalo na!|Sab ja rahe hain!'),
 'b1': ('BABA', 'Aaj nahi beta...|bahut thak gaya hoon.'),
 'k2': ('SAKINA', 'Babaaa...|mujhe mela dekhna haiii...'),
 'b2': ('BABA', 'Achha achha, rona band!~Chalo, sab mele chalte hain!'),
 'q1': ('QASIM', 'Yay! Mela! Mela!'),
 'm1': ('AMMAR', 'Aaiye aaiye!|Mele ka sab se bada jhoola!'),
 'p1': ('PARI', 'Mama! Papa!|Aap kahan ho?'),
 'q2': ('QASIM', 'Baaji, woh bachchi|akeli ro rahi hai!'),
 'q3': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'a1': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'k3': ('SAKINA', 'Mamaaa...|mujhe woh choodiyan chahiyeee...'),
 'a2': ('MAMA', 'Achha achha, rona band!|Chalo choodi wale ke paas!'),
 'k4': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q4': ('QASIM', 'Daro mat!|Tumhara naam kya hai?'),
 'p2': ('PARI', 'Mera naam Pari hai!~Hum Gulmohar Gali mein rehte hain!'),
 'q5': ('QASIM', 'Chalo, upar se|dhoondte hain!'),
 'p3': ('PARI', 'Woh rahe mere Mama Papa!'),
 'o1': ('OFFICER GILL', 'Pari ke Mummy Papa,|Khoya-Paaya booth par aaiye!'),
 'o2': ('OFFICER GILL', 'Bachcho, apna naam, ghar ka pata~aur Mummy Papa ka naam|hamesha yaad rakho!'),
 'a3': ('MAMA', 'Qasim! Kahan the tum?'),
 'q6': ('QASIM', 'Kuch nahi Mama!'),
 'b3': ('BABA', 'Suna? Mele mein koi|SUPERHERO aaya tha!'),
 'q7': ('QASIM', 'Mamaaa!|Phir se suusuu aayi hai!'),
 'a4': ('MAMA', 'Phir se?!'),
 'n3': ('NARR', 'Bachcho, mele mein Mama Baba ka|haath pakad ke rakho...~aur apna naam-pata yaad rakho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.5, [('n1', 0), ('qh', .1), ('n1b', .35)], 1.6),
 ('home',    1.6, [('k1', 0), ('b1', .3), ('k2', .35), ('b2', 1.1), ('q1', .3)], 1.0),
 ('mela',    3.2, [('m1', 0), ('p1', 3.4), ('q2', .4)], 0.6),
 ('cry',     0.5, [('q3', 0), ('a1', .25), ('k3', .4), ('a2', 1.0), ('k4', .3)], 1.6),
 ('power',   0.7, [('n2', 0), ('qp', .9)], 1.5),
 ('rescue',  2.8, [('q4', 0), ('p2', .3), ('q5', .3), ('p3', 2.6)], 1.0),
 ('reunite', 0.8, [('o1', 0), ('o2', 3.4)], 1.0),
 ('ending',  0.8, [('a3', 0), ('q6', .25), ('b3', .35), ('q7', .6), ('a4', .2)], 1.7),
 ('endcard', 0.5, [('n3', 0)], 3.2),
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
