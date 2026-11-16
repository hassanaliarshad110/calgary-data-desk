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

