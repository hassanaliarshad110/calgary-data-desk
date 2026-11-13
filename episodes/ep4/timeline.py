"""Episode 4 timeline: scene order, dialogue placement, captions. Writes timeline.js (drawing) and timeline.json (mix).
Durations come from aud/<id>.wav."""
import json, os, wave
LINES = {
 'n1': ('NARR', 'Dhalaan par bhaagta thela...|aur saamne ek bachcha!~Kya koi use|rok paayega?'),
 'n2': ('NARR', 'Garmi ki dopahar... aur gali mein|aayi kulfi wale ki ghanti!'),
 'c1': ('KULFI CHACHA', 'Thandi thandi kulfi!|Malai kulfi!'),
 'd1': ('DADA ABU', 'Chacha! Sab bachchon ko kulfi do...~paise main dunga!'),
 'q1': ('QASIM', 'Mujhe mango wali kulfi!'),
 'o1': ('OFFICER GILL', 'Chacha, dhalaan par thela|dhyan se rokna!'),
 'q2': ('QASIM', 'Ammi! Suusuu aayi hai!'),
 'a1': ('AMMI', 'Phir se?! Abhi to gaye the!'),
 'k1': ('SAKINA', 'Jaa jaldi! Teri kulfi|main pakad leti hoon!'),
 'h1': ('DHARMENDER', 'Arre! Thela bhaag raha hai!'),
 'c2': ('KULFI CHACHA', 'Arre! Mera thela!'),
 's1': ('BASIM', 'Meri ball!'),
 'o2': ('OFFICER GILL', 'Ruko! Neeche bachcha hai!'),
 'n3': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'q3': ('QASIM', 'SUUU-SUUU-MAN!'),
 'o3': ('OFFICER GILL', 'Wo superhero phir aa gaya!'),
 's2': ('BASIM', 'Thela ruk gaya!|Main bach gaya!'),
 'c3': ('KULFI CHACHA', 'Shukriya! Aaj sab ko|do do kulfiyaan!'),
 'o4': ('OFFICER GILL', 'Bachcho, sadak par mat khelo...~aur dhalaan par khadi gaadi|se door raho!'),
 'q5': ('QASIM', 'Meri kulfi! Shukriya Baaji!'),
 'v1': ('DANIEL', 'Breaking news! Ek gali mein mystery hero ne~bhaagta hua thela rok liya!'),
 'v2': ('AMARA', 'Lekin wo hai kaun?|Kisi ko nahi pata!'),
 'd2': ('DADA ABU', 'Waah! Hamari gali mein bhi|koi hero hai!'),
 'q4': ('QASIM', 'Ammiii! Suusuu aayi hai!'),
 'a2': ('AMMI', 'Phir se?! Itni kulfi|kyun khaayi?!'),
 'k2': ('SAKINA', 'Ammi, garmi bahut hai na!'),
 'q6': ('QASIM', 'Kuch nahi Ammi!'),
 'n4': ('NARR', 'Bachcho, sadak par mat khelo...|dhalaan par khadi gaadi se door raho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before)], post)
PLAN = [
 ('hook',    0.5, [('n1', 0)], 2.0),
 ('intro',   1.0, [('n2', 0), ('c1', .3)], 0.9),
 ('kulfi',   0.5, [('d1', 0), ('q1', .3), ('o1', .4)], 1.3),
 ('home',    1.0, [('q2', 0), ('a1', .3), ('k1', .4)], 1.3),
 ('danger',  1.6, [('h1', 0), ('c2', .15), ('s1', .4), ('o2', .5)], 1.3),
 ('power',   0.7, [('n3', 0), ('q3', .9)], 1.6),
 ('rescue',  5.4, [('o3', 0), ('s2', .3)], 1.9),
 ('lesson',  0.9, [('c3', 0), ('o4', .4), ('q5', .5)], 1.4),
 ('tv',      0.7, [('v1', 0), ('v2', .3), ('d2', .4)], 0.8),
 ('ending',  0.7, [('q4', 0), ('a2', .3), ('k2', .3), ('q6', .3)], 1.6),
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
