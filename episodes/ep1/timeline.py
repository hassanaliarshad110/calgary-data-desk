"""Episode 1 timeline: scene order, dialogue placement, captions. Writes timeline.js (for drawing) and timeline.json (for the mix).
Durations come from aud/<id>.wav when present, otherwise estimates."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Kya ek chaar saal ka bachcha...|is nanhi billi ko bacha paayega?'),
 'n2': ('NARR', 'Ye hai hamari gali.|Aur yahan chal raha hai sab se bada match!'),
 'q1': ('QASIM', 'Bunty bhai! Mujhe bhi batting karni hai!'),
 'b1': ('BUNTY', 'Tu bahut chhota hai!|Tu sirf fielding karega!'),
 'g1': ('GUDDU', 'Haan haan! Chhotu, ja ke fielding kar!'),
 'q2': ('QASIM', 'Time out! Suusuu aayi hai!'),
 'b2': ('BUNTY', 'Phir se?! Ye aaj saatvi baar hai!'),
 'a1': ('AMMI', 'Phir se?! Abhi to gaye the!'),
 'g2': ('GUDDU', 'Arre! Mano ped par phas gayi!'),
 'b3': ('BUNTY', 'Itna upar koi nahi ja sakta!'),
 'n3': ('NARR', 'Lekin koi nahi jaanta...|har flush ke saath Qasim ban jata hai...'),
 'q3': ('QASIM', 'SUUU-SUUU-MAN!'),
 'b4': ('BUNTY', 'Ye... ye kaun tha?!'),
 'g3': ('GUDDU', 'Koi superhero tha!'),
 'b5': ('BUNTY', 'Qasim! Aakhri ball tu khel.|Chaar run chahiye!'),
 'q4': ('QASIM', 'Sach mein?! Haan!'),
 'n4': ('NARR', 'Mano ne bhi apna ehsaan chuka diya!'),
 'q5': ('QASIM', 'Ammiii! Suusuu aayi hai!'),
 'a2': ('AMMI', 'Phir se?!'),
 'n5': ('NARR', 'Bachcho, ped par khud mat chadhna,|badon ko bulao!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
EST = {'n1': 4.2, 'n2': 4.0, 'q1': 2.0, 'b1': 2.3, 'g1': 2.0, 'q2': 1.7, 'b2': 2.2, 'a1': 2.0, 'g2': 2.0, 'b3': 1.9,
       'n3': 3.6, 'q3': 1.8, 'b4': 1.4, 'g3': 1.3, 'b5': 2.8, 'q4': 1.4, 'n4': 2.4, 'q5': 1.8, 'a2': .8, 'n5': 6.0}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',   0.5, [('n1', 0)], 2.4),
 ('intro',  1.0, [('n2', 0)], 5.7),
 ('ask',    2.0, [('q1', 0), ('b1', .25), ('g1', .2)], 1.8),
 ('field',  1.9, [('q2', 0), ('b2', .3)], 0.9),
 ('home',   1.9, [('a1', 0)], 1.6),
 ('danger', 7.0, [('g2', 0), ('b3', .3)], 2.0),
 ('power',  0.7, [('n3', 0), ('q3', .9)], 1.6),
 ('rescue', 8.6, [('b4', 0), ('g3', .25)], 3.0),
 ('last',   2.6, [('b5', 0), ('q4', .3), ('n4', 6.4)], 2.4),
 ('ending', 1.2, [('q5', 0), ('a2', .3)], 2.2),
 ('endcard', 0.6, [('n5', 0)], 3.6),
]
def dur(i):
    p = f'aud1/{i}.wav'
    if os.path.exists(p):
        w = wave.open(p); return w.getnframes() / w.getframerate()
    return EST[i]
scenes, lines, t = [], {}, 0.0
for sid, pre, ls, post in PLAN:
    loc = pre
    for k, (lid, gap) in enumerate(ls):
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
