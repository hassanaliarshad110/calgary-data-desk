#!/usr/bin/env python3
"""Author original Lottie (Bodymovin 5.7) animations from code. Shape layers only (no fonts needed), so they
play in lottie-web, LottieFiles, After Effects (via Bodymovin import), Android/iOS Lottie players.
  python3 make_lottie.py <outdir>"""
import json, os, sys, math
FR, W, H = 30, 512, 512
EO, EI = {'x': [0.33], 'y': [0]}, {'x': [0.67], 'y': [1]}         # ease in-out
BO, BI = {'x': [0.34], 'y': [1.56]}, {'x': [0.64], 'y': [1]}       # back-out overshoot


def kf(pairs, ease=(EO, EI)):
    """pairs: [(frame, value), ...] -> animated property"""
    if len(pairs) == 1: return {'a': 0, 'k': pairs[0][1]}
    out = []
    for i, (t, v) in enumerate(pairs):
        k = {'t': t, 's': v if isinstance(v, list) else [v]}
        if i < len(pairs) - 1: k['o'], k['i'] = ease[0], ease[1]
        out.append(k)
    return {'a': 1, 'k': out}
def st(v): return {'a': 0, 'k': v}
def col(h, a=1): h = h.lstrip('#'); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [a]
def tr(p=(0, 0), s=(100, 100), r=0, o=100, a=(0, 0)):
    return {'ty': 'tr', 'p': p if isinstance(p, dict) else st(list(p)), 'a': st(list(a)), 's': s if isinstance(s, dict) else st(list(s)),
            'r': r if isinstance(r, dict) else st(r), 'o': o if isinstance(o, dict) else st(o), 'sk': st(0), 'sa': st(0)}
def ks(p=(256, 256), s=(100, 100), r=0, o=100, a=(0, 0, 0)):
    f = lambda v: v if isinstance(v, dict) else st(list(v) if isinstance(v, (list, tuple)) else v)
    return {'o': f(o), 'r': f(r), 'p': f(list(p) + [0] if isinstance(p, tuple) else p), 'a': st(list(a)), 's': f(list(s) + [100] if isinstance(s, tuple) else s)}
def rect(w, h, r=0, p=(0, 0)): return {'ty': 'rc', 'd': 1, 's': w if isinstance(w, dict) else st([w, h]), 'p': p if isinstance(p, dict) else st(list(p)), 'r': st(r)}
def ellipse(w, h=None, p=(0, 0)): return {'ty': 'el', 'd': 1, 's': w if isinstance(w, dict) else st([w, h or w]), 'p': st(list(p))}
def path(pts, closed=True, smooth=False):
    n = len(pts); ii, oo = [[0, 0]] * n, [[0, 0]] * n
    return {'ty': 'sh', 'd': 1, 'ks': st({'c': closed, 'v': [list(p) for p in pts], 'i': ii, 'o': oo})}
def fill(c, o=100): return {'ty': 'fl', 'c': st(col(c)), 'o': o if isinstance(o, dict) else st(o), 'r': 1}
def stroke(c, w, o=100): return {'ty': 'st', 'c': st(col(c)), 'o': o if isinstance(o, dict) else st(o), 'w': w if isinstance(w, dict) else st(w), 'lc': 2, 'lj': 2, 'ml': 4}
def trim(e): return {'ty': 'tm', 's': st(0), 'e': e, 'o': st(0), 'm': 1}
def group(items, t=None, nm='g'): return {'ty': 'gr', 'nm': nm, 'it': items + [t or tr()]}
def layer(nm, shapes, k=None, ip=0, op=None, ind=1): return {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': nm, 'sr': 1, 'ks': k or ks(), 'ao': 0, 'shapes': shapes, 'ip': ip, 'op': op, 'st': 0, 'bm': 0}
def anim(nm, layers, op, w=W, h=H):
    for i, L in enumerate(layers): L['ind'] = i + 1; L['op'] = L['op'] or op
    return {'v': '5.7.4', 'fr': FR, 'ip': 0, 'op': op, 'w': w, 'h': h, 'nm': nm, 'ddd': 0, 'assets': [], 'layers': layers, 'meta': {'g': 'STUDIO make_lottie.py', 'a': 'Original work - Hassan Ali studio library'}}

LIB = {}
# 1 map ping: dot + two expanding rings (loop)
LIB['map_ping'] = anim('map_ping', [
    layer('dot', [group([ellipse(60), fill('#c8102e')])]),
    *[layer(f'ring{i}', [group([ellipse(kf([(0, [40, 40]), (45, [380, 380])], (EO, EI))), stroke('#c8102e', kf([(0, 10), (45, 1)]), kf([(0, 100), (45, 0)]))])], k=ks(), ip=i * 22, op=i * 22 + 46) for i in range(3)],
], 66)
# 2 loading dots
LIB['loading_dots'] = anim('loading_dots', [layer(f'd{i}', [group([ellipse(56), fill('#f2b705')])], k=ks(p=kf([(i * 6, [136 + i * 120, 256, 0]), (i * 6 + 12, [136 + i * 120, 196, 0]), (i * 6 + 24, [136 + i * 120, 256, 0])]))) for i in range(3)], 42)
# 3 checkmark draw-on (trim path) with circle
LIB['check_draw'] = anim('check_draw', [
    layer('circle', [group([ellipse(360), stroke('#2a9d8f', 22), trim(kf([(0, 0), (18, 100)]))])]),
    layer('tick', [group([path([(-90, 0), (-25, 65), (100, -70)], closed=False), stroke('#2a9d8f', 26), trim(kf([(14, 0), (30, 100)]))])]),
], 50)
# 4 pin drop with bounce + shadow
pin_pts = [(0, 90), (-60, -10), (-62, -60), (-35, -100), (0, -112), (35, -100), (62, -60), (60, -10)]
LIB['pin_drop'] = anim('pin_drop', [
    layer('shadow', [group([ellipse(110, 26), fill('#000000', 30)])], k=ks(p=(256, 440), s=kf([(0, [30, 30, 100]), (14, [100, 100, 100]), (20, [120, 80, 100]), (28, [100, 100, 100])]))),
    layer('pin', [group([ellipse(56, 56, (0, -55)), fill('#ffffff')]), group([path(pin_pts), fill('#c8102e')])],
          k=ks(p=kf([(0, [256, 40, 0]), (14, [256, 350, 0]), (20, [256, 320, 0]), (26, [256, 350, 0])]), s=kf([(14, [100, 100, 100]), (17, [115, 85, 100]), (22, [100, 100, 100])]))),
], 45)
# 5 growing bar chart
LIB['bars_grow'] = anim('bars_grow', [layer(f'b{i}', [group([rect(80, kf([(i * 5, [80, 0]), (i * 5 + 22, [80, h])], (BO, BI)) and 80, 0), fill(c)])]) for i, (h, c) in enumerate([])] or [
    layer(f'b{i}', [group([rect(kf([(i * 5, [80, 2]), (i * 5 + 22, [80, h])], (BO, BI)), 0, 0, kf([(i * 5, [0, -1]), (i * 5 + 22, [0, -h / 2])], (BO, BI))), fill(c)])], k=ks(p=(116 + i * 140, 430)))
    for i, (h, c) in enumerate([(140, '#4cc9f0'), (230, '#f2b705'), (320, '#e76f51')])], 50)
# 6 news lower-third background: red bar + white bar wipe, then hold
LIB['lower_third_bg'] = anim('lower_third_bg', [
    layer('white', [group([rect(kf([(6, [0, 90]), (20, [900, 90])]), 0, 0, kf([(6, [-450, 0]), (20, [0, 0])])), fill('#ffffff')])], k=ks(p=(480, 230))),
    layer('navy', [group([rect(kf([(10, [0, 60]), (24, [900, 60])]), 0, 0, kf([(10, [-450, 0]), (24, [0, 0])])), fill('#06132b')])], k=ks(p=(480, 305))),
    layer('red', [group([rect(18, kf([(0, [18, 0]), (8, [18, 150])]), 0), fill('#c8102e')])], k=ks(p=(36, 262))),
], 90, w=960, h=400)
# 7 breaking banner: slanted red block slides in with stripes sweeping
LIB['breaking_banner'] = anim('breaking_banner', [
    *[layer(f'stripe{i}', [group([path([(-20, -60), (20, -60), (0, 60), (-40, 60)]), fill('#ffffff', 22)])], k=ks(p=kf([(0, [-100 + i * 160, 100, 0]), (60, [300 + i * 160, 100, 0])], ({'x': [0], 'y': [0]}, {'x': [1], 'y': [1]})))) for i in range(7)],
    layer('bar', [group([rect(kf([(0, [0, 120]), (12, [1080, 120])]), 0, 0, kf([(0, [-540, 0]), (12, [0, 0])])), fill('#c8102e')])], k=ks(p=(540, 100))),
], 60, w=1080, h=200)
# 8 bouncing arrow (call to action / "look here")
LIB['arrow_bounce'] = anim('arrow_bounce', [layer('arrow', [group([path([(0, 120), (-90, 10), (-35, 10), (-35, -110), (35, -110), (35, 10), (90, 10)]), fill('#f2b705'), stroke('#0b1f3a', 10)])], k=ks(p=kf([(0, [256, 230, 0]), (15, [256, 290, 0]), (30, [256, 230, 0])])))], 30)
# 9 cartoon star burst (impact)
burst = [(math.cos(i / 16 * 2 * math.pi) * (200 if i % 2 == 0 else 110), math.sin(i / 16 * 2 * math.pi) * (200 if i % 2 == 0 else 110)) for i in range(16)]
LIB['impact_burst'] = anim('impact_burst', [layer('burst', [group([path(burst), fill('#ffd166'), stroke('#2a1c14', 12)])], k=ks(s=kf([(0, [0, 0, 100]), (6, [120, 120, 100]), (10, [95, 95, 100]), (14, [100, 100, 100]), (22, [100, 100, 100]), (28, [0, 0, 100])]), r=kf([(0, -20), (28, 15)]))),
                                             layer('core', [group([ellipse(140), fill('#e63946')])], k=ks(s=kf([(2, [0, 0, 100]), (8, [110, 110, 100]), (12, [100, 100, 100]), (22, [100, 100, 100]), (28, [0, 0, 100])])))], 30)
# 10 speech bubble pop
LIB['speech_bubble'] = anim('speech_bubble', [layer('bubble', [*[group([ellipse(36), fill('#2a1c14')], tr(p=(x, 0))) for x in (-80, 0, 80)], group([ellipse(380, 250), fill('#ffffff'), stroke('#2a1c14', 12)]),
                                                               group([path([(-40, 100), (-110, 200), (20, 110)]), fill('#ffffff'), stroke('#2a1c14', 12)])],
                                               k=ks(p=(256, 220), s=kf([(0, [0, 0, 100]), (8, [112, 112, 100]), (13, [100, 100, 100])], (BO, BI))))], 60)
# 11 heartbeat
heart = [(0, 120), (-150, -10), (-130, -110), (-60, -140), (0, -80), (60, -140), (130, -110), (150, -10)]
LIB['heart_beat'] = anim('heart_beat', [layer('heart', [group([path(heart), fill('#e63946'), stroke('#2a1c14', 10)])], k=ks(s=kf([(0, [100, 100, 100]), (6, [120, 120, 100]), (12, [100, 100, 100]), (18, [112, 112, 100]), (26, [100, 100, 100])])))], 40)
# 12 spinner arc
LIB['spinner_arc'] = anim('spinner_arc', [layer('arc', [group([ellipse(300), stroke('#4cc9f0', 28), {'ty': 'tm', 's': kf([(10, 0), (40, 100)]), 'e': kf([(0, 0), (30, 100)]), 'o': st(0), 'm': 1}])], k=ks(r=kf([(0, 0), (40, 360)], ({'x': [0], 'y': [0]}, {'x': [1], 'y': [1]}))))], 40)
# 13 counter ticks (rising line graph draw-on) for data stories
LIB['line_draw'] = anim('line_draw', [layer('axis', [group([path([(-200, -150), (-200, 150), (210, 150)], closed=False), stroke('#b8c4d6', 6)])]),
                                     layer('line', [group([path([(-200, 120), (-120, 60), (-40, 80), (40, 0), (120, -40), (200, -130)], closed=False), stroke('#f2b705', 14), trim(kf([(0, 0), (40, 100)]))])])], 60)
# 14 sun / weather icon spin (news weather)
rays = [group([rect(16, 70, 8, (0, -150)), fill('#ffd166')], tr(r=i * 45)) for i in range(8)]
LIB['weather_sun'] = anim('weather_sun', [layer('rays', rays, k=ks(r=kf([(0, 0), (90, 90)], ({'x': [0], 'y': [0]}, {'x': [1], 'y': [1]})))), layer('sun', [group([ellipse(190), fill('#ffb703')])], k=ks(s=kf([(0, [100, 100, 100]), (45, [106, 106, 100]), (90, [100, 100, 100])])))], 90)
# 15 snowflake fall (news weather)
LIB['weather_snow'] = anim('weather_snow', [layer('cloud', [group([ellipse(200, 140, (-60, 0)), ellipse(220, 180, (40, -30)), ellipse(180, 130, (120, 10)), fill('#dfe7f2'), stroke('#8aa6c8', 6)])], k=ks(p=(256, 170))),
                                            *[layer(f'f{i}', [group([ellipse(26), fill('#ffffff'), stroke('#8aa6c8', 4)])], k=ks(p=kf([(i * 10, [170 + i * 45, 230, 0]), (i * 10 + 40, [170 + i * 45 + (15 if i % 2 else -15), 470, 0])], ({'x': [0], 'y': [0]}, {'x': [1], 'y': [1]}))), ip=i * 10, op=i * 10 + 40) for i in range(5)]], 90)

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, v in LIB.items():
        json.dump(v, open(os.path.join(out, k + '.json'), 'w'), separators=(',', ':')); print(k, v['op'], 'frames', f"{v['w']}x{v['h']}")
