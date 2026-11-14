import sys, json, wave, numpy as np
TL = json.load(open('timeline.json')); DUR = TL['total'] + .4
sys.argv = ['x', str(DUR)]
import musiclib as M
from musiclib import *
S = {s['id']: s['start'] for s in TL['scenes']}; D = {s['id']: s['dur'] for s in TL['scenes']}
Lb = TL['lines']; LA = lambda i: Lb[i]['abs']; LE = lambda i: Lb[i]['abs'] + Lb[i]['d']
bar = 8 * E
def groove(t0, t1, g=.8, chords=('D', 'A', 'G', 'D'), mel=True, mg=.5):
    n = int((t1 - t0) / bar)
    if n <= 0: return
    kaharwa(t0, n, g)
    for i in range(n): chord(chords[i % 4], t0 + i * bar, bar * .98, .5)
    if mel: theme(t0, mg, n)

# --- hook: tension pad, electric danger, rewind
h = S['hook']
put(harmonium([hz(-24), hz(-17), hz(-12)], 4.6, .9, att=.8), h)
for n, d, t in [(7, .7, .9), (3, .6, 1.7), (2, .6, 2.4), (0, 1.2, 3.1)]: put(bansuri(hz(n + 12), d, .8, vib=1.5), h + t)
for k in range(10): put(ghe(.45 + .05 * k, 1.6), h + .2 + k * .45)
rw = LE('n1') + .3
for k in range(14): put(na(.3 + .04 * k, 600 + 40 * k), rw + k * .1)
# --- intro: warm winter-sun comedy groove with the theme
put(boom(.6), S['intro']); put(cymbal(.6, 1.6), S['intro'])
groove(S['intro'] + .3, S['tease'] + 1.0, .65, mel=True, mg=.45)
# --- tease: sneaky plucks for the monkey, sting on Dadi's warning, chaos on the snatch, sad slide
t0 = S['tease']
for k in range(16): put(pluck(hz([0, 3, 5, 3, 7, 5, 3, 0][k % 8]), .25, .55), t0 + 1.0 + k * .2)
put(harmonium([hz(-13), hz(-9), hz(-6)], 1.0, .9, att=.02), LA('i2') + .1)
sT = LE('i2') + .72
put(boom(.8), sT); put(cymbal(.7, 1.4), sT)
for k in range(10): put(na(.5, 700 + 50 * k), LE('i2') + .05 + k * .07)
for n, dd, t in [(4, .5, 0), (2, .5, .5), (0, .5, 1.0), (-1, 1.2, 1.5)]: put(bansuri(hz(n + 12), dd, .55, vib=2), LA('i3') + .3 + t)
# --- home: running tabla, catchphrase sting, sneaky plucks for Sakina
for k in range(int(1.8 / (E / 2))): put(na(.45, 560 + 60 * (k % 4)), S['home'] + k * E / 2)
put(bansuri(hz(14), .14, .6), LA('a1') + .05); put(bansuri(hz(9), .35, .6, f_from=hz(14)), LA('a1') + .19)
for k in range(6): put(pluck(hz([0, 3, 5, 7, 10, 12][k]), .25, .6), LA('k1') + k * .18)
# --- chase: fast chase dholak, then danger drone at the pole
c0 = S['chase']
chaal(c0 + .1, int(4.6 / bar) + 1, .7)
put(harmonium([hz(-24), hz(-23)], D['chase'] - 4.0, .8, att=1.0), c0 + 4.0)
t = c0 + 4.6; step = .55
while t < S['power'] - .2:
    put(ghe(.5 + .3 * (t - c0) / D['chase'], 1.1), t); step = max(.18, step * .93); t += step
for k in range(12): put(pluck(hz([0, 1, 0, -1][k % 4] - 12), .3, .6), c0 + 4.8 + k * .45)
# --- power: roll + rising harmonium, hit on the door burst
p0 = S['power']; q3 = LA('q3')
t = p0 + .6; step = E
while t < q3 - .5:
    put(na(.25 + .5 * (t - p0) / (q3 - p0), 560 + 180 * (t - p0) / (q3 - p0)), t); step = max(E / 4, step * .95); t += step
for i in range(9): put(harmonium([hz(i - 12), hz(i - 5)], .5, .25 + .06 * i, att=.05), p0 + .8 + i * (q3 - p0 - 1.4) / 9)
put(boom(1.0), q3 - .45); put(cymbal(1.0, 2.6), q3 - .45)
put(harmonium([hz(-12), hz(-8), hz(-5), hz(0), hz(4), hz(7)], 1.6, 1.4, att=.02), q3 - .45)
chaal(q3 + .2, int((S['rescue'] - q3 - .2) / bar) + 1, .85)
# --- rescue: heroic flight, gentle trade, slow-mo pad on the zap, hit on "bach gaya", happy groove
r0 = S['rescue']; zapT = LE('q5') + 1.25; land = LA('l2') - .15
for n, dd, t in [(0, .3, 0), (7, .3, .35), (12, .7, .7), (14, .3, 1.1)]: put(bansuri(hz(n + 12), dd, .9), r0 + t)
chaal(r0 + .2, 1, .7)
put(harmonium([hz(-12), hz(-8), hz(-5)], LE('q5') - LA('q5') + 1.0, .5, att=.4), LA('q5'))
put(harmonium([hz(-12), hz(-5), hz(3)], 1.2, .9, att=.05), zapT)
put(boom(1.0), land); put(cymbal(.9, 2.0), land)
put(harmonium([hz(-12), hz(-8), hz(-5), hz(0), hz(4), hz(7)], 1.4, 1.2, att=.02), land)
groove(land + .6, S['lesson'] + .4, .6, chords=('D', 'G', 'A', 'D'), mel=True, mg=.45)
# --- lesson: dreamy blur pad, sparkle on the glasses, groove, tender bansuri on Zahra Miss's lesson
put(harmonium([hz(-12), hz(-5), hz(0)], 2.0, .5, att=.6), S['lesson'] + .4)
groove(LA('s2') - .3, LA('z4'), .5, mel=False)
put(harmonium([hz(-12), hz(-9), hz(-5)], 4.5, .6, att=.4), LA('z4'))
for n, dd, t in [(9, .5, .1), (7, .5, .7), (5, .6, 1.3), (4, 1.0, 1.9), (2, .6, 3.0), (4, 1.0, 3.6)]: put(bansuri(hz(n + 12), dd, .6, vib=1.5), LA('z4') + t)
groove(LE('z4') + .1, S['tv'] - .1, .55, mel=True, mg=.5)
# --- tv: news jingle, mystery plucks, sneaky wink
tv0 = S['tv']
for k, n in enumerate([0, 4, 7, 12, 7]): put(pluck(hz(n), .25, .8, bright=.8), tv0 + .05 + k * .12)
put(boom(.5), tv0 + .7)
put(harmonium([hz(-12), hz(-9), hz(-5)], LE('v2') - tv0 - .5, .45, att=.5), tv0 + .8)
for k in range(6): put(pluck(hz([0, 3, 5, 7, 10, 12][k]), .25, .6), LE('d1') - .2 + k * .18)
# --- ending: catchphrase sting, sneaky plucks, groove
put(harmonium([hz(-11), hz(-7)], .9, .9, att=.02), LA('a2') + .5)
for k in range(6): put(pluck(hz([0, 3, 5, 7, 10, 12][k]), .25, .6), LA('k2') + k * .2)
groove(LE('q6') + .2, S['endcard'] - .1, .55, mel=False)
# --- endcard: theme + final hit
e0 = S['endcard']; nb = int((D['endcard'] - 1.6) / bar)
kaharwa(e0, nb, .75, fill_last=False)
for i in range(nb): chord(('D', 'A', 'G', 'D')[i % 4], e0 + i * bar, bar * .98, .55)
theme(e0, .6, nb)
fin = e0 + nb * bar
put(ghe(1.0), fin); put(na(1.0), fin); put(cymbal(.7, 1.8), fin)
put(harmonium([hz(-12), hz(-5), hz(0), hz(4), hz(7)], 1.4, 1.0, att=.02), fin); put(bansuri(hz(12), 1.2, .8), fin)
N = M.N; m = M.out[:N].copy()
fade = np.clip((DUR - np.arange(N) / SR) / 1.0, 0, 1); m *= fade
m = np.tanh(m * 1.4) / np.tanh(1.4); m /= np.abs(m).max() / .9
mus = m.astype(np.float32)

# ---------------- SFX ----------------
rng = np.random.default_rng(5)
sfx = np.zeros(N, np.float32); voice = np.zeros(N, np.float32)
def P(buf, a, t, g=1.0):
    i = int(t * SR); a = np.asarray(a, np.float32)[:max(0, N - i)]; buf[i:i + len(a)] += a * g
def rd(f):
    w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
def whoosh(d=.45): n = rng.standard_normal(int(d * SR)).astype(np.float32); x = tt(d); return onepole(n, .08) * np.sin(np.pi * x / d) ** 2 * 1.4
def thump(f=70, d=.5, g=1): x = tt(d); return np.sin(2 * np.pi * (f * x + f * 2 * (1 - np.exp(-x * 20)) / 20)) * np.exp(-x * 8) * g
def pop(f=900, d=.12): x = tt(d); return np.sin(2 * np.pi * f * x * (1 + 3 * x)) * np.exp(-x * 35)
def ding(f=1320, d=.8): x = tt(d); return (np.sin(2 * np.pi * f * x) + .5 * np.sin(2 * np.pi * f * 2.01 * x)) * np.exp(-x * 5) * .5
def sweep(f0, f1, d, g=.25):
    x = tt(d); f = f0 * (f1 / f0) ** (x / d); ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sin(ph) + .3 * np.sin(2 * ph)) * g * np.clip(x / .05, 0, 1) * np.clip((d - x) / .05, 0, 1)
def sparkle(d=.7):
    o = np.zeros(int(d * SR), np.float32)
    for i in range(7): s = ding(1500 + i * 230, .35) * .5; j = int(i * .07 * SR); o[j:j + len(s)] += s[:len(o) - j]
    return o
def flush(d=1.8):
    n = rng.standard_normal(int(d * SR)).astype(np.float32); x = tt(d)
    return onepole(n, .05) * (1 + .6 * np.sin(2 * np.pi * 7 * x)) * np.clip(x / .08, 0, 1) * np.exp(-x * 1.3) * 2.2 + np.sin(2 * np.pi * (180 + 80 * np.sin(2 * np.pi * 11 * x)) * x) * np.exp(-x * 2) * .15
def formant_voice(f0, d, F1, F2, g=1.0):
    x = tt(d); f = f0(x) if callable(f0) else np.full_like(x, f0); ph = 2 * np.pi * np.cumsum(f) / SR; s = np.zeros_like(x)
    for n in range(1, 16):
        fn = n * f; a = np.exp(-((fn - F1(x)) / 260) ** 2) + .7 * np.exp(-((fn - F2(x)) / 400) ** 2) + .05
        s += a * np.sin(n * ph)
    return s * g
def meow(d=.6, base=620):
    x0 = lambda x: base * (1 + .45 * np.sin(np.pi * np.clip(x / d, 0, 1)) - .25 * x / d)
    s = formant_voice(x0, d, lambda x: 1100 - 500 * x / d, lambda x: 2600 - 1300 * x / d)
    x = tt(d); return s * np.clip(x / .04, 0, 1) * np.clip((d - x) / .12, 0, 1) * .12
def bark():
    d = .17; x = tt(d); s = formant_voice(lambda x: 330 - 300 * x, d, lambda x: 900 + 0 * x, lambda x: 1700 + 0 * x)
    n = onepole(rng.standard_normal(len(x)), .3) * .5
    return (s * .1 + n * .3) * np.exp(-x * 12) * np.clip(x / .01, 0, 1)
def crack(n=4, sp=.05):
    o = np.zeros(int((n * sp + .2) * SR), np.float32)
    for i in range(n):
        c = rng.standard_normal(int(.03 * SR)); c = c - onepole(c, .3); c *= np.exp(-tt(.03) * 120); j = int(i * sp * SR * (1 + .3 * rng.random())); o[j:j + len(c)] += c[:len(o) - j] * .9
    return o
def thwack():
    x = tt(.25); return (np.sin(2 * np.pi * 900 * x) * .5 + np.sin(2 * np.pi * 1450 * x) * .4) * np.exp(-x * 40) + onepole(rng.standard_normal(len(x)), .5) * np.exp(-x * 60) * .6
def tuk(): x = tt(.12); return np.sin(2 * np.pi * 700 * x) * np.exp(-x * 60) * .7
def cheer(d=2.2):
    n = rng.standard_normal(int(d * SR)); x = tt(d); b = onepole(n, .25) - onepole(n, .03)
    env = np.clip(x / .15, 0, 1) * np.exp(-x * .9) * (1 + .3 * np.sin(2 * np.pi * 6 * x)); o = b * env * 1.2
    for k in range(6): j = int(rng.uniform(0, d - .5) * SR); v = formant_voice(lambda xx, f=rng.uniform(380, 600): f * (1 + .2 * xx), .35, lambda xx: 800 + 0 * xx, lambda xx: 1300 + 0 * xx) * .05 * np.exp(-tt(.35) * 3); o[j:j + len(v)] += v
    return o
def steps(t0, n, sp=.14, g=.25):
    for i in range(n): P(sfx, thump(150, .08, 1) * .6, t0 + i * sp, g); P(sfx, pop(400, .04) * .2, t0 + i * sp, g)
def boing(): return sweep(180, 520, .35, .3) * (1 + .5 * np.sin(2 * np.pi * 30 * tt(.35)))
def scratch(): x = tt(.4); n = onepole(rng.standard_normal(len(x)), .4); return n * np.abs(np.sin(2 * np.pi * (6 + 20 * x) * x)) * .8 * np.exp(-x * 3)
def rewind(d=1.6):
    x = tt(d); f = 900 + 600 * np.sin(2 * np.pi * 9 * x); return np.sin(2 * np.pi * np.cumsum(f) / SR) * .08 + whoosh(d) * .5
def coo(d=.9, f=190):   # pigeon "gutur-goo": three soft throaty syllables
    o = np.zeros(int(d * SR), np.float32)
    for j, (st, ln, ff) in enumerate([(0, .18, f * 1.1), (.22, .2, f * .95), (.46, .4, f)]):
        s = formant_voice(lambda x, ff=ff: ff * (1 - .15 * x / ln), ln, lambda x: 420 + 0 * x, lambda x: 900 + 0 * x) * .12
        x = tt(ln); s = s * np.sin(np.pi * np.clip(x / ln, 0, 1)) ** 1.5; i = int(st * SR); o[i:i + len(s)] += s[:len(o) - i]
    return o
def flap(n=6, sp=.07, g=1.0):
    o = np.zeros(int((n * sp + .2) * SR), np.float32)
    for i in range(n): w = whoosh(.06) * .8; j = int(i * sp * SR); o[j:j + len(w)] += w[:len(o) - j]
    return o * g
def slide(f0=500, f1=1400, d=.6): return sweep(f0, f1, d, .18)
for lid, l in Lb.items():
    a = rd(f'aud/{lid}.wav'); a = a / (np.abs(a).max() + 1e-6) * .85; P(voice, a, l['abs'])
def bell(n=3, sp=.16, f=2100):
    o = np.zeros(int((n * sp + .9) * SR), np.float32)
    for i in range(n):
        x = tt(.8); b = (np.sin(2 * np.pi * f * x) + .6 * np.sin(2 * np.pi * f * 2.76 * x) + .3 * np.sin(2 * np.pi * f * 5.4 * x)) * np.exp(-x * 6) * .4; j = int(i * sp * SR); o[j:j + len(b)] += b[:len(o) - j]
    return o
def rumble(d, g=1.0, rate=9.0):   # cart wheels on bricks: low noise + clacks
    n = rng.standard_normal(int(d * SR)).astype(np.float32); x = tt(d); o = onepole(onepole(n, .04), .05) * 4
    for k in range(int(d * rate)):
        j = int(rng.uniform(0, d - .05) * SR); c = thump(160 + 80 * rng.random(), .05) * .5; o[j:j + len(c)] += c[:len(o) - j]
    return o * g
def rattle(d, g=1.0):
    o = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 14)):
        j = int(rng.uniform(0, d - .05) * SR); c = (np.sin(2 * np.pi * (700 + 500 * rng.random()) * tt(.04)) * np.exp(-tt(.04) * 80)) * .5; o[j:j + len(c)] += c[:len(o) - j]
    return o * g
def skid(d=2.4):
    n = rng.standard_normal(int(d * SR)).astype(np.float32); x = tt(d); b = n - onepole(n, .15)
    return onepole(b, .6) * (1 + .4 * np.sin(2 * np.pi * 23 * x)) * np.clip(x / .1, 0, 1) * np.exp(-x * .6) * 1.1
def whistle(d=.9):
    x = tt(d); f = 2600 + 120 * np.sign(np.sin(2 * np.pi * 28 * x)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * .22 * np.clip(x / .03, 0, 1) * np.clip((d - x) / .08, 0, 1) + onepole(rng.standard_normal(len(x)), .5) * .04
def birds(d, g=1.0):
    o = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 1.6)):
        j = int(rng.uniform(0, max(.01, d - .4)) * SR); f0 = rng.uniform(2800, 4200); s = sweep(f0, f0 * rng.uniform(.7, 1.3), .12, .06); o[j:j + len(s)] += s[:len(o) - j]
    return o * g
def street(d, g=1.0):
    n = rng.standard_normal(int(d * SR)).astype(np.float32); return onepole(onepole(n, .01), .02) * 2.5 * g
def honk(d=.35): x = tt(d); return (np.sign(np.sin(2 * np.pi * 410 * x)) * .5 + np.sign(np.sin(2 * np.pi * 520 * x)) * .5) * .08 * np.clip((d - x) / .04, 0, 1)
def screech(d=.5, f=900):   # monkey "khiii!": rising-falling bright formant cry
    s = formant_voice(lambda x: f * (1 + .7 * np.sin(np.pi * np.clip(x / d, 0, 1))), d, lambda x: 1500 + 0 * x, lambda x: 3000 + 0 * x)
    x = tt(d); return s * np.clip(x / .02, 0, 1) * np.clip((d - x) / .1, 0, 1) * .14 * (1 + .3 * np.sin(2 * np.pi * 40 * x))
def chatter(n=5, sp=.11, f=700):
    o = np.zeros(int((n * sp + .3) * SR), np.float32)
    for i in range(n): s = screech(.09, f * (1 + .2 * rng.random())); j = int(i * sp * SR); o[j:j + len(s)] += s[:len(o) - j]
    return o
def buzz(d, g=1.0):   # transformer hum + crackles
    x = tt(d); o = (np.sign(np.sin(2 * np.pi * 100 * x)) * .05 + np.sin(2 * np.pi * 50 * x) * .08).astype(np.float32)
    for k in range(int(d * 10)):
        c = rng.standard_normal(int(.03 * SR)); c = (c - onepole(c, .3)) * np.exp(-tt(.03) * 120); j = int(rng.uniform(0, max(.01, d - .05)) * SR); o[j:j + len(c)] += c[:len(o) - j] * .45
    return o * g
def zap(d=.7):
    x = tt(d); n = rng.standard_normal(len(x)).astype(np.float32); return (n * .8 + np.sign(np.sin(2 * np.pi * 120 * x)) * .4) * np.exp(-x * 5) * (1 + np.sign(np.sin(2 * np.pi * 37 * x))) * .5
def munch(n=6, sp=.18):
    o = np.zeros(int((n * sp + .2) * SR), np.float32)
    for i in range(n): c = onepole(rng.standard_normal(int(.06 * SR)), .4) * np.exp(-tt(.06) * 40) * .6; j = int(i * sp * SR); o[j:j + len(c)] += c[:len(o) - j]
    return o
# winter rooftop ambience: birds, distant street, kites flapping
for sid, g in [('hook', .6), ('intro', 1.0), ('tease', .9), ('chase', .9), ('rescue', .8), ('lesson', .8)]:
    P(sfx, birds(D[sid], .8 * g), S[sid]); P(sfx, street(D[sid], .4 * g), S[sid])
for sid in ('home', 'power', 'tv', 'ending'): P(sfx, birds(D[sid], .25), S[sid])
h = S['hook']
P(sfx, buzz(rw - h, .9), h); P(sfx, zap(.6), h + .6, .5); P(sfx, zap(.5), h + 2.4, .4); P(sfx, screech(.5), h + 1.2, .8); P(sfx, whoosh(1.2), h + 1.4, .7)
P(sfx, rewind(1.8), rw, .9)
i0 = S['intro']; P(sfx, flap(8, .09, .4), i0 + .5); P(sfx, thump(120, .15), i0 + 3.75, .5); steps(i0 + 3.9, 12, .13, .25); P(sfx, cheer(1.2), LE('q1') - .3, .3)
for k in range(4): P(sfx, pop(1100 + 100 * k, .06), LE('q1') + .1 * k, .3)
t0 = S['tease']; P(sfx, flap(5, .05, .6), t0 + .1); P(sfx, thump(150, .15), t0 + .7, .5); P(sfx, chatter(4), t0 + 1.0, .6)
P(sfx, chatter(3, .12, 800), LA('s1') + 1.0, .5); P(sfx, screech(.6, 1000), LE('s1') - .15, 1.0)
P(sfx, whoosh(.6), LE('i2') + .05, .9); P(sfx, scratch(), sT, .7); P(sfx, pop(1500, .08), sT, .6); P(sfx, whoosh(.7), sT + .1, .8); P(sfx, chatter(6, .09, 900), sT + .9, .7)
P(sfx, slide(1200, 400, .8), LA('i3') + 1.55)
steps(S['home'], 10, .11); P(sfx, whoosh(.5), LE('k1') + .15, .8); P(sfx, thump(80, .3), LE('k1') + .8, .7)
P(sfx, ding(1760, .5), LE('k1') - .4, .5)
for i in range(3): P(sfx, pop(700 + i * 120, .1), LA('a1') + .3 + i * .1, .35)
c0 = S['chase']; steps(c0, 22, .11, .3); P(sfx, whoosh(.5), c0 + 1.0, .7); P(sfx, flap(14, .05, .8), c0 + 1.75); P(sfx, thump(140, .2), c0 + 1.8, .6)
P(sfx, chatter(5), c0 + 2.2, .6); P(sfx, whoosh(.5), c0 + 2.4, .6); P(sfx, crack(6, .2), c0 + 2.9, .3)
P(sfx, buzz(D['chase'] - 5.0, .9), c0 + 5.0); P(sfx, zap(.7), c0 + 7.0, .9); P(sfx, screech(.7, 1100), c0 + 7.05, 1.0)
p0 = S['power']; P(sfx, flush(), p0 + .8, .8); P(sfx, sweep(200, 900, LE('n3') - p0 - 1.0, .12), p0 + 1.0); P(sfx, ding(1600, .5), p0 + 1.0, .4)
P(sfx, thump(45, 1.2, 1.2), q3 - .45); P(sfx, whoosh(.8), q3 - .5, .9); P(sfx, sparkle(1.0), q3, .6); P(sfx, ding(1760, .6), LE('q3') + .2, .6); P(sfx, whoosh(1.0), LE('q3') + .5, .8)
P(sfx, whoosh(2.0), r0, 1.0); P(sfx, whoosh(.5), r0 + .85, .8); P(sfx, pop(900, .1), r0 + 1.0, .6); P(sfx, buzz(zapT - r0, .6), r0)
P(sfx, ding(1500, .5), LE('q5') + .3, .4); P(sfx, chatter(3, .1, 750), LE('q5') + .5, .5); P(sfx, munch(3), LE('q5') + .85, .4)
P(sfx, zap(.9), zapT, 1.1); P(sfx, screech(.6, 1100), zapT + .05, .9); P(sfx, sweep(1400, 400, 1.0, .08), zapT + .1); P(sfx, whoosh(1.0), zapT + .3, .8)
P(sfx, thump(60, .4), land, .7); P(sfx, sparkle(1.0), land, .6); P(sfx, cheer(2.4), land + .3, .5); P(sfx, munch(10), land + .5, .35)
off = r0 + D['rescue'] - 1.0; P(sfx, whoosh(.9), off, 1.0); P(sfx, sweep(400, 1600, .6, .12), off)
l0 = S['lesson']; P(sfx, thump(70, .3), l0 + .45, .6); P(sfx, sparkle(.8), l0 + LA('i5') - l0 + 1.4, .7); P(sfx, ding(2000, .5), LA('i5') + 1.5, .5); P(sfx, whoosh(.6), LA('i5') + 1.8, .9)
P(sfx, chatter(4, .1, 800), LA('s2') + 1.9, .5); P(sfx, munch(10), LA('s2') + 2.0, .4); steps(LA('z4') + .5, 14, .15, .2)
P(sfx, sweep(600, 1200, .3, .1), S['tv'])
e0 = S['ending']; P(sfx, ding(1600, .6), LE('q6') - .3, .5); P(sfx, sparkle(.8), LE('q6') + .1, .5); steps(LE('q6') + .25, 6, .11)
P(sfx, whoosh(.4), S['endcard'], .5); P(sfx, chatter(4, .12, 750), S['endcard'] + 1.4, .35)
cl = S['endcard'] + Lb['n4']['s'] + Lb['n4']['d'] * .5 + 2.1; P(sfx, pop(1400, .08), cl, .7); P(sfx, ding(1320, .9), cl + .2, .6)
# ---------------- MIX ----------------
venv = np.convolve(np.abs(voice), np.ones(2205) / 2205, 'same'); duck = 1 - .55 * np.clip(venv / .04, 0, 1)
duck = np.convolve(duck, np.ones(4410) / 4410, 'same')
mix = voice + sfx * .5 + mus * .4 * duck
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix /= np.abs(mix).max() / .95
w = wave.open('ep5_mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', round(DUR, 2))
