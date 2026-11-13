"""Original background score for Shia Voice episodes (numpy only, no samples).
Maqam Hijaz on D (D Eb F# G A Bb C), with a tanpura-like drone, string pad, oud plucks, a ney-like flute and a frame drum (daf).
Each scene gets a mood; moods crossfade at scene boundaries.

    from score import build_score
    x = build_score(starts, durs, moods, seed=1)   # float32 mono 44.1 kHz

Moods: lament, tender, tension, evidence, procession, grave, end
For 'tension', impact=<seconds into the scene> adds a hit and then a held, hollow sustain.
"""
import numpy as np
SR = 44100
D3 = 146.83
# semitone offsets of Hijaz on D
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19]
def hz(semi, base=D3): return base * 2 ** (semi / 12)
def t_(d): return np.arange(int(SR * d)) / SR

def lp(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR); y = np.empty_like(x); acc = 0.0
    # vectorised one-pole via scipy-free recursion in chunks
    from itertools import accumulate
    y = np.fromiter(accumulate(x, lambda p, v: p + a * (v - p)), float, len(x))
    return y
def lpf(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))
def hpf(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / max(cutoff, 1)) ** 4); return np.fft.irfft(X, len(x))
def adsr(n, a, r):
    e = np.ones(n); na, nr = min(n, int(SR * a)), min(n, int(SR * r))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def reverb(x, wet=.35):
    y = x.copy()
    for dl, g in ((0.031, .5), (0.047, .45), (0.071, .4), (0.113, .33), (0.173, .27), (0.241, .2), (0.337, .14)):
        k = int(SR * dl); y[k:] += x[:-k] * g * wet * 2
    return lpf(y, 6000)
def place(buf, x, at, g=1.0):
    s = int(at * SR)
    if s >= len(buf): return
    e = min(len(buf), s + len(x)); buf[s:e] += x[:e - s] * g

rng = np.random.default_rng(7)
def drone(d, base=D3 / 2):
    t = t_(d); x = np.zeros_like(t)
    for f, g in ((base, 1), (base * 1.5, .6), (base * 2, .45), (base * 3, .2), (base * 4, .12)):
        x += g * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (0.85 + 0.15 * np.sin(2 * np.pi * rng.uniform(.05, .2) * t))
    return lpf(x, 1400) * 0.3
def strings(freqs, d, bright=1800):
    t = t_(d); x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0, 0.13):
            ff = f * 2 ** (det / 12)
            x += 2 * ((t * ff + rng.uniform()) % 1) - 1
    x = lpf(x, bright) * (0.9 + 0.1 * np.sin(2 * np.pi * 5.2 * t))
    return x / (len(freqs) * 3) * adsr(len(t), min(2.0, d / 3), min(2.0, d / 3))
def oud(f, d=1.6):
    n = int(SR * d); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return lpf(out, 3500) * np.exp(-t_(d) * 1.4)
def ney(f, d):
    t = t_(d); vib = 1 + 0.006 * np.sin(2 * np.pi * 5 * t) * np.clip(t / 0.6, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = hpf(lpf(rng.uniform(-1, 1, len(t)), 3000), 800) * 0.18
    return (tone + breath) * adsr(len(t), 0.35, 0.6) * 0.5
def daf(low=True):
    d = 0.6; t = t_(d)
    x = np.sin(2 * np.pi * (70 if low else 140) * t * (1 - .3 * t)) * np.exp(-t * (7 if low else 14))
    x += lpf(rng.uniform(-1, 1, len(t)), 2500) * np.exp(-t * 35) * (0.25 if low else 0.5)
    return x
def boom(d=3.0):
    t = t_(d); return (np.sin(2 * np.pi * 42 * t) * np.exp(-t * 1.6) + lpf(rng.uniform(-1, 1, len(t)), 300) * np.exp(-t * 2.5) * .8)

def melody(phrase, d, start=0.8, step=1.6, octave=12):
    """phrase: list of scale-degree indices (HIJAZ), None = rest"""
    buf = np.zeros(int(SR * d)); at = start
    for deg in phrase:
        if at > d - 1: break
        if deg is not None:
            ln = step * (1.6 if deg == phrase[-1] else 1.0)
            place(buf, ney(hz(HIJAZ[deg] + octave), ln + .4), at, 1.0)
        at += step
    return buf

def mood_bed(mood, d, impact=None):
    n = int(SR * d); buf = np.zeros(n)
    if mood == 'lament':
        buf += drone(d) * .9
        buf += strings([hz(0), hz(5), hz(8)], d, 1500) * .55          # D G Bb (G minor colour over D)
        buf += melody([4, 5, 4, 2, 3, 2, 1, 0], d, 1.2, 1.7) * .55       # A Bb A F# G F# Eb D
    elif mood == 'tender':
        buf += drone(d) * .5
        buf += strings([hz(0), hz(4), hz(7)], d, 2200) * .75            # D F# A
        for i, at in enumerate(np.arange(0.5, d - 1, 0.75)):
            deg = [0, 2, 4, 7, 4, 2][i % 6]
            place(buf, oud(hz(HIJAZ[deg]), 1.4), at, .6)
    elif mood == 'tension':
        buf += drone(d, D3 / 4) * .8
        trem = strings([hz(-12), hz(-11)], d, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t_(d)) ** 2)
        buf += trem * .7
        hit = impact if impact is not None else d * .5
        at, bpm = 0.4, 64
        while at < hit - .1:
            place(buf, daf(True), at, .7); at += 60 / bpm; bpm = min(132, bpm * 1.07)
        if impact is not None:
            place(buf, boom(3.5), hit, 1.3)
            tail = t_(d)[int(SR * hit):]
            buf[int(SR * hit):] *= np.clip((tail - hit) / 1.5, 0.15, 1) if len(tail) else 1
            place(buf, melody([4, 3, 2, 1, 0], d - hit - .5, 1.0, 1.6) * .6, hit + 1.0)
    elif mood == 'evidence':
        buf += drone(d) * .5
        buf += strings([hz(5), hz(8), hz(12)], d, 1600) * .8            # G Bb D
        for at in np.arange(0.5, d - .3, 1.0):
            place(buf, daf(False), at, .3)
    elif mood == 'procession':
        buf += drone(d) * .8
        buf += strings([hz(0), hz(7)], d, 1200) * .45
        for at in np.arange(0.6, d - .5, 60 / 52):
            place(buf, daf(True), at, .55)
        buf += melody([0, 1, 2, None, 2, 1, 0], d, 1.8, 2.0) * .45
    elif mood == 'grave':
        buf += drone(d) * .8
        buf += strings([hz(-12), hz(0), hz(1)], d, 900) * .4
        buf += melody([7, None, 6, 5, 4], d, 2.0, 2.2) * .45
    elif mood == 'end':
        buf += drone(d) * .5
        buf += strings([hz(0), hz(4), hz(7), hz(14)], d, 2600) * .9     # D F# A E
        for i, at in enumerate(np.arange(0.4, d - 1.2, 0.6)):
            place(buf, oud(hz(HIJAZ[[0, 4, 7, 9][i % 4]]), 1.6), at, .55)
    return buf

def build_score(starts, durs, moods, impacts=None, xf=1.2):
    total = starts[-1] + durs[-1]
    out = np.zeros(int(SR * (total + 2)))
    impacts = impacts or {}
    for i, (s, d, m) in enumerate(zip(starts, durs, moods)):
        a = max(0, s - xf / 2); dd = d + xf + (s - a)
        bed = mood_bed(m, dd, impacts.get(i) + (s - a) if i in impacts else None)
        bed *= adsr(len(bed), xf, xf)
        place(out, bed, a)
    out = reverb(out, .3)
    out = hpf(out, 40)
    return (out / (np.abs(out).max() + 1e-9) * .9).astype(np.float32)
