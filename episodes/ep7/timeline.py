"""Episode 7 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav. Roman captions: Mama (never Ammi)."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Mama ko nahi pata...|ye nanha sa Qasim hi hai...'),
 'qh': ('QASIM', 'SUUU-SUUU-MAN!'),
 'n1b': ('NARR', 'Lekin aaj hamara hero...|ek chhote se teeke se darr raha hai!'),
 'a1': ('MAMA', 'Qasim! Chalo clinic,|aaj tumhara teeka lagna hai!'),
 'q1': ('QASIM', 'Nahi! Injection nahi!|Mujhe dar lagta hai!'),
 'b1': ('BABA', 'Arre mera sher beta!|Main bhi saath chalunga.'),
 'k1': ('SAKINA', 'Mama! Mano bhi bimaar hai...|kal se kuch nahi khaya!'),
 'l1': ('LATIFA', 'Aaiye aaiye! Pehle Mano ki baari,|phir Qasim ki!'),
 'd1': ('DHARMENDER', 'Arre! Billi to upar|machaan pe chadh gayi!'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a4': ('MAMA', 'Pehle teeka, phir!'),
 'k3': ('SAKINA', 'Mamaaa... mujhe bhi dar lag raha haiii...|mera haath pakdooo...'),
 'a6': ('MAMA', 'Arre arre, rona band!|Aao, meri bahadur beti!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Mano! Daro mat,|main aa gaya!'),
 'q4': ('QASIM', 'Sach bataun? Mujhe bhi|injection se dar lagta hai...'),
 'q5': ('QASIM', 'Par chalo, dono saath mein|bahadur bante hain!'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'l2': ('LATIFA', 'Dekho, Mano ko teeka lag gaya...|aur woh roi bhi nahi!'),
 'q7': ('QASIM', 'Theek hai...|main bhi bahadur hoon!'),
 'q8': ('QASIM', 'Bas? Itna sa?!'),
 'l3': ('LATIFA', 'Doctor dushman nahi,|dost hote hain!'),
 'k4': ('SAKINA', 'Mamaaa...|mujhe injection nahi lagwanaaa...'),
 'a8': ('MAMA', 'Achha yaad dilaya! Sakina,|tumhara teeka bhi aaj hi hai!'),
 'b2': ('BABA', 'Suna? Clinic ke paas koi|SUPERHERO aaya tha!'),
 'qs2': ('QASIM', 'Mamaaa!|Phir se suusuu aayi hai!'),
 'pf2': ('MAMA', 'Phir se?!'),
 'n3': ('NARR', 'Bachcho, doctor se daro mat,|doctor hamare dost hote hain!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.5, [('n1', 0), ('qh', .1), ('n1b', .3)], 1.5),
 ('home',    0.9, [('a1', 0), ('q1', .3), ('b1', .5), ('k1', .4)], 1.0),
 ('clinic',  2.2, [('l1', 0), ('d1', 2.95)], 0.6),
 ('cry',     0.4, [('qs', 0), ('pf', .25), ('a4', .2), ('k3', .45), ('a6', .9), ('jj', .25)], 1.5),
 ('power',   0.7, [('n2', 0), ('qp', .9)], 1.4),
 ('rescue',  2.2, [('q3', 0), ('q4', 2.7), ('q5', .3)], 1.5),
 ('brave',   1.6, [('kt', 0), ('kn', .25), ('l2', .4), ('q7', .3), ('q8', 1.7), ('l3', .3)], 0.5),
 ('ending',  0.3, [('k4', 0), ('a8', .8), ('b2', 1.1), ('qs2', .5), ('pf2', .2)], 1.7),
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
