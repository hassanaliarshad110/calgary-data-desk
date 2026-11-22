"""Awazzzz Mindset score: dark cinematic (low strings/pad drone, sparse piano, heartbeat kick, risers into quote
cards, soft boom on the twist), clearly audible, ducked ~45% under the voice. Writes mix_raw.wav (then loudnorm -14)."""
import numpy as np, json, wave, sys
MODE = sys.argv[1]
from scipy.signal import lfilter
SR = 44100
tl = json.load(open(f'timeline_{MODE}.json')); TOT = tl['total']; N = int(TOT * SR) + SR // 2
info = json.load(open('aud_info.json'))
rng = np.random.default_rng(23)
def lp(x, a): return lfilter([1 - a], [1, -a], x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); 
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i + n] += sig[:n] * g * (1 - pan); R[i:i + n] += sig[:n] * g * (1 + pan)
Ls = tl['lines']; st = lambda k: Ls[k]['start']
def wd(k, word):
    w = Ls[k]['words']
    for i, x in enumerate(w):
        if x[2].lower().strip('"….,?!').startswith(word): return st(k) + x[0]
    return st(k) + w[0][0]
def qstart(k):
    w = Ls[k]['words']
    for x in w:
        if x[2][:1] in '"“…': return st(k) + x[0]
    return st(k) + w[0][0]
BPM = 66; beat = 60 / BPM; bar = 4 * beat
dark = [(50, [0, 3, 7]), (46, [0, 4, 7]), (43, [0, 3, 7]), (45, [0, 4, 7])]     # Dm Bb Gm A
hope = [(41, [0, 4, 7]), (48, [0, 4, 7]), (50, [0, 3, 7]), (46, [0, 4, 7])]     # F C Dm Bb
if MODE == 'long': HOPE = [(st('c2a') - 1.5, st('c3a') - 1.5), (st('c4d'), 1e9)]
else: HOPE = [(st('s2') - 0.5, 1e9)]
ishope = lambda t: any(a <= t < b for a, b in HOPE)
lift = HOPE[0][0]
nbar = int(TOT / bar) + 2
for b in range(nbar):
    t0 = b * bar; root, iv = (hope if ishope(t0) else dark)[b % 4]
    n = int(bar * SR) + SR; tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.2) * np.clip((bar + 1.0 - tt) / 1.0, 0, 1)
    dr = np.zeros(n)
    for m, g in ((root - 12, 1.0), (root - 5, 0.5)):
        f = hz(m)
        for k in range(1, 6): dr += np.sin(2 * np.pi * f * k * tt + k) / k * g
    dr = lp(dr, 0.97) * env * 0.10 * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * tt))
    add(dr, t0)
    pd = np.zeros(n)
    for v in iv:
        for det in (-0.25, 0.25):
            f = hz(root + 12 + v) + det
            pd += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
    pd = lp(pd, 0.9) * env * (0.036 if ishope(t0) else 0.028)
    add(pd, t0, 1, -0.2); add(pd * 0.8, t0 + 0.03, 1, 0.25)
    notes = [root + 24 + iv[2], root + 24 + iv[1]] if b % 2 == 0 else [root + 24, root + 24 + iv[2], root + 36]
    if ishope(t0): notes = [root + 24 + iv[0], root + 24 + iv[1], root + 24 + iv[2], root + 36]
    for j, m in enumerate(notes):
        tn = t0 + j * (bar / len(notes)) + (0.0 if j == 0 else 0.05)
        nn = int(2.2 * SR); u = np.arange(nn) / SR; f = hz(m)
        pz = (np.sin(2 * np.pi * f * u) + 0.35 * np.sin(2 * np.pi * 2.002 * f * u) * np.exp(-u * 3) + 0.15 * np.sin(2 * np.pi * 3.01 * f * u) * np.exp(-u * 5)) * np.exp(-u * 1.6) * np.minimum(1, u / 0.004)
        add(pz * 0.05, tn, 1, 0.3 * (1 if j % 2 else -1))
for k in range(int(TOT / beat) + 1):
    t0 = k * beat
    if t0 > TOT - 1.0: break
    for off, g in ((0, 1.0), (0.17, 0.6)):
        nn = int(0.35 * SR); u = np.arange(nn) / SR; f = 45 + 55 * np.exp(-u * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 10)
        add(s * 0.34 * g * (0.75 if ishope(t0) else 1.0), t0 + off)
def riser(end, d=2.0, g=0.3):
    nn = int(d * SR); u = np.arange(nn) / SR; x = rng.standard_normal(nn)
    sw = np.sin(2 * np.pi * np.cumsum(200 + 900 * (u / d) ** 2) / SR) * 0.25
    s = (lp(x, 0.8) * 0.7 + sw) * (u / d) ** 2.2
    add(s * g, end - d, 1, 0)
def boom(t, g=0.9):
    nn = int(2.2 * SR); u = np.arange(nn) / SR; f = 32 + 60 * np.exp(-u * 5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 1.8) + lp(rng.standard_normal(nn), 0.95) * np.exp(-u * 4) * 0.5
    add(s * g, t)
def hit(t, g=0.35):
    nn = int(2.5 * SR); u = np.arange(nn) / SR; s = np.zeros(nn)
    for m in (38, 50, 57, 62): s += np.sin(2 * np.pi * hz(m) * u)
    s = lp(s, 0.85) * np.exp(-u * 1.5) * np.minimum(1, u / 0.01)
    add(s * g, t)
def whoosh(t, d=0.7, g=0.25):
    nn = int(d * SR); x = rng.standard_normal(nn); u = np.arange(nn) / nn
    add(lp(x, 0.88) * np.sin(np.pi * u) ** 2 * g, t - d / 2, 1, 0.2)
def clank(t, g=0.22):
    nn = int(1.4 * SR); u = np.arange(nn) / SR; s = np.zeros(nn)
    for f, d in ((523, 6), (1187, 9), (1913, 12), (2671, 15), (3420, 20)): s += np.sin(2 * np.pi * f * u + f) * np.exp(-u * d)
    s += np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-u * 30)) / SR) * np.exp(-u * 12) * 1.5
    add(s * g, t, 1, 0.1)
boom(0.0, 0.7)
for k in Ls:
    if Ls[k]['kind'] == 'Q': q = qstart(k); riser(q - 0.05, 2.0, 0.28); hit(q - 0.05, 0.38)
if MODE == 'long':
    boom(wd('h1', 'enemy'), 0.5); boom(wd('c1k', 'wishful'), 0.9); boom(wd('c3e', 'spits'), 0.8); boom(wd('c3k', 'weapon'), 0.9); boom(wd('c4i', 'angry'), 0.5)
    clank(wd('q4', 'dropped') + 0.45, 0.25); boom(wd('q4', 'dropped') + 0.5, 0.4)
    for s_ in tl['scenes']:
        if s_.get('chap'): boom(s_['start'] + 0.1, 0.55); riser(s_['start'] + 0.1, 1.4, 0.18)
    boom(st('c5g') - 0.1, 0.45)
else:
    clank(wd('s1', 'dropped') + 0.45, 0.25); boom(wd('s1', 'dropped') + 0.5, 0.5); boom(wd('sE', 'spits'), 0.8); boom(wd('sB', 'weapon'), 0.9); boom(st('s4') - 0.1, 0.45)
for s_ in tl['scenes'][1:]: whoosh(s_['start'], 0.6, 0.16)
music = np.stack([L, R], 1)
def rd(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; w.close(); return a
V = np.zeros(N)
for k, l in Ls.items():
    a = rd(f'aud/{k}.wav'); i = int(l['start'] * SR); V[i:i + len(a)] += a[:N - i]
e = np.clip(lfilter([1 - 0.9994], [1, -0.9994], np.abs(V)) * 22, 0, 1)
g = 0.6 * (1 - 0.45 * e)
music *= g[:, None]
fade = np.ones(N); fe = int((TOT - 1.2) * SR); fade[fe:] = np.linspace(1, 0, N - fe); music *= fade[:, None]
mix = music + V[:, None] * 1.0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.95
w = wave.open(f'mix_raw_{MODE}.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', MODE, round(TOT, 2))
