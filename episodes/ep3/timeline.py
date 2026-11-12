"""Episode 3 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Barish ka tez paani...|aur ek nanha pilla!~Kya koi use|bacha paayega?'),
 'n2': ('NARR', 'Aaj gali mein zor ki barish hai!~Sab bachche kaagaz ki|kashti chala rahe hain!'),
 's1': ('BASIM', 'Qasim! Dekh,|meri kashti sabse tez!'),
 'd1': ('DADI', 'Bachcho! Paani mein mat jaana,|naala bhar gaya hai!'),
 'm1': ('AMMAR', 'Arre! Dekho, wo dabba|beh raha hai...~us par pilla hai!'),
 's2': ('BASIM', 'Pilla naale ki taraf|ja raha hai!'),
 'q1': ('QASIM', 'Ammi! Suusuu aayi hai!'),
 'a1': ('AMMI', 'Phir se?! Abhi to gaye the!'),
 'k1': ('SAKINA', 'Jaa jaldi...|main sambhaal leti hoon!'),
 'n3': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'q2': ('QASIM', 'SUUU-SUUU-MAN!'),
 'm2': ('AMMAR', 'Wo superhero phir aa gaya!'),
 's3': ('BASIM', 'Pilla bach gaya!'),
 'd2': ('DADI', 'Shabaash bachcho! Barish ke paani mein~kabhi mat khelna,|bado ko bulana!'),
 's4': ('BASIM', 'Iska naam rakhte hain...|Moti!'),
 'q3': ('QASIM', 'Moti! Ab tu hamara dost hai!'),
 'a2': ('AMMI', 'Qasim! Itne geele|kaise ho gaye?!'),
 'k2': ('SAKINA', 'Ammi, wo...|chhat pe baarish dekh raha tha!'),
 'q4': ('QASIM', 'Kuch nahi Ammi!'),
 'n4': ('NARR', 'Bachcho, barish ke paani mein|mat khelo... bado ko bulao!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
PLAN = [
 ('hook',    0.5, [('n1', 0)], 2.0),
 ('intro',   1.0, [('n2', 0), ('s1', .4)], 1.6),
 ('warn',    0.8, [('d1', 0)], 1.4),
 ('danger',  1.2, [('m1', 0), ('s2', .3)], 1.6),
 ('home',    1.8, [('q1', 0), ('a1', .3), ('k1', .4)], 1.7),
 ('power',   0.7, [('n3', 0), ('q2', .9)], 1.6),
 ('rescue',  5.5, [('m2', 0), ('s3', .3)], 2.0),
 ('lesson',  1.2, [('d2', 0), ('s4', .5), ('q3', .3)], 2.0),
 ('ending',  1.0, [('a2', 0), ('k2', .3), ('q4', .3)], 2.0),
 ('endcard', 0.6, [('n4', 0)], 3.4),
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
