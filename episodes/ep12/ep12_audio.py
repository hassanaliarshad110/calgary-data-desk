"""Episode 12 audio: scene-aware desi score + SFX + DIALOGUE-FIRST mix (Hassan's sound rule, Nov 14 2026).
Writes stems (voice / music / sfx), checks every dialogue line (voice vs music+SFX, 300-3400 Hz, >= 10 dB; SFX peak >= 10 dB under voice peak),
fixes failing lines by extra ducking, and writes ep8_mix.wav (loudness set later to -14 LUFS / -1 dBTP with ffmpeg loudnorm)."""
import sys, json, wave, numpy as np
from scipy.signal import lfilter, butter, sosfilt
TL = json.load(open('timeline.json')); DUR = TL['total'] + .4
sys.argv = ['x', str(DUR)]
import musiclib as M
def _onepole(x, k): return lfilter([k], [1, -(1 - k)], np.asarray(x, np.float64)).astype(np.float32)
M.onepole = _onepole
M.shaker = lambda g=1.0: np.zeros(10, np.float32)          # v2: no shaker hiss (sounded like wheezing under the voices)
_slap = M.slap; M.slap = lambda g=1.0, d=.06: _slap(g * .35, d)
_rng_std = M.rng.standard_normal
def _bansuri(f, d, g=1.0, f_from=None, vib=1.0):
    x = M.tt(d); fr = np.full_like(x, f)
    if f_from: fr = f + (f_from - f) * np.exp(-x * 40)
    fr = fr * (1 + .006 * vib * np.clip(x / .25, 0, 1) * np.sin(2 * np.pi * 5.6 * x))
    ph = 2 * np.pi * np.cumsum(fr) / M.SR; s = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    return s * np.clip(x / .05, 0, 1) * np.clip((d - x) / .08, 0, 1) * g * .32          # v2: pure tone, no breath noise
M.bansuri = _bansuri
from musiclib import *
onepole = _onepole; bansuri = _bansuri; shaker = M.shaker; slap = M.slap
S = {s['id']: s['start'] for s in TL['scenes']}; D = {s['id']: s['dur'] for s in TL['scenes']}
Lb = TL['lines']; LA = lambda i: Lb[i]['abs']; LE = lambda i: Lb[i]['abs'] + Lb[i]['d']; LS_ = LA
bar = 8 * E
def groove(t0, t1, g=.8, chords=('D', 'A', 'G', 'D'), mel=True, mg=.5):
    n = int((t1 - t0) / bar)
    if n <= 0: return
    kaharwa(t0, n, g)
    for i in range(n): chord(chords[i % 4], t0 + i * bar, bar * .98, .5)
    if mel: theme(t0, mg, n)
def sarangi(f, d, g=1.0, f_from=None, vib=1.0):   # sad violin/sarangi: bright saw-ish tone, slow vibrato, slide
    x = tt(d); f0 = f_from or f; fr = f0 + (f - f0) * np.clip(x / .25, 0, 1); fr = fr * (1 + .012 * vib * np.sin(2 * np.pi * 5.5 * x) * np.clip(x / .2, 0, 1))
    ph = 2 * np.pi * np.cumsum(fr) / SR; s = sum(np.sin(n * ph) / n ** 1.2 for n in range(1, 9))
    s = onepole(s, .25); env = np.clip(x / .12, 0, 1) * np.clip((d - x) / .25, 0, 1)
    return (s * env * .35 * g).astype(np.float32)
def sadSting(t, g=.8):   # the crying-girl "sad violin": a descending sarangi sob
    for n, dd, o, slide in [(12, .45, 0, 14), (10, .45, .42, None), (8, .5, .84, None), (7, .9, 1.3, 8)]:
        put(sarangi(hz(n), dd, g, f_from=hz(slide) if slide else None, vib=1.6), t + o)


# ================= EPISODE 12 cues =================
c0 = S['cold']; CRa = LE('x1') + .15
# frame 0: big hit + cymbal + tense harmonium, fast tabla roll while the ball flies; a stop at the crash; suspense under Gill's shout
put(boom(1.0), 0.0); put(cymbal(.9, 1.6), 0.0); put(harmonium([hz(-13), hz(-12), hz(-6)], CRa, .9, att=.01), 0.0)
t = .3
while t < CRa - .1: put(na(.32 + .25 * t / CRa, 600 + 120 * t / CRa), t); t += E / 2
for n, d, tt0 in [(3, .2, .35), (5, .2, .6), (7, .2, .85), (12, .5, 1.1)]: put(bansuri(hz(n + 12), d, .5), tt0)
put(boom(.9), CRa); put(cymbal(.8, 1.4), CRa)
put(harmonium([hz(-13), hz(-9), hz(-6)], D['cold'] - CRa - .3, .5, att=.3), CRa + .3)
w0 = S['why']
put(harmonium([hz(-12), hz(-8), hz(-5)], LS_('b2') - w0, .35, att=.5), w0)
for k in range(8): put(pluck(hz([0, 3, 5, 7, 5, 3, 0, -2][k]), .22, .5), w0 + .1 + k * .18)
kaharwa(w0 + 2.2, max(1, int((LA('g2') - w0 - 2.4) / bar)), .3, fill_last=False)
for k in range(10): put(pluck(hz([7, 5, 7, 10, 7, 5, 3, 5, 3, 0][k]), .2, .5), LA('b2') + .1 + k * .3)   # sneaky plucks (chupke se)
put(harmonium([hz(-13), hz(-9), hz(-6), hz(-1)], LE('q1') - LA('da1') + .3, .45, att=.2), LA('da1') - .1)
t = LE('da1')
while t < LE('q1'): put(na(.3, 640), t); t += E / 2
for n, dd, tt0 in [(7, .5, 0), (5, .5, .5), (3, .9, 1.0)]: put(bansuri(hz(n + 12), dd, .35, vib=2), LA('q1') + .1 + tt0)
q0 = S['gag']
groove(q0 + .1, LA('pf') - .1, .35, mel=False)
put(bansuri(hz(14), .14, .5), LA('pf') + .05); put(bansuri(hz(9), .35, .5, f_from=hz(14)), LA('pf') + .19)
put(harmonium([hz(-13), hz(-12)], .8, .7, att=.02), LE('a2') + .05)
sadSting(LA('k2') + .05, .55)
put(sarangi(hz(5), .9, .8, f_from=hz(9), vib=2), LE('k2') + .05)
for k in range(8): put(pluck(hz([0, 3, 5, 7, 10, 12, 10, 7][k]), .22, .55), LE('a3') + .1 + k * .16)
p0 = S['power']; q = LA('qp')
t = p0 + .5; step = E
while t < q - .5:
    put(na(.22 + .45 * (t - p0) / (q - p0), 560 + 180 * (t - p0) / (q - p0)), t); step = max(E / 4, step * .95); t += step
for i in range(9): put(harmonium([hz(i - 12), hz(i - 5)], .5, .22 + .05 * i, att=.05), p0 + .7 + i * (q - p0 - 1.3) / 9)
put(boom(1.0), q - .45); put(cymbal(1.0, 2.6), q - .45)
put(harmonium([hz(-12), hz(-8), hz(-5), hz(0), hz(4), hz(7)], 1.6, 1.2, att=.02), q - .45)
r0 = S['rescue']; snapA = r0 + 4.9; slowA = r0 + 7.3; grabA = r0 + 9.35; pcA = r0 + 11.2; pupA = r0 + 12.6; offA = r0 + 21.9
chaal(LE('qp') + .1, max(1, int((snapA - .2 - LE('qp')) / bar)), .6)
for n, dd, tt0 in [(0, .3, 0), (7, .3, .35), (12, .7, .7)]: put(bansuri(hz(n + 12), dd, .8), r0 + .2 + tt0)
put(boom(.9), snapA); put(cymbal(.6, 1.2), snapA)
put(harmonium([hz(-13), hz(-9), hz(-6), hz(-1)], slowA - snapA, .6, att=.1), snapA + .1)
t = snapA + .3
while t < slowA - .2: put(na(.38, 650), t); t += E / 2
put(boom(.7), slowA)
put(harmonium([hz(-13), hz(-9), hz(-6), hz(-1)], grabA - slowA + .4, .55, att=.3), slowA + .1)
for k in range(int((grabA - slowA) / .5)): put(ghe(.35, 1.1), slowA + .2 + k * .5)
for n, dd, tt0 in [(12, .45, 0), (9, .45, .45), (5, .5, .9)]: put(bansuri(hz(n + 12), dd, .45, vib=2.5), slowA + .2 + tt0)
put(harmonium([hz(-12), hz(-5), hz(0), hz(4), hz(7)], 1.2, 1.0, att=.02), grabA); put(cymbal(.5, 1.4), grabA)
put(harmonium([hz(-13), hz(-9), hz(-6)], pcA - grabA - 1.0, .45, att=.2), grabA + 1.0)
t = LE('q4') + .1
while t < pcA - .1: put(na(.35, 660), t); t += E / 2
put(boom(.8), pcA); put(harmonium([hz(-12), hz(-5), hz(0), hz(4), hz(7)], 1.4, 1.0, att=.02), pupA)
groove(pupA + .4, offA - .2, .45, chords=('D', 'G', 'A', 'D'), mel=True, mg=.4)
for k in range(6): put(pluck(hz([0, 4, 7, 12, 16, 19][k]), .2, .5), offA + k * .09)
s0 = S['secret']
put(harmonium([hz(-12), hz(-9), hz(-5)], LE('b6') - s0, .35, att=.4), s0 + .1)
for k in range(6): put(pluck(hz([0, 2, 4, 7, 9, 12][k]), .25, .55), LE('b6') + .05 + k * .07)
put(harmonium([hz(-12), hz(-5), hz(0), hz(4)], LE('g4') - LA('g4') + .4, .45, att=.3), LA('g4') - .1)
groove(LE('g4') + .2, LA('da3') - .1, .35, mel=False)
for k in range(6): put(pluck(hz([0, 3, 5, 7, 10, 12][k]), .25, .55), LE('kn') + k * .07)
for k in range(5): put(pluck(hz([12, 7, 12, 16, 19][k]), .2, .5), LE('q6') + .05 + k * .08)
groove(LE('q6') + .3, s0 + D['secret'] - .1, .4, chords=('D', 'G', 'A', 'D'), mel=True, mg=.35)
c1 = S['cliff']
put(boom(1.0), c1); put(cymbal(.8, 1.4), c1)
put(harmonium([hz(-13), hz(-12), hz(-7)], D['cliff'] - .2, .7, att=.05), c1 + .05)
for k in range(10): put(na(.3 + .05 * k, 600 + 50 * k), c1 + .1 + k * .12)
e0 = S['endcard'] + .1
put(harmonium([hz(-12), hz(-5), hz(0), hz(4)], LE('n3') - e0 + .3, .4, att=.4), e0)
kaharwa(LE('n3') - 1.6, max(1, int((S['endcard'] + D['endcard'] - 1.8 - LE('n3') + 1.6) / bar)), .6, fill_last=False)
nb2 = max(1, int((S['endcard'] + D['endcard'] - 1.8 - e0) / bar))
for i in range(nb2): chord(('D', 'A', 'G', 'D')[i % 4], e0 + i * bar, bar * .98, .4)
theme(e0, .45, nb2)
fin = e0 + nb2 * bar
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
def creak(d=.6): x = tt(d); f = 180 + 120 * np.sin(2 * np.pi * 1.6 * x); return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .05 * np.clip(x / .05, 0, 1) * np.clip((d - x) / .1, 0, 1)).astype(np.float32)
def crowd(d, g=1.0):   # mela crowd murmur: band-limited noise + scattered voices + far bells
    n = rng.standard_normal(int(d * SR)).astype(np.float32); b = onepole(n, .12) - onepole(n, .02); o = b * 1.6
    for k in range(int(d * 2.5)):
        j = int(rng.uniform(0, max(.01, d - .4)) * SR); v = formant_voice(lambda xx, f=rng.uniform(140, 320): f * (1 + .1 * np.sin(6 * xx)), .3, lambda xx: 700 + 0 * xx, lambda xx: 1200 + 0 * xx) * .03 * np.sin(np.pi * np.clip(tt(.3) / .3, 0, 1)); o[j:j + len(v)] += v[:len(o) - j]
    return o * g
def sniffle(): x = tt(.35); n = rng.standard_normal(len(x)).astype(np.float32); return (n - onepole(n, .3)) * np.sin(np.pi * x / .35) ** 2 * .25
def megaphone(d=.25): return sweep(900, 1100, d, .05)
def squeal(d=.5): return sweep(2400, 2600, d, .03)
for lid, l in Lb.items():
    a = rd(f'aud/{lid}.wav'); act = a[np.abs(a) > .02]; r = np.sqrt(np.mean(act ** 2)) if len(act) else .1
    a = a * (.16 / r); pk = np.abs(a).max()
    if pk > .7: a = a * (.7 / pk)          # keep headroom; no clipping, no limiter needed on the voice
    P(voice, a, l['abs'])
# ambience: evening birds at home; mela crowd everywhere else
# v2: no continuous noise beds (crowd/birds) — they pumped under the ducking and sounded like wheezing.
# Every SFX is placed only in the GAPS between lines (P_gap trims anything that would touch a line).
SPANS = sorted((l['abs'] - .12, l['abs'] + l['d'] + .12) for l in Lb.values())
_P = P
def P(buf, a, t, g=1.0):
    if buf is not sfx: return _P(buf, a, t, g)
    a = np.asarray(a, np.float32); t1 = t + len(a) / SR
    for s0, s1 in SPANS:
        if s0 <= t < s1: return                       # starts inside a line: drop it
        if t < s0 < t1:                                 # runs into the next line: cut it before the line, 60 ms fade
            n = max(0, int((s0 - t) * SR)); a = a[:n].copy(); f = min(len(a), int(.06 * SR))
            if f: a[-f:] *= np.linspace(1, 0, f)
            break
    if len(a): _P(buf, a, t, g)
def moo(d=1.1, f0=118, g=1.0):   # cow "MOOO": low rising-falling throaty formant
    s = formant_voice(lambda x: f0 * (1 + .25 * np.sin(np.pi * np.clip(x / d, 0, 1)) - .1 * x / d), d, lambda x: 450 + 250 * np.clip(x / .3, 0, 1), lambda x: 850 + 0 * x)
    x = tt(d); return s * np.clip(x / .08, 0, 1) * np.clip((d - x) / .25, 0, 1) * .1 * g
def honks(t0, d, n, g=.5):
    for k in range(n):
        tt0 = t0 + rng.uniform(0, max(.01, d - .4)); f = rng.choice([1.0, .8, 1.25, .9])
        x = tt(.32); hk = (np.sign(np.sin(2 * np.pi * 410 * f * x)) * .5 + np.sign(np.sin(2 * np.pi * 520 * f * x)) * .5) * .08 * np.clip((.32 - x) / .04, 0, 1)
        P(sfx, onepole(hk, .35) * 1.6, tt0, g)
def engine(d, g=1.0):
    x = tt(d); return (np.sin(2 * np.pi * 42 * x) * .3 + np.sign(np.sin(2 * np.pi * 21 * x)) * .05) * np.clip(x / .2, 0, 1) * np.clip((d - x) / .3, 0, 1) * g

def chirp(n=2, f=3900, g=1.0):
    o = np.zeros(int((n * .11 + .15) * SR), np.float32)
    for i in range(n): s = sweep(f, f * 1.25, .07, .22); j = int(i * .11 * SR); o[j:j + len(s)] += s[:len(o) - j]
    return o * g
def splash(d=.7, g=1.0):
    n = rng.standard_normal(int(d * SR)).astype(np.float32); x = tt(d); b = n - onepole(n, .2)
    return onepole(b, .5) * np.exp(-x * 5) * np.clip(x / .01, 0, 1) * 1.3 * g
def plink(f=1500): x = tt(.25); return np.sin(2 * np.pi * f * x * (1 + .5 * np.exp(-x * 30))) * np.exp(-x * 18) * .5
def horn(d=.4): x = tt(d); return (np.sign(np.sin(2 * np.pi * 330 * x)) * .5 + np.sign(np.sin(2 * np.pi * 415 * x)) * .5) * .08 * np.clip((d - x) / .05, 0, 1)
def thorn(d=1.2, g=1.0):   # deep two-tone diesel horn "PAAAM"
    x = tt(d); env = np.clip(x / .05, 0, 1) * np.clip((d - x) / .2, 0, 1)
    s = sum(np.sign(np.sin(2 * np.pi * f * x)) * a for f, a in [(155, .5), (196, .4), (311, .15)])
    return onepole(s.astype(np.float32), .25) * env * .25 * g
def clack(d, rate=2.2, g=1.0):   # clickety-clack of wheels on rail joints (no noise bed)
    o = np.zeros(int(d * SR), np.float32); k = 0.0
    while k < d - .3:
        for dd in (0, .11):
            c = thump(120, .07, 1) * .6; c[:1323] += pop(500, .03)[:1323] * .25; j = int((k + dd) * SR); o[j:j + len(c)] += c[:len(o) - j]
        k += 1 / rate
    return o * g
def yelp(): return sweep(900, 1500, .18, .25) * np.exp(-tt(.18) * 6)
def whimper(): x = tt(.6); return sweep(1200, 800, .6, .12) * (1 + .5 * np.sin(2 * np.pi * 9 * x))
def brakes(d=1.2): return sweep(2800, 2400, d, .05) * (1 + .3 * np.sin(2 * np.pi * 31 * tt(d)))
def glass(d=.9):   # window shatter: noise burst + many bright tinkles
    o = np.zeros(int(d * SR), np.float32); n = rng.standard_normal(int(.25 * SR)).astype(np.float32); n = (n - onepole(n, .35)) * np.exp(-tt(.25) * 14) * 1.2; o[:len(n)] += n
    for i in range(22):
        f = rng.uniform(2500, 6500); s2 = np.sin(2 * np.pi * f * tt(.18)) * np.exp(-tt(.18) * 25) * .25; j = int(rng.uniform(.02, d - .2) * SR * (.4 + .6 * i / 22)); o[j:j + len(s2)] += s2[:len(o) - j]
    return o
def clang(d=1.0, f=420):   # metal pipe hit
    x = tt(d); return sum(np.sin(2 * np.pi * f * r * x) * a for r, a in [(1, .5), (2.76, .3), (5.4, .2), (8.9, .1)]) * np.exp(-x * 5) * .8
def bat_hit(): x = tt(.2); return (np.sin(2 * np.pi * 520 * x) * .6 + np.sin(2 * np.pi * 1180 * x) * .3) * np.exp(-x * 35) + onepole(rng.standard_normal(len(x)), .5) * np.exp(-x * 80) * .5
cA = S['cold']; CRa = LE('x1') + .15
P(sfx, bat_hit(), 0.0, .9); P(sfx, whoosh(.5), 0.0, 1.0); P(sfx, thump(55, .4, 1.2), 0.0, .7)
P(sfx, glass(.9), CRa, 1.0); P(sfx, thump(70, .4, 1.0), CRa, .7); P(sfx, tuk(), CRa + .45, .5); P(sfx, tuk(), CRa + .6, .3)
w0 = S['why']
P(sfx, boing(), LE('b1') + .05, .5); P(sfx, whoosh(.4), LE('d1') + .05, .4); steps(LE('g2') + .1, 4, .14, .2)
steps(LE('b2') + .1, 7, .12, .3); P(sfx, creak(.25), LE('da1') + .12, .5); P(sfx, scratch(), LE('b3') + .12, .4)
for i in range(3): P(sfx, pop(700 + i * 120, .1), LE('pf') - .3 + i * .1, .2)
P(sfx, ding(1600, .4), LE('a3') + .1, .45); steps(LE('a3') + .2, 8, .12, .25)
P(sfx, whoosh(.9), LE('jj') + .05, 1.0); steps(LE('jj') + .1, 8, .1, .3); P(sfx, thump(80, .3), LE('jj') + .95, .8)
p0 = S['power']; P(sfx, flush(.5), p0 + .05, .5); P(sfx, sweep(200, 900, LE('n2') - p0 - .9, .1), p0 + .9)
P(sfx, thump(45, 1.2, 1.2), q - .45); P(sfx, whoosh(.8), q - .5, .9); P(sfx, sparkle(1.0), LE('qp') + .05, .6); P(sfx, whoosh(1.0), LE('qp') + .45, .8)
r0 = S['rescue']; P(sfx, whoosh(1.0), r0 + .0, .7); P(sfx, creak(.6), LE('q3') + .15, .5); P(sfx, creak(.5), r0 + 3.9, .5)
P(sfx, crack(6, .04), r0 + 4.9, 1.0); P(sfx, clang(.6, 380), r0 + 5.0, .5); P(sfx, creak(.8), LE('b4') + .15, .5)
P(sfx, whoosh(1.2), r0 + 7.3, .9); P(sfx, thump(60, .5, 1.2), r0 + 9.35, .9)
P(sfx, creak(.6), LE('q4') + .15, .5); P(sfx, clang(1.0, 420), r0 + 11.2, .9); P(sfx, thump(70, .3), r0 + 11.2, .6); P(sfx, clang(.6, 520), r0 + 12.6, .4)
steps(r0 + 11.5, 10, .16, .3); P(sfx, tuk(), r0 + 12.9, .6); P(sfx, tuk(), r0 + 13.0, .5)
P(sfx, whoosh(.6), LE('m1') + .1, .7); P(sfx, sparkle(.7), r0 + 17.6, .5); P(sfx, whoosh(.5), r0 + 17.9, .5)
P(sfx, ding(1500, .5), LE('b5') + .1, .4); P(sfx, whoosh(1.2), r0 + 21.9, .9); P(sfx, sparkle(.6), r0 + 22.2, .4)
s0 = S['secret']; P(sfx, creak(.5), s0 + .05, .4); steps(s0 + .2, 4, .16, .25)
P(sfx, ding(1760, .6), LE('b6') + .1, .4); P(sfx, sparkle(.6), LE('g4') + .13, .4); steps(LA('kt') - 2.4, 10, .2, .2)
P(sfx, ding(1600, .6), LE('kn') - .25, .25); P(sfx, sparkle(.6), LE('kn') + .13, .4); P(sfx, sparkle(.5), LE('q6') + .1, .4)
c1 = S['cliff']; P(sfx, thwack(), c1, 1.0); P(sfx, whoosh(.6), c1 + .05, .9); P(sfx, slide(400, 200, .5), c1 + .2, .5)
P(sfx, whoosh(.5), S['endcard'] - .3, .6)
cl = LA('n3') + 4.2 + 2.9; P(sfx, pop(1400, .08), cl, .5); P(sfx, ding(1320, .9), cl + .2, .25)

# ---------------- DIALOGUE-FIRST MIX ----------------
# sidechain: duck BOTH the score and the SFX under the voice (fast attack, smooth release)
sm = lambda x, n: np.convolve(x, np.ones(n) / n, 'same')
act = np.zeros(N, np.float32)
for l in Lb.values(): act[int((l['abs'] - .15) * SR):int((l['abs'] + l['d'] + .2) * SR)] = 1
duckM = sm(1 - .82 * act, int(.25 * SR)); duckS = np.ones(N, np.float32)      # music ducks smoothly over whole lines (no word-by-word pumping)
MUS_G, SFX_G = .36, .5
musS = mus * MUS_G * duckM; sfxS = sfx * SFX_G * duckS
band = butter(4, [300, 3400], btype='band', fs=SR, output='sos')
def db(x): return 10 * np.log10(np.mean(x ** 2) + 1e-12)
def check():
    vb = sosfilt(band, voice); bb = sosfilt(band, musS + sfxS); res = {}
    for lid, l in Lb.items():
        i0, i1 = int(l['abs'] * SR), int((l['abs'] + l['d']) * SR)
        v = vb[i0:i1]; b = bb[i0:i1]
        # speech frames only (ignore the silent gaps inside a line)
        fr = 2205; idx = [k for k in range(0, len(v) - fr, fr) if db(v[k:k + fr]) > db(v) - 12]
        vv = np.concatenate([v[k:k + fr] for k in idx]) if idx else v; bb2 = np.concatenate([b[k:k + fr] for k in idx]) if idx else b
        sp = 20 * np.log10(np.abs(sfxS[i0:i1]).max() + 1e-9) - 20 * np.log10(np.abs(voice[i0:i1]).max() + 1e-9)
        res[lid] = (round(float(min(db(vv) - db(bb2), db(v) - db(b))), 1), round(float(sp), 1))   # worst of speech-frames and whole-span
    return res
for it in range(6):
    R = check(); bad = {k: v for k, v in R.items() if v[0] < 11.0 or v[1] > -10.5}
    print('pass', it, 'failing:', bad)
    if not bad: break
    for lid, (snr, sp) in bad.items():
        l = Lb[lid]; i0, i1 = int((l['abs'] - .15) * SR), int((l['abs'] + l['d'] + .15) * SR)
        g = np.ones(N, np.float32); cut = 10 ** (-(max(11.5 - snr, 1.5)) / 20); g[max(0, i0):i1] = cut; g = sm(g, 2205)
        musS *= g
        if sp > -10.5 or snr < 11: gs = np.ones(N, np.float32); gs[max(0, i0):i1] = 10 ** (-(max(sp + 11, 1.5)) / 20) if sp > -10.5 else cut; sfxS *= sm(gs, 2205)
R = check()
json.dump({'lines': R, 'rule': 'voice - (music+sfx) in 300-3400 Hz >= 10 dB; sfx peak <= voice peak - 10 dB'}, open('dialogue_check.json', 'w'), indent=1)
print('FINAL', R); print('min SNR', min(v[0] for v in R.values()), 'max sfx-peak rel', max(v[1] for v in R.values()))
mix = voice + musS + sfxS
mix /= np.abs(mix).max() / .89
def wr(fn, x):
    w = wave.open(fn, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
wr('ep12_mix.wav', mix); wr('stem_voice.wav', voice / np.abs(mix).max() * .9 if False else voice); wr('stem_bed.wav', musS + sfxS)
print('mix ok', round(DUR, 2))
