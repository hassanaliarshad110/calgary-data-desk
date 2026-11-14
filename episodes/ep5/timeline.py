"""Episode 5 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Bandar ke haath mein|Dadi ka chashma...~aur saamne bijli ke taar!|Ab kya hoga?'),
 'n2': ('NARR', 'Sardi ki dhoop... aur chhat par|Dadi ki garam garam moongphali!'),
 'i1': ('DADI', 'Aao bachcho!|Garam garam moongphali khao!'),
 'q1': ('QASIM', 'Dadi, mujhe bhi!|Mujhe bhi!'),
 's1': ('BASIM', 'Bandar Mama! Kela lo...~haha, nahi milega!'),
 'i2': ('DADI', 'Basim beta!|Bandar ko tang mat karo!'),
 'i3': ('DADI', 'Arre! Mera chashma!~Mujhe kuch nahi dikh raha!'),
 'q2': ('QASIM', 'Ammi! Suusuu aayi hai!'),
 'a1': ('AMMI', 'Phir se?! Abhi to gaye the!'),
 'k1': ('SAKINA', 'Jaa jaldi! Dadi ko|main sambhaalti hoon!'),
 'l1': ('LATIFA', 'Arre! Meri kitaabein!'),
 'z1': ('ZAHRA MISS', 'Dekho! Bandar bijli ke|khambe par chadh gaya!'),
 'z2': ('ZAHRA MISS', 'Koi upar mat jaana!|Taaron mein current hai!'),
 'n3': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'q3': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q5': ('QASIM', 'Bandar Mama, ye lo kela...|chashma de do!'),
 'l2': ('LATIFA', 'Wo superhero phir aa gaya!'),
 'z3': ('ZAHRA MISS', 'Bandar bhi bach gaya...|aur chashma bhi!'),
 'i5': ('DADI', 'Shukriya beta!|Par... tum ho kaun?'),
 's2': ('BASIM', 'Sorry Bandar Mama!~Ye lo, poora kela tumhara!'),
 'z4': ('ZAHRA MISS', 'Bachcho, janwaron ko|tang mat karo...~woh dar kar cheezein|chheen lete hain!'),
 'v1': ('DANIEL', 'Breaking news! Mystery hero ne bandar ko~bijli ke taaron se bachaya!'),
 'v2': ('AMARA', 'Aur Dadi ka chashma|bhi lauta diya!'),
 'd1': ('DADA ABU', 'Dekha! Main kehta tha, hamari|gali mein bhi hero hai!'),
 'i6': ('DADI', 'Mujhe to sab dhundla dikha...~par dil ka bahut achha tha!'),
 'q4': ('QASIM', 'Ammiii! Suusuu aayi hai!'),
 'a2': ('AMMI', 'Phir se?! Itni moongphali|kyun khaayi?!'),
 'k2': ('SAKINA', 'Ammi, sardi bahut hai na!'),
 'q6': ('QASIM', 'Kuch nahi Ammi!'),
 'n4': ('NARR', 'Bachcho, janwaron ko tang mat karo...|unse pyaar karo!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.4, [('n1', 0)], 1.7),
 ('intro',   0.8, [('n2', 0), ('i1', .2), ('q1', .2)], 0.6),
 ('tease',   0.4, [('s1', 0), ('i2', .2), ('i3', 1.7)], 0.9),
 ('home',    0.7, [('q2', 0), ('a1', .25), ('k1', .3)], 1.2),
 ('chase',   1.0, [('l1', 0), ('z1', .6), ('z2', .2)], 1.0),
 ('power',   0.7, [('n3', 0), ('q3', .9)], 1.5),
 ('rescue',  2.2, [('q5', 0), ('l2', 2.6), ('z3', .2)], 1.0),
 ('lesson',  0.6, [('i5', 0), ('s2', .4), ('z4', .3)], 1.0),
 ('tv',      0.6, [('v1', 0), ('v2', .2), ('d1', .3)], 0.6),
 ('ending',  0.6, [('q4', 0), ('a2', .25), ('k2', .25), ('q6', .25)], 1.5),
 ('endcard', 0.5, [('n4', 0)], 3.2),
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
