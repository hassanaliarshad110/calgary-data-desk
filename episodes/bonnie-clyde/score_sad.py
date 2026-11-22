"""Awazzzz — Bonnie & Clyde: sad score (slow piano in A minor, string pad, low drone, music box at the end).
Music drops out for the ambush shots, returns softly. Ducked ~50% under the voice. Writes mix_raw.wav."""
import numpy as np, json, wave
from scipy.signal import lfilter
SR = 44100
tl = json.load(open('timeline.json')); TOT = tl['total']; N = int(TOT * SR) + SR // 2
rng = np.random.default_rng(7)
def lp(x, a): return lfilter([1 - a], [1, -a], x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
Lc = np.zeros(N); Rc = np.zeros(N)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    Lc[i:i + n] += sig[:n] * g * (1 - pan); Rc[i:i + n] += sig[:n] * g * (1 + pan)
Ls = tl['lines']; SC = {s['id']: s for s in tl['scenes']}
shots0 = SC['shots']['start']; shots1 = SC['ages']['start'] + 0.3
gta0 = SC['ch6']['start']; gta1 = SC['empty']['start']; endbox = SC['empty']['start']
BPM = 66; beat = 60 / BPM; bar = 4 * beat
progA = [(57, [0, 3, 7]), (53, [0, 4, 7]), (48, [0, 4, 7]), (55, [0, 4, 7])]   # Am F C G
progB = [(57, [0, 3, 7]), (53, [0, 4, 7]), (50, [0, 3, 7]), (52, [0, 4, 7])]   # Am F Dm E
def piano(m, t0, g=0.05, pan=0.0, d=3.0):
    nn = int(d * SR); u = np.arange(nn) / SR; f = hz(m)
    pz = (np.sin(2 * np.pi * f * u) + 0.4 * np.sin(2 * np.pi * 2.003 * f * u) * np.exp(-u * 2.5) + 0.15 * np.sin(2 * np.pi * 3.01 * f * u) * np.exp(-u * 4)) * np.exp(-u * 1.1) * np.minimum(1, u / 0.004)
    add(pz * g, t0, 1, pan); add(pz * g * 0.25, t0 + 0.11, 1, -pan)  # small room echo
def mbox(m, t0, g=0.035):
    nn = int(2.0 * SR); u = np.arange(nn) / SR; f = hz(m)
    s = (np.sin(2 * np.pi * f * u) + 0.3 * np.sin(2 * np.pi * 4.2 * f * u) * np.exp(-u * 8)) * np.exp(-u * 2.2) * np.minimum(1, u / 0.002)
    add(s * g, t0, 1, 0.2)
nbar = int(TOT / bar) + 2
for b in range(nbar):
    t0 = b * bar
    if shots0 - 0.5 <= t0 < shots1 - bar * 0.5: continue
    prog = progB if (b // 4) % 2 else progA
    root, iv = prog[b % 4]
    gta = gta0 <= t0 < gta1
    n = int(bar * SR) + SR; tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.5) * np.clip((bar + 1.0 - tt) / 1.0, 0, 1)
    dr = np.zeros(n)
    for m, g in ((root - 24, 1.0), (root - 17, 0.45)):
        f = hz(m)
        for k in range(1, 5): dr += np.sin(2 * np.pi * f * k * tt + k) / k * g
    add(lp(dr, 0.975) * env * 0.09, t0)
    pd = np.zeros(n)
    for v in iv:
        for det in (-0.3, 0.3):
            f = hz(root + v) + det
            pd += np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.1 * np.sin(2 * np.pi * 3 * f * tt)
    vib = 1 + 0.12 * np.sin(2 * np.pi * 0.2 * tt)
    pd = lp(pd, 0.9) * env * vib * (0.024 if gta else 0.03)
    add(pd, t0, 1, -0.25); add(pd * 0.8, t0 + 0.04, 1, 0.25)
    # piano: slow broken chord + a falling melody note every other bar
    arp = [root + 12 + iv[0], root + 12 + iv[1], root + 12 + iv[2], root + 24 + iv[0]]
    for j, m in enumerate(arp + arp[::-1][1:3]):
        piano(m, t0 + j * bar / 6, 0.042, 0.3 * (1 if j % 2 else -1))
    if b % 2 == 1:
        mel = [root + 24 + iv[2], root + 24 + iv[1]]
        for j, m in enumerate(mel): piano(m, t0 + beat * (1.5 + j * 1.5), 0.05, 0.1, 3.5)
    if t0 >= endbox:
        for j, m in enumerate([root + 36 + iv[2], root + 36 + iv[1], root + 36 + iv[0], root + 36 + iv[1]]): mbox(m, t0 + j * beat)
def boom(t, g=0.9, d=3.0):
    nn = int(d * SR); u = np.arange(nn) / SR; f = 30 + 50 * np.exp(-u * 4)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 1.3) + lp(rng.standard_normal(nn), 0.96) * np.exp(-u * 3) * 0.4
    add(s * g, t)
def whoosh(t, d=0.9, g=0.12):
    nn = int(d * SR); x = rng.standard_normal(nn); u = np.arange(nn) / nn
    add(lp(x, 0.9) * np.sin(np.pi * u) ** 2 * g, t - d / 2, 1, 0.2)
def riser(end, d=2.5, g=0.18):
    nn = int(d * SR); u = np.arange(nn) / SR
    s = lp(rng.standard_normal(nn), 0.85) * (u / d) ** 2.5
    add(s * g, end - d)
def bell(t, g=0.12):
    nn = int(5 * SR); u = np.arange(nn) / SR; s = np.zeros(nn)
    for r, a in ((1, 1), (2.76, 0.5), (5.4, 0.25)): s += np.sin(2 * np.pi * hz(45) * r * u) * a * np.exp(-u * (0.8 + r * 0.3))
    add(s * g, t)
boom(0.15, 0.5)
for s_ in tl['scenes'][1:]:
    if s_['id'].startswith('ch'): whoosh(s_['start'], 1.0, 0.14); bell(s_['start'] + 0.3, 0.06)
# ambush: rising tension, then a single deep impact and a muffled rattle; then silence
riser(shots0 + 0.2, 4.0, 0.22)
for k in range(14):
    tk = shots0 + 0.25 + k * 0.09 + rng.random() * 0.03
    nn = int(0.25 * SR); u = np.arange(nn) / SR
    add(lp(rng.standard_normal(nn), 0.92) * np.exp(-u * 25) * 0.35 * (1 - k / 20), tk, 1, (rng.random() - 0.5) * 0.6)
boom(shots0 + 0.2, 1.0, 4.0)
bell(SC['empty']['start'] + 0.5, 0.1); bell(SC['graves']['start'] + 0.3, 0.08)
music = np.stack([Lc, Rc], 1)
def rd(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; w.close(); return a
V = np.zeros(N)
for k, l in Ls.items():
    a = rd(f'aud/{k}.wav'); i = int(l['start'] * SR); V[i:i + len(a)] += a[:N - i]
e = np.clip(lfilter([1 - 0.9994], [1, -0.9994], np.abs(V)) * 22, 0, 1)
g = 0.55 * (1 - 0.5 * e)
music *= g[:, None]
fade = np.ones(N); fe = int((TOT - 1.5) * SR); fade[fe:] = np.linspace(1, 0, N - fe); music *= fade[:, None]
mix = music + V[:, None] * 1.0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.95
w = wave.open('mix_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', round(TOT, 2), 'shots', round(shots0, 2))
