"""Susuman score: desi cartoon band synthesised in numpy (dholak, tabla, harmonium, bansuri, pluck).
Scene-aware cues for the teaser timeline. Output: music.wav (mono 44.1 kHz)."""
import numpy as np, wave, sys
SR = 44100
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 30.6
N = int(SR * DUR)
rng = np.random.default_rng(11)
out = np.zeros(N + SR * 3, np.float32)
BPM = 104; E = 60 / BPM / 2          # one matra (eighth)
SA = 293.66                          # D4
def hz(semi, base=SA): return base * 2 ** (semi / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def put(a, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(out): return
    a = a[:len(out) - i]; out[i:i + len(a)] += a * g
def onepole(x, k):
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += k * (x[i] - s); y[i] = s
    return y

# ---------- percussion ----------
def ghe(g=1.0, bend=1.35):                      # dholak bass with upward bend
    x = tt(.42); f = 82 * (1 + (bend - 1) * (1 - np.exp(-x * 9)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .25 * np.sin(2 * ph)) * np.exp(-x * 7) * g
def dha_low(g=1.0):
    x = tt(.3); f = 120 * np.exp(-x * 6) + 78
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 11) * g
def na(g=1.0, f=540):                           # tabla ring (dayan)
    x = tt(.32); s = np.zeros_like(x)
    for r, a, d in [(1, 1, 9), (2.0, .55, 13), (3.01, .3, 18), (4.2, .15, 26)]:
        s += a * np.sin(2 * np.pi * f * r * x) * np.exp(-x * d)
    click = np.r_[rng.standard_normal(180) * np.exp(-np.arange(180) / 25), np.zeros(len(x) - 180)]
    return (s * .5 + click * .25) * g
def slap(g=1.0, d=.06):
    n = rng.standard_normal(int(d * SR)); n = n - onepole(n, .25)
    return n * np.exp(-tt(d) * 70) * .5 * g
def shaker(g=1.0):
    n = rng.standard_normal(int(.05 * SR)); n = n - onepole(n, .5)
    return n * np.exp(-tt(.05) * 90) * .18 * g
def boom(g=1.0):
    x = tt(1.6); f = 70 * np.exp(-x * 3) + 38
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.5)) * g
def cymbal(g=1.0, d=2.2):
    n = rng.standard_normal(int(d * SR)); n = n - onepole(n, .6)
    return n * np.exp(-tt(d) * 2.2) * .22 * g

# ---------- melodic ----------
def harmonium(freqs, d, g=1.0, att=.08):
    x = tt(d); s = np.zeros_like(x)
    for f in freqs:
        for det in (-.9, .9):
            for n in range(1, 14):
                if f * n > 7000: break
                s += np.sin(2 * np.pi * (f + det) * n * x + n) / n ** 1.25
    env = np.clip(x / att, 0, 1) * np.clip((d - x) / .15, 0, 1)
    trem = 1 + .07 * np.sin(2 * np.pi * 5.2 * x)          # bellows
    return s * env * trem * g * .06 / max(1, len(freqs)) ** .5
def bansuri(f, d, g=1.0, f_from=None, vib=1.0):
    x = tt(d)
    fr = np.full_like(x, f)
    if f_from: fr = f + (f_from - f) * np.exp(-x * 40)
    fr = fr * (1 + .006 * vib * np.clip(x / .25, 0, 1) * np.sin(2 * np.pi * 5.6 * x))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    breath = onepole(rng.standard_normal(len(x)), .08) * .6
    s = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    env = np.clip(x / .05, 0, 1) * np.clip((d - x) / .08, 0, 1)
    return (s + breath * .12) * env * g * .32
def pluck(f, d=.5, g=1.0, bright=.5):              # Karplus-Strong (rubab-ish)
    L = int(SR / f); buf = rng.uniform(-1, 1, L); n = int(d * SR); y = np.empty(n)
    k = .5 * (1 - .02 * bright)
    for i in range(n):
        y[i] = buf[i % L]; buf[i % L] = .996 * (buf[i % L] * (1 - k) + buf[(i + 1) % L] * k) if i >= 0 else 0
    return y * g * .5

# ---------- patterns ----------
def kaharwa(t0, bars, g=1.0, fill_last=True):
    # 8 matras: Dha Ge Na Ti | Na Ka Dhin Na
    for b in range(bars):
        t = t0 + b * 8 * E
        put(ghe(.9 * g), t); put(na(.8 * g), t)
        put(ghe(.45 * g, 1.2), t + E)
        put(na(.6 * g, 600), t + 2 * E)
        put(slap(.7 * g), t + 3 * E)
        put(na(.5 * g, 600), t + 4 * E)
        put(slap(.4 * g), t + 5 * E)
        put(ghe(.7 * g, 1.5), t + 6 * E); put(na(.7 * g), t + 6 * E)
        put(na(.55 * g, 600), t + 7 * E)
        if fill_last and b == bars - 1:
            for k in range(4): put(na(.5 * g, 620 + 30 * k), t + 6 * E + k * E / 2)
        for k in range(16): put(shaker(g * (1 if k % 2 else .6)), t + k * E / 2)
def chaal(t0, bars, g=1.0):                    # bhangra-ish heroic beat
    for b in range(bars):
        t = t0 + b * 8 * E
        for k, (fn, gg) in enumerate([(ghe, 1), (None, 0), (None, 0), (na, .7), (ghe, .9), (None, 0), (na, .7), (slap, .6)]):
            if fn: put(fn(gg * g), t + k * E)
        for k in range(16): put(shaker(g), t + k * E / 2)
CH = {'D': [0, 4, 7], 'G': [5, 9, 12], 'A': [7, 11, 14], 'Bm': [9, 14, 17]}
def chord(name, t, d, g=1.0, octv=-12):
    put(harmonium([hz(s + octv) for s in CH[name]], d, g), t)
THEME = [[7, 7, 9, 7, 4, None, 2, 4], [7, None, 4, 2, 0, None, None, None],
         [0, 2, 4, 7, 9, 7, 9, 12], [11, 9, 7, 4, 7, None, None, None]]
def theme(t0, g=1.0, bars=4, start=0):
    prev = None
    for b in range(bars):
        row = THEME[(start + b) % 4]
        for k, n in enumerate(row):
            if n is None: continue
            L = 1
            while k + L < 8 and row[k + L] is None: L += 1
            put(bansuri(hz(n + 12), L * E * .95, g, hz(prev + 12) if prev is not None and abs(n - prev) <= 4 else None), t0 + (b * 8 + k) * E)
            prev = n

# ---------- cues on the teaser timeline ----------
# 1) Hook 0-5.3: mystery — drone, ghe bends, bansuri with komal Ga
put(harmonium([hz(-24), hz(-17), hz(-12)], 5.2, .9, att=.8), 0)
for k in range(5): put(ghe(.55, 1.6), .2 + k * 4 * E * 1.0)
for i, (n, d, t) in enumerate([(7, .55, 1.05), (3, .45, 1.65), (2, .45, 2.15), (0, .9, 2.65)]):
    put(bansuri(hz(n + 12), d, .9, vib=1.4), t)
for k in range(8): put(na(.35 + .06 * k, 640 + 20 * k), 3.25 + k * .06)   # roll into "secret power"
put(na(1.0, 700), 3.4); put(cymbal(.5, 1.6), 3.4)
put(harmonium([hz(0), hz(4), hz(7)], 1.8, .6, att=.2), 3.4)
# 2) Comedy groove 5.3-11.0 (call + ammi)
g0 = 5.3
bar = 8 * E
kaharwa(g0, 3, .85)
for i, c in enumerate(['D', 'A', 'G']): chord(c, g0 + i * bar, bar * .98, .55)
theme(g0 + .0, .55, 3)                       # sits under dialogue (ducked)
put(bansuri(hz(14), .12, .5), 7.75); put(bansuri(hz(9), .3, .5, f_from=hz(14)), 7.87)  # "phir se?!" droop
# 3) Door suspense 11.0-15.8
put(slap(1.0, .1), 11.0); put(dha_low(1.0), 11.0)
put(harmonium([hz(-24), hz(-17)], 4.7, .8, att=1.5), 11.05)
t = 12.2; step = E
while t < 15.55:
    put(na(.25 + .45 * (t - 12.2) / 3.4, 560 + 160 * (t - 12.2) / 3.4), t)
    step = max(E / 4, step * .93); t += step
for i, n in enumerate([0, 1, 2, 3, 4, 5, 6, 7]):                  # rising harmonium
    put(harmonium([hz(n - 12), hz(n - 5)], .45, .25 + .06 * i, att=.05), 12.4 + i * .4)
# 4) Reveal 15.8-18.9: HIT + heroic chaal
put(boom(1.0), 15.95); put(cymbal(1.0, 2.6), 15.95)
put(harmonium([hz(-12), hz(-8), hz(-5), hz(0), hz(4), hz(7)], 1.4, 1.4, att=.02), 15.95)
chaal(16.55 + 0 * E, 2, .9)
chord('D', 16.55, bar, .6); chord('A', 16.55 + bar, bar * .9, .6)
for n, d, t in [(0, .3, 16.6), (7, .3, 16.95), (12, .9, 17.3), (11, .25, 18.25), (12, .4, 18.5)]:
    put(bansuri(hz(n + 12), d, .9), t)
# 5) Lift 18.9-24.2: sneaky pluck walk, stop at THUD, light return, wink trill
walk = [0, None, 3, None, 5, 6, 7, None, 5, None, 3, 2]
for k, n in enumerate(walk):
    if n is not None: put(pluck(hz(n - 12), .35, 1.0), 18.95 + k * E * .9)
    if k % 2: put(na(.35, 620), 18.95 + k * E * .9)
put(dha_low(1.2), 20.6)
for k, n in enumerate([7, None, 5, None, 3, 2, 0, None, 3, None, 5, None, 7, 9]):
    if n is not None: put(pluck(hz(n - 12), .3, .7), 21.4 + k * E * .9)
for k in range(6): put(bansuri(hz(16 if k % 2 else 14), .07, .55), 23.45 + k * .07)
# 6) End theme 24.2-30.6
e0 = 24.25
kaharwa(e0, 2, .8, fill_last=False)
for i, c in enumerate(['D', 'A', 'G']): chord(c, e0 + i * bar, (bar if i < 2 else bar / 2) * .98, .55)
theme(e0, .6, 2)
for k in range(8): put(na(.4 + .07 * k, 600 + 25 * k), e0 + 2 * bar + k * E / 2)
fin = e0 + 2.5 * bar
put(ghe(1.0), fin); put(na(1.0), fin); put(cymbal(.7, 1.8), fin)
put(harmonium([hz(-12), hz(-5), hz(0), hz(4), hz(7)], 1.2, 1.0, att=.02), fin)
put(bansuri(hz(12), 1.0, .8), fin)

m = out[:N]
fade = np.clip((DUR - np.arange(N) / SR) / 1.2, 0, 1); m *= fade
m = np.tanh(m * 1.4) / np.tanh(1.4); m /= np.abs(m).max() / .9
w = wave.open('music.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((m * 32767).astype(np.int16).tobytes()); w.close()
print('music ok', DUR, 'fin at', round(fin, 2))
