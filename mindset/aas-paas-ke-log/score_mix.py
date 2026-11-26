"""Awazzzz Mindset score (Nov 27, D minor -> F major lift at the "you don't need to be the genius" line): dark cinematic (low strings/pad drone, sparse piano, heartbeat kick, risers into quote
cards, soft boom on the twist), clearly audible, ducked ~45% under the voice. Writes mix_raw.wav (then loudnorm -14)."""
import numpy as np, json, wave
from scipy.signal import lfilter
SR = 44100
tl = json.load(open('timeline.json')); TOT = tl['total']; N = int(TOT * SR) + SR // 2
info = json.load(open('aud_info.json'))
rng = np.random.default_rng(127)
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
W_ = lambda k, i: st(k) + info[k]['words'][i][0]
q1_quote = W_('q1', 2); q2_quote = W_('q2', 2); twist = st('n9'); lift = st('n7'); siena = st('n2'); venafro = st('n3'); clever = W_('n4', 6); ignite = W_('n6', 1); arcflame = W_('n6', 6); smoke = W_('n6', 13); stamp = W_('n8', 13) + 0.3; sent = W_('n10', 12) + 0.3
BPM = 72; beat = 60 / BPM; bar = 4 * beat
dark = [(50, [0, 3, 7]), (46, [0, 4, 7]), (43, [0, 3, 7]), (45, [0, 4, 7])]     # Dm Bb Gm A
hope = [(53, [0, 4, 7]), (48, [0, 4, 7]), (50, [0, 3, 7]), (46, [0, 4, 7])]     # F C Dm Bb
nbar = int(TOT / bar) + 2
for b in range(nbar):
    t0 = b * bar; root, iv = (hope if t0 >= lift - 0.5 else dark)[b % 4]
    n = int(bar * SR) + SR; tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.2) * np.clip((bar + 1.0 - tt) / 1.0, 0, 1)
    # low drone (root + fifth), slightly saw-ish
    dr = np.zeros(n)
    for m, g in ((root - 12, 1.0), (root - 5, 0.5)):
        f = hz(m)
        for k in range(1, 6): dr += np.sin(2 * np.pi * f * k * tt + k) / k * g
    dr = lp(dr, 0.97) * env * 0.10 * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * tt))
    add(dr, t0)
    # strings pad (chord, detuned, slow swell)
    pd = np.zeros(n)
    for v in iv:
        for det in (-0.25, 0.25):
            f = hz(root + 12 + v) + det
            pd += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
    pd = lp(pd, 0.9) * env * (0.028 if t0 < lift else 0.036)
    add(pd, t0, 1, -0.2); add(pd * 0.8, t0 + 0.03, 1, 0.25)
    # sparse piano motif (2 notes per bar, more after the lift)
    notes = [root + 24 + iv[2], root + 24 + iv[1]] if b % 2 == 0 else [root + 24, root + 24 + iv[2], root + 36]
    if t0 >= lift: notes = [root + 24 + iv[0], root + 24 + iv[1], root + 24 + iv[2], root + 36]
    for j, m in enumerate(notes):
        tn = t0 + j * (bar / len(notes)) + (0.0 if j == 0 else 0.05)
        nn = int(2.2 * SR); u = np.arange(nn) / SR; f = hz(m)
        pz = (np.sin(2 * np.pi * f * u) + 0.35 * np.sin(2 * np.pi * 2.002 * f * u) * np.exp(-u * 3) + 0.15 * np.sin(2 * np.pi * 3.01 * f * u) * np.exp(-u * 5)) * np.exp(-u * 1.6) * np.minimum(1, u / 0.004)
        add(pz * 0.05, tn, 1, 0.3 * (1 if j % 2 else -1))
# heartbeat kick (lub-dub on every beat after the hook), off during the quote card reveal peaks a little
for k in range(int(TOT / beat) + 1):
    t0 = k * beat
    if t0 > TOT - 1.0: break
    for off, g in ((0, 1.0), (0.17, 0.6)):
        nn = int(0.35 * SR); u = np.arange(nn) / SR; f = 45 + 55 * np.exp(-u * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 10)
        add(s * 0.42 * g * (0.7 if t0 < st('n2') else 1.0), t0 + off)
def riser(end, d=2.0, g=0.3):
    nn = int(d * SR); u = np.arange(nn) / SR; x = rng.standard_normal(nn)
    sw = np.sin(2 * np.pi * np.cumsum(200 + 900 * (u / d) ** 2) / SR) * 0.25
    s = (lp(x, 0.8 - 0.5 * 0) * 0.7 + sw) * (u / d) ** 2.2
    add(s * g, end - d, 1, 0)
def boom(t, g=0.9):
    nn = int(2.2 * SR); u = np.arange(nn) / SR; f = 32 + 60 * np.exp(-u * 5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 1.8) + lp(rng.standard_normal(nn), 0.95) * np.exp(-u * 4) * 0.5
    add(s * g, t)
def hit(t, g=0.35):  # soft orchestral-ish hit: low string stab + shimmer
    nn = int(2.5 * SR); u = np.arange(nn) / SR; s = np.zeros(nn)
    for m in (38, 50, 57, 62): s += np.sin(2 * np.pi * hz(m) * u)
    s = lp(s, 0.85) * np.exp(-u * 1.5) * np.minimum(1, u / 0.01)
    add(s * g, t)
def whoosh(t, d=0.7, g=0.25):
    nn = int(d * SR); x = rng.standard_normal(nn); u = np.arange(nn) / nn
    add(lp(x, 0.88) * np.sin(np.pi * u) ** 2 * g, t - d / 2, 1, 0.2)
def chime(t, g=0.12, m=86):  # glassy bell for the lantern lighting / message sent
    nn = int(2.0 * SR); u = np.arange(nn) / SR; f = hz(m)
    s_ = (np.sin(2 * np.pi * f * u) + 0.5 * np.sin(2 * np.pi * 2.76 * f * u) * np.exp(-u * 4)) * np.exp(-u * 2.2) * np.minimum(1, u / 0.003)
    add(s_ * g, t, 1, 0.2)
def thud(t, g=0.5):  # stamp: low thump + short tick
    nn = int(0.6 * SR); u = np.arange(nn) / SR
    s_ = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-u * 40)) / SR) * np.exp(-u * 14) + lp(rng.standard_normal(nn), 0.6) * np.exp(-u * 60) * 0.4
    add(s_ * g, t)
boom(0.0, 0.7)                                   # hook opener
hit(siena, 0.3); hit(venafro, 0.3); hit(clever, 0.26)
riser(q1_quote - 0.05, 2.2, 0.32); hit(q1_quote - 0.05, 0.4)
chime(ignite, 0.14, 86); chime(arcflame + 0.9, 0.12, 81); whoosh(smoke, 0.8, 0.2)
riser(q2_quote - 0.05, 1.8, 0.28); hit(q2_quote - 0.05, 0.36)
hit(lift, 0.3)
thud(stamp, 0.6)
boom(twist, 0.9)                                 # the flip
chime(sent, 0.12, 90)
for s_ in tl['scenes'][1:]: whoosh(s_['start'], 0.6, 0.16)
boom(st('n11') - 0.1, 0.4)
music = np.stack([L, R], 1)
def rd(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; w.close(); return a
V = np.zeros(N)
for k, l in Ls.items():
    a = rd(f'aud/{k}.wav'); i = int(l['start'] * SR); V[i:i + len(a)] += a[:N - i]
e = np.clip(lfilter([1 - 0.9994], [1, -0.9994], np.abs(V)) * 22, 0, 1)
g = 0.6 * (1 - 0.45 * e)            # bed clearly audible, ducked ~45% under the voice
music *= g[:, None]
fade = np.ones(N); fe = int((TOT - 0.8) * SR); fade[fe:] = np.linspace(1, 0, N - fe); music *= fade[:, None]
mix = music + V[:, None] * 1.0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.95
w = wave.open('mix_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', round(TOT, 2), 'q1', round(q1_quote, 2), 'twist', round(twist, 2), 'lift', round(lift, 2))
