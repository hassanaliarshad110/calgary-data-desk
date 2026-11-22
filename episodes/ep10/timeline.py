"""Episode 10 timeline (RETENTION STRUCTURE, Nov 18 2026): cold open on the runaway school van at frame 0, no narrator before the flush;
the narrator speaks only twice (power line + the closing lesson on the end screen, Hassan Nov 20). Writes timeline.js + timeline.json.
Durations come from aud/<id>.wav. Roman captions: Mama (never Ammi). A gap value '@x' places the line at local time x in its scene."""
import json, wave
LINES = {
 'bv': ('BASIM', 'Arre! School van|apne aap chal padi!'),
 'b1': ('BABA', 'Andar bachche hain!|Koi roko!'),
 'a1': ('MAMA', 'Haaye! Driver bhai ghanti bajane utre,|aur van phisal gayi!'),
 'm1': ('AMMAR', 'Ruko! Neeche naali ka|khadda khula hai!'),
 'q1': ('QASIM', 'Mera school ka pehla din...|aur van mein ek bachchi ro rahi hai!'),
 'qs': ('QASIM', 'Mama! Suusuu aayi hai!'),
 'pf': ('MAMA', 'Phir se?! Abhi to gaye the!'),
 'a2': ('MAMA', 'Abhi?! Itni bhaag-daud mein?|Chalo, main saath chalti hoon!'),
 'k2': ('SAKINA', 'Mamaaa... mera tiffin van mein|reh gayaaa... main bhookhi rahoongi...'),
 'a3': ('MAMA', 'Achha achha, rona band!|Naya tiffin banati hoon!'),
 'jj': ('SAKINA', 'Jaa jaldi!'),
 'n2': ('NARR', 'Sirf Sakina jaanti hai...|har flush ke saath Qasim ban jata hai...'),
 'qp': ('QASIM', 'SUUU-SUUU-MAN!'),
 'q3': ('QASIM', 'Daro mat bachcho!|Main aa gaya!'),
 'm2': ('AMMAR', 'Bumper toot gaya!|Van khadde ki taraf!'),
 'q4': ('QASIM', 'Pakad liya!'),
 'o1': ('NOOR', 'Shukriya, superhero!'),
 'm3': ('AMMAR', 'Shabash! Bachche bilkul theek hain!|Ab pahiyon ke peeche eent laga deta hoon!'),
 'kt': ('MAMA', 'Qasim! Kahan the tum?'),
 'kn': ('QASIM', 'Kuch nahi Mama!'),
 'b2': ('BABA', 'Koi SUPERHERO aaya tha...|van ko haathon se rok diya!'),
 'q6': ('QASIM', 'Achha?|Mujhe to suusuu aayi thi!'),
 'z1': ('ZAHRA MISS', 'Bachcho, school mein|aapka swaagat hai!'),
 'q7': ('QASIM', 'Main Qasim! Tum akeli kyun ho?|Mere saath baithogi?'),
 'o2': ('NOOR', 'Haan! Main Noor.|Ab hum dost!'),
 'o3': ('NOOR', 'Mere tiffin mein aloo paratha hai...|aadha aadha?'),
 'q8': ('QASIM', 'Haan! Dost sab kuch|aadha aadha karte hain!'),
 'c1': ('SAKINA', 'Arre! Pilla platform par|akela reh gaya!'),
 'n3': ('NARR', 'Bachcho, naye bachchon se dosti karo,|aur chalti gaadi se door raho!~Video achhi lagi to|LIKE aur SUBSCRIBE karo!'),
}
# (scene, pre, [(line, gap_before | '@local_start')], post)
PLAN = [
 ('cold',    0.0, [('bv', .3), ('b1', .5)], 0.5),
 ('why',     0.3, [('a1', 0), ('m1', .5), ('q1', .5)], 0.5),
 ('gag',     0.3, [('qs', 0), ('pf', .2), ('a2', .2), ('k2', .4), ('a3', .6), ('jj', .25)], 1.1),
 ('power',   0.6, [('n2', 0), ('qp', .8)], 1.2),
 ('rescue',  0.0, [('q3', '@1.0'), ('m2', '@6.6'), ('q4', '@13.0'), ('o1', '@17.2')], 2.0),
 ('after',   0.6, [('m3', 0)], 1.2),
 ('secret',  0.5, [('kt', 0), ('kn', .2), ('b2', .5), ('q6', .3)], 1.0),
 ('school',  0.6, [('z1', 0), ('q7', .8), ('o2', .3), ('o3', .6), ('q8', .3)], 1.4),
 ('cliff',   0.4, [('c1', 0)], 1.0),
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
