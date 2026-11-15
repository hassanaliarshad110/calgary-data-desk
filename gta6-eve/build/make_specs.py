# builds the timing specs (voice track layout + shots + overlays) for the full video, teaser and Parts 1-3
import json, sys, re
sys.path.insert(0, '/home/claude/gta6')
from compose import chunks
D = json.load(open('/home/claude/gta6/tts_out/durs.json'))
L = json.load(open('/home/claude/gta6/lines.json'))

def layout(seq, lead=0.35, gap=0.9, breathers=None):
    # seq: list of (key, idx); returns [(key, idx, t0, t1)]
    breathers = breathers or {}; t = lead; out = []
    for j, (k, i) in enumerate(seq):
        d = D[k][i]; out.append((k, i, t, t + d)); t += d + gap + breathers.get(j, 0)
    return out, t - gap

def caps_for(lay, maxc):
    caps = []
    for k, i, t0, t1 in lay:
        cs = chunks(L[k][i], maxc); tot = sum(len(c) for c in cs); t = t0
        for c in cs:
            d = (t1 - t0) * len(c) / tot; caps.append({'t0': round(t, 3), 't1': round(t + d, 3), 'text': c}); t += d
        caps[-1]['t1'] = round(t1 + 0.35, 3)
    return caps

def fit(shots, total):
    # last shot absorbs the remainder
    s = sum(x['dur'] for x in shots[:-1]); shots[-1]['dur'] = round(total - s, 3); assert shots[-1]['dur'] > 0.3, (total, s)
    return shots

def S(clip, dur, **kw):
    d = {'clip': clip, 'dur': dur, 'a': 0.0, 'b': 1.0}; d.update(kw); return d

def full(orient):
    P = orient == 'port'; W, H = (1080, 1920) if P else (1920, 1080)
    seq = [('f', i) for i in range(25)]
    lay, tend = layout(seq, breathers={2: 1.2, 5: 1.6, 8: 1.6, 12: 1.6, 19: 1.4, 21: 0.6})
    st = {i: (t0, t1) for (_, i, t0, t1) in lay}
    endcard_t = st[24][1] + 0.6; total = endcard_t + 6.5
    # shot plan per line: (start_time) -> shots fill until next line start
    Z = 1.0 if P else 1.75   # UI screens are small on a 1920 canvas: zoom in
    plan = {
        0: [S('skyline', 1.0, a=.55, b=.7), S('fireworks', 0.95, a=.3, b=.45), S('ctrain', 0.95, a=.5, b=.65), S('midway', 0.95, a=.3, b=.5), S('saddledome', 1.25, a=.2, b=.4)],
        1: [S('homes', 2.6, a=0, b=.5), S('car', 3.0, a=.1, b=.8), S('heli', 3.2, a=.3, b=1)],
        2: [S('title', 3.2, a=0, b=1, z0=Z, z1=Z * 1.05, cy=.55), S('chars', 4.0, a=.82, b=.98, z0=Z, z1=Z, cy=.42)],
        3: [S('skyline', 7.0, a=0, b=.55), S('river', 4.0, a=0, b=.5)],
        4: [S('homes', 6.6, a=.3, b=1)],
        5: [S('cityhall', 5.6), S('tower', 5.6), S('skyline', 5.4, a=.5, b=1)],
        6: [S('river', 2.6, a=.5, b=.8), S('saddledome', 3.0, a=0, b=.4)],
        7: [S('midway', 6.0), S('fireworks', 5.6, a=0, b=.6)],
        8: [S('saddledome', 7.2, a=.3, b=1), S('fireworks', 3.0, a=.6, b=1)],
        9: [S('bus', 2.4, a=0, b=.3), S('bus', 5.4, a=.3, b=1, z0=1.0, z1=1.0 if P else 1.7, cx=0.5, cy=0.45)],
        10: [S('ctrain', 7.1, a=0, b=1)],
        11: [S('r311', 4.9, a=0, b=.4)],
        12: [S('r311', 6.5, a=.4, b=.58), S('r311', 8.2, a=.58, b=1, z0=1.0 if P else 1.35, z1=1.15 if P else 1.75, cx=0.5, cy=0.5)],
        13: [S('chars', 2.5, a=0, b=.02, z0=Z, z1=Z, cy=.42)],
        14: [S('chars', 3.7, a=.0, b=.19, z0=Z, z1=Z, cy=.42), S('chars', 4.0, a=.2, b=.39, z0=Z, z1=Z, cy=.42), S('chars', 3.4, a=.4, b=.59, z0=Z, z1=Z, cy=.42), S('chars', 3.6, a=.6, b=.79, z0=Z, z1=Z, cy=.42), S('chars', 4.8, a=.8, b=1, z0=Z, z1=Z, cy=.42)],
        15: [S('card', 6.0, a=.2, b=1, z0=1.0 if P else 1.4, z1=1.0 if P else 1.6, cx=0.5, cy=0.5), S('natalia', 5.2, a=0, b=.45)],
        16: [S('card', 5.0, a=0, b=.6, z0=1.0 if P else 1.6, z1=1.0 if P else 1.7), S('natalia', 4.9, a=.55, b=1, z0=1.0 if P else 1.45, z1=1.0 if P else 1.55, cy=.40)],
        17: [S('natalia', 5.6, a=0, b=.5, z0=1.0 if P else 1.2, z1=1.0 if P else 1.35, cy=.72)],
        18: [S('langs', 8.3, a=0, b=1, z0=Z, z1=Z, cy=.45)],
        19: [S('heli', 4.0, a=0, b=.6), S('car', 3.5, a=.3, b=1), S('river', 3.2, a=.6, b=1)],
        20: [S('tower', 5.2, a=.2, b=1), S('skyline', 5.0, a=.2, b=.7)],
        21: [S('river', 8.0, a=0, b=1)],
        22: [S('skyline', 3.6, a=.6, b=1)],
        23: [S('fireworks', 4.2, a=.2, b=.8)],
        24: [S('saddledome', 8.0, a=0, b=.7)],
    }
    shots = []
    for i in range(25):
        t0 = 0 if i == 0 else st[i][0]
        t1 = st[i + 1][0] if i < 24 else endcard_t
        shots += fit([dict(x) for x in plan[i]], t1 - t0)
    shots.append(S('saddledome', round(total - endcard_t, 3), a=.7, b=1))
    # fix first shot start at 0
    caps = [c for c in caps_for(lay, 26 if P else 44) if c['t0'] >= st[1][0] - 0.01]
    lab = lambda i, k, title, dur=None, dt=0.2: {'t0': st[i][0] + dt, 'dur': dur or min(5.0, st[i][1] - st[i][0] + 0.6), 'k': k, 'title': title}
    labels = [lab(2, 'Free game · in your browser', 'YYC City Stories'),
              lab(3, 'The real map', 'OpenStreetMap + City of Calgary open data', 6),
              lab(4, 'Real homes', 'Real footprints and heights'),
              {'t0': st[5][0] + 0.3, 'dur': 5.0, 'k': 'Landmark', 'title': 'Historic City Hall'},
              {'t0': st[5][0] + 5.9, 'dur': 4.8, 'k': 'Landmark', 'title': 'Calgary Tower'},
              lab(7, 'Stampede Park', 'Midway · Grandstand Show · fireworks', 6),
              lab(8, 'Music', 'Under One Sky, the game\'s title song', 6),
              lab(9, 'Calgary Transit', 'Real routes and stops', 6),
              lab(10, 'Ride the CTrain', 'Red Line and Blue Line'),
              lab(11, 'Real 311 requests', 'From the City\'s open data', 7),
              lab(15, 'Twenty-seven missions', 'Learn how the city works', 4.5, dt=6.1),
              lab(16, 'Missions teach', 'Carts · snow · Health Link 811 · scams', 4.4, dt=5.1),
              lab(17, 'Natalia\'s story', 'Bullying and cyberbullying'),
              lab(19, 'Free roam', 'Cars · helicopter · landmarks · online', 6),
              lab(21, 'Free · no download · no account', 'Play it today')]
    notes = [{'t0': st[6][0], 't1': st[8][1] + 0.6, 'text': 'Stampede Park is re-created in the game · not affiliated with the Calgary Stampede'},
             {'t0': st[23][0], 't1': endcard_t, 'text': 'Stampede Park is re-created in the game · not affiliated with the Calgary Stampede'},
             {'t0': st[9][0], 't1': st[12][1], 'text': 'Not affiliated with the City of Calgary'},
             {'t0': st[20][0], 't1': st[20][1] + 0.5, 'text': 'Not affiliated with Rockstar Games'}]
    ctas = [{'t0': st[22][0], 't1': st[22][1] + 0.6, 'top': 'PLAY FREE', 'big': 'calgaryinsight.ca/game'},
            {'t0': st[23][0], 't1': st[24][0] - 0.05, 'top': 'Drop your thoughts below', 'big': 'Which Calgary spot should we add next?'},
            {'t0': st[24][0], 't1': endcard_t, 'top': 'Follow @calgaryinsight', 'big': 'Facebook · Instagram · YouTube'}]
    mid = st[13][0] + 0.2
    hook = [{'t0': 0, 't1': st[0][1] + 0.5, 'parts': [(0.0, 'GTA 6 drops TOMORROW.', ['GTA', '6', 'TOMORROW'], 96 if P else 104), (2.2, 'But what if your next open world…', [], 74 if P else 70), (3.6, 'is CALGARY?', ['CALGARY'], 120 if P else 116)]}]
    return dict(W=W, H=H, orient=orient, dur=round(total, 3), shots=shots, caps=caps, labels=labels, notes=notes, ctas=ctas,
                pills=[{'t0': mid, 'dur': 2.6}], hook=hook, header_from=st[1][0], end=[{'t0': endcard_t}], endcard='YYC City Stories · free on the real map of Calgary',
                voice=[(k, i, round(t0, 3)) for (k, i, t0, t1) in lay], lines_t=[(i, round(t0, 3), round(t1, 3)) for (_, i, t0, t1) in lay])

def vertical(name, seq, plan, labels_fn, closing_q, notes_fn=None, hook_parts=None, breathers=None, pill_at=None):
    W, H = 1080, 1920
    lay, tend = layout(seq, gap=0.6, breathers=breathers or {})
    st = [(t0, t1) for (_, _, t0, t1) in lay]
    total = st[-1][1] + 1.6
    shots = []
    for j in range(len(seq)):
        t0 = 0 if j == 0 else st[j][0]; t1 = st[j + 1][0] if j + 1 < len(seq) else total
        shots += fit([dict(x) for x in plan[j]], t1 - t0)
    UIZ = {'bus': 0, 'card': 0, 'chars': 0, 'langs': 0, 'title': 0, 'r311': 0.55, 'natalia': 0.5}
    for sh in shots:   # game UI panels are small on a 1080-wide screen: zoom in, keep them above the captions
        if sh['clip'] in UIZ and sh.get('a', 0) >= UIZ[sh['clip']] - 1e-6:
            sh['z0'] = 1.25; sh['z1'] = 1.3; sh['cx'] = 0.5; sh['cy'] = 0.55
    caps = [c for c in caps_for(lay, 26) if c['t0'] >= st[1][0] - 0.01]
    last = st[-1]
    ctas = [{'t0': last[0], 't1': total, 'top': 'Play free: calgaryinsight.ca/game', 'big': closing_q}]
    hook = [{'t0': 0, 't1': st[0][1] + 0.4, 'parts': hook_parts}]
    return dict(W=W, H=H, orient='port', dur=round(total, 3), shots=shots, caps=[c for c in caps if c['t0'] < last[0] - 0.01], labels=labels_fn(st), notes=(notes_fn(st) if notes_fn else []) + [{'t0': last[0], 't1': total, 'text': 'Drop your thoughts below', 'y': 1060}],
                ctas=ctas, pills=[{'t0': (pill_at(st) if pill_at else st[len(seq) // 2][0] + 0.5), 'dur': 2.4}] if total > 25 else [], hook=hook, header_from=st[1][0], end=[], voice=[(k, i, round(t0, 3)) for (k, i, t0, t1) in lay])

HOOK = lambda sub, part=None: [(0.0, 'GTA 6 drops TOMORROW.', ['GTA', '6', 'TOMORROW'], 96), (2.1, sub, ['CALGARY', 'CALGARY\'S', 'CALGARY?'], 80)] + ([(3.4, part, ['PART', '1', '2', '3', '·'], 62)] if part else [])
def lab(st, j, k, title, dur=5.0, dt=0.2): return {'t0': st[j][0] + dt, 'dur': dur, 'k': k, 'title': title}
NOTE_ST = lambda a, b: {'t0': a, 't1': b, 'text': 'Re-created in the game · not affiliated with the Calgary Stampede'}

def teaser():
    seq = [('t', i) for i in range(5)]
    plan = [[S('skyline', 1.0, a=.55, b=.7), S('fireworks', 1.0, a=.3, b=.45), S('ctrain', 1.0, a=.5, b=.65), S('midway', 1.4, a=.3, b=.5)],
            [S('skyline', 3.2, a=0, b=.5), S('homes', 2.2, a=.3, b=.8), S('cityhall', 2.0, a=.2, b=.8)],
            [S('fireworks', 2.0, a=0, b=.5), S('ctrain', 2.0, a=.3, b=.8), S('r311', 2.4, a=.5, b=.8)],
            [S('chars', 2.6, a=.0, b=.6), S('langs', 2.6, a=.4, b=1)],
            [S('skyline', 6.5, a=.4, b=1)]]
    labs = lambda st: [lab(st, 1, 'Free game', 'The real map of Calgary', 4.5), lab(st, 2, 'Stampede · CTrain · 311', 'Real routes, real 311 data', 4.5), lab(st, 3, 'Five characters · six languages', 'Twenty-seven missions', 4.3)]
    notes = lambda st: [NOTE_ST(st[2][0], st[2][0] + 2.2), {'t0': st[1][0], 't1': st[1][1], 'text': 'Not affiliated with Rockstar Games or the City of Calgary'}]
    return vertical('teaser', seq, plan, labs, 'Which Calgary spot should we add next?', notes, HOOK('But you can explore CALGARY today.'), pill_at=lambda st: st[1][0] + 2.6)

def part1():
    seq = [('p', 0), ('f', 3), ('f', 4), ('f', 5), ('f', 7), ('f', 8), ('p', 1)]
    plan = [[S('skyline', 1.1, a=.55, b=.7), S('tower', 1.1, a=.6, b=.75), S('river', 1.1, a=.3, b=.45), S('cityhall', 1.2, a=.3, b=.5), S('skyline', 2.0, a=.7, b=.9)],
            [S('skyline', 6.0, a=0, b=.55), S('river', 4.0, a=0, b=.6)],
            [S('homes', 6.6)],
            [S('cityhall', 5.4), S('tower', 5.4), S('skyline', 4.0, a=.5, b=1)],
            [S('midway', 5.6), S('fireworks', 5.0)],
            [S('saddledome', 8.0)],
            [S('river', 8.6)]]
    labs = lambda st: [lab(st, 1, 'The real map', 'OpenStreetMap + City of Calgary open data', 6), lab(st, 2, 'Real homes', 'Real footprints and heights'),
                       {'t0': st[3][0] + 0.3, 'dur': 5.0, 'k': 'Landmark', 'title': 'Historic City Hall'}, {'t0': st[3][0] + 5.8, 'dur': 4.8, 'k': 'Landmark', 'title': 'Calgary Tower'},
                       lab(st, 4, 'Stampede Park', 'Midway · Grandstand Show · fireworks', 6), lab(st, 5, 'Music', 'Under One Sky, the game\'s title song', 6)]
    notes = lambda st: [NOTE_ST(st[4][0], st[5][1]), {'t0': st[1][0], 't1': st[1][1], 'text': 'Not affiliated with Rockstar Games or the City of Calgary'}]
    return vertical('part1', seq, plan, labs, 'Which landmark would you visit first?', notes, HOOK('Explore CALGARY\'S real map today.', 'PART 1 · THE CITY'))

def part2():
    seq = [('p', 2), ('f', 9), ('f', 10), ('f', 11), ('f', 12), ('p', 3)]
    plan = [[S('ctrain', 1.2, a=.5, b=.65), S('bus', 1.1, a=.3, b=.5), S('r311', 1.2, a=.2, b=.35), S('ctrain', 3.5, a=.65, b=1)],
            [S('bus', 2.4, a=0, b=.3), S('bus', 5.0, a=.3, b=1)],
            [S('ctrain', 6.7)],
            [S('r311', 4.5, a=0, b=.4)],
            [S('r311', 6.5, a=.4, b=.58), S('r311', 6.5, a=.58, b=1, z0=1.0, z1=1.12)],
            [S('river', 8.6)]]
    labs = lambda st: [lab(st, 1, 'Calgary Transit', 'Real routes and stops', 6), lab(st, 2, 'Ride the CTrain', 'Red Line and Blue Line'), lab(st, 3, 'Real 311 requests', 'From the City\'s open data', 7)]
    notes = lambda st: [{'t0': st[1][0], 't1': st[4][1], 'text': 'Not affiliated with the City of Calgary or Rockstar Games'}]
    return vertical('part2', seq, plan, labs, 'Have you ever made a 311 request?', notes, HOOK('Real transit and 311 in a free CALGARY game.', 'PART 2 · GETTING AROUND'))

def part3():
    seq = [('p', 4), ('f', 14), ('f', 15), ('f', 16), ('f', 18), ('p', 5)]
    plan = [[S('natalia', 1.1, a=.2, b=.3), S('chars', 1.2, a=.3, b=.36), S('card', 1.2, a=.3, b=.5), S('langs', 2.5, a=.7, b=.9)],
            [S('chars', 3.7, a=.0, b=.19), S('chars', 4.0, a=.2, b=.39), S('chars', 3.4, a=.4, b=.59), S('chars', 3.6, a=.6, b=.79), S('chars', 4.7, a=.8, b=1)],
            [S('card', 5.5, a=.2, b=1), S('natalia', 5.2, a=0, b=.45)],
            [S('card', 4.5, a=0, b=.6), S('natalia', 4.9, a=.55, b=1)],
            [S('langs', 7.9)],
            [S('chars', 6.6, a=.8, b=1)]]
    labs = lambda st: [lab(st, 1, 'Five characters', 'Ali · Natalia · Chris · Jean · Leo', 7), lab(st, 2, 'Twenty-seven missions', 'Learn how the city works', 6),
                       lab(st, 3, 'Missions teach', 'Carts · snow · Health Link 811 · scams', 6), lab(st, 4, 'Six languages', 'English · French · Punjabi · Urdu · Tagalog · Arabic', 7)]
    notes = lambda st: [{'t0': st[1][0], 't1': st[1][1], 'text': 'Not affiliated with Rockstar Games or the City of Calgary'}]
    return vertical('part3', seq, plan, labs, 'Which character would you play first?', notes, HOOK('This free CALGARY game has stories of its own.', 'PART 3 · THE STORIES'))

if __name__ == '__main__':
    out = {'full_land': full('land'), 'teaser': teaser(), 'part1': part1(), 'part2': part2(), 'part3': part3()}
    for k, v in out.items():
        json.dump(v, open(f'/home/claude/gta6/spec_{k}.json', 'w'), indent=0)
        print(k, v['dur'], len(v['shots']))
