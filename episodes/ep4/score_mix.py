"""Awazzzz full-episode score + SFX + voice mix (model: episodes/short_news1/score_mix.py).
Energetic bed audible all the way through: kick/pulse, bass, arp, pad; booms/whooshes on chapter cards and
reveals, riser into the twist. Bed ~0.42 alone, ducked only to ~50% under the voice. Writes mix_raw.wav.
usage: python3 score_mix.py [timeline.json] [out.wav]"""
import numpy as np, json, wave, sys
from scipy.signal import lfilter
SR = 44100
TLF = sys.argv[1] if len(sys.argv) > 1 else 'timeline.json'; OUT = sys.argv[2] if len(sys.argv) > 2 else 'mix_raw.wav'
tl = json.load(open(TLF)); TOT = tl['total'] + 0.5; N = int(TOT * SR)
rng = np.random.default_rng(11)
def lp(x, a): return lfilter([1 - a], [1, -a], x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i + n] += sig[:n] * g * (1 - pan); R[i:i + n] += sig[:n] * g * (1 + pan)
st = {s['id']: s['start'] for s in tl['scenes']}
# sections: (start, progression roots, minor?, intensity, arp on)
PROG = {'tense': [57, 53, 48, 52], 'drive': [57, 53, 48, 55], 'bright': [48, 55, 57, 53], 'dark': [50, 46, 45, 50]}
bounds = [(0, 'tense', 0.85)]
def B(sid, name, inten):
    if sid in st: bounds.append((st[sid], name, inten))
for sid, name, inten in [('title', 'drive', 1.0), ('ch1', 'bright', 0.75), ('deal', 'drive', 0.9), ('ch2', 'tense', 0.85), ('check', 'dark', 0.8),
                         ('ch3', 'dark', 0.85), ('sides', 'tense', 0.75), ('ch4', 'drive', 0.9), ('twist', 'drive', 1.0), ('jeb', 'bright', 0.85),
                         ('question', 'bright', 0.7), ('end', 'bright', 0.9), ('hook', 'drive', 1.0), ('seg', 'drive', 0.95), ('close', 'bright', 0.9)]:
    B(sid, name, inten)
bounds.sort()
def sec(t):
    s = bounds[0]
    for b in bounds:
        if t >= b[0]: s = b
    return s
BPM = 112; beat = 60 / BPM; nb = int(TOT / beat) + 1
for b in range(nb):
    t0 = b * beat
    if t0 > TOT - 0.5: break
    _, name, inten = sec(t0 + 0.01); prog = PROG[name]; root = prog[(b // 4) % 4]
    minor = name in ('tense', 'dark', 'drive') and (b // 4) % 4 == 0
    # kick 4-on-floor (half-time feel in 'dark')
    if name != 'dark' or b % 2 == 0:
        n = int(0.3 * SR); tt = np.arange(n) / SR; f = 50 + 90 * np.exp(-tt * 35)
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.5 * inten, t0)
    if b % 2 == 1:
        n = int(0.18 * SR); x = rng.standard_normal(n); x = x - lp(x, 0.6); add(x * np.exp(-np.arange(n) / SR * 22) * 0.13 * inten, t0, 1, 0.1)
    for k in range(2 if name in ('dark', 'bright') else 4):
        steps = 2 if name in ('dark', 'bright') else 4
        n = int(0.04 * SR); x = rng.standard_normal(n); x = x - lp(x, 0.4)
        add(x * np.exp(-np.arange(n) / SR * 120) * (0.06 if k % 2 else 0.04), t0 + k * beat / steps, 1, -0.3)
    for k in range(2):
        n = int(beat / 2 * SR * 0.9); tt = np.arange(n) / SR; f = hz(root - 12)
        s = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * tt)
        add(lp(s, 0.85) * np.exp(-tt * 5) * 0.15 * inten, t0 + k * beat / 2)
    tri = [0, 3, 7, 12] if minor or name == 'dark' else [0, 4, 7, 12]
    for k in range(4):
        n = int(beat / 4 * SR * 0.8); tt = np.arange(n) / SR; f = hz(root + 12 + tri[(b * 4 + k) % 4])
        s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 18)
        add(s * 0.032 * inten, t0 + k * beat / 4, 1, 0.35 * (1 if k % 2 else -1))
    if b % 4 == 0:
        n = int(4 * beat * SR); tt = np.arange(n) / SR; pad = np.zeros(n)
        for iv in tri[:3]:
            for det in (-0.15, 0.15): pad += np.sin(2 * np.pi * (hz(root + iv) + det) * tt)
        env = np.minimum(1, tt / 0.3) * np.minimum(1, (tt[-1] - tt) / 0.4 + 0.01)
        add(lp(pad, 0.96) * env * 0.022, t0, 1, 0)
fo = int(3 * SR); L[N - fo:] *= np.linspace(1, 0, fo); R[N - fo:] *= np.linspace(1, 0, fo)
music = np.stack([L, R], 1); music /= max(1e-9, np.abs(music).max())
def boom():
    n = int(1.6 * SR); tt = np.arange(n) / SR; f = 40 + 70 * np.exp(-tt * 7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.5); s += lp(rng.standard_normal(n), 0.9) * np.exp(-tt * 5) * 0.4; return s
def whoosh(d=0.7):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / n; return lp(x, 0.85) * np.sin(np.pi * tt) ** 2 * 0.6
def ding(f=1320, d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * 4) * 0.3
def pop():
    n = int(0.08 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * (600 + 900 * np.exp(-tt * 60)) * tt) * np.exp(-tt * 50) * 0.4
def riser(d=1.6):
    n = int(d * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); s = lp(x, 0.7) * (tt / tt[-1]) ** 2 * 0.35
    s += np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / tt[-1]) ** 2) / SR) * (tt / tt[-1]) ** 2 * 0.12; return s
def tick(n_=6):
    n = int(0.03 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 200) * 0.3
# ---- voice
def rd(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; ch = w.getnchannels(); w.close()
    return a.reshape(-1, ch).mean(1) if ch > 1 else a
V = np.zeros(N)
for k, l in tl['lines'].items():
    a = rd(f'aud/{k}.wav'); i = int(l['start'] * SR); V[i:i + len(a)] += a[:N - i]
e = np.clip(lfilter([1 - 0.9993], [1, -0.9993], np.abs(V)) * 25, 0, 1)
g = 0.42 * (1 - 0.5 * e)          # audible bed: ~0.42 alone, ~0.21 under the voice
music *= g[:, None]
S = np.zeros((N, 2))
def put(sig, t, gain=1.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n > 0 and i >= 0: S[i:i + n] += sig[:n, None] * gain
Ls = {k: v['start'] for k, v in tl['lines'].items()}; Ds = {k: v['dur'] for k, v in tl['lines'].items()}
SFX = tl.get('sfx')
if SFX is None:   # full episode cues
    put(boom(), 0.05, 0.7); put(boom(), st.get('title', 0), 0.9); put(whoosh(1.0), st.get('title', 0) - 0.4, 0.6)
    for c in ('ch1', 'ch2', 'ch3', 'ch4'):
        if c in st: put(whoosh(), st[c] - 0.3, 0.6); put(boom(), st[c] + 0.1, 0.6); put(ding(587, 2.0), st[c] + 0.6, 0.5)
    cues = [('blr', 0.5, 'boom', 0.5), ('midnight', 2.6, 'ding', 0.5), ('who', 1.0, 'boom', 0.5), ('promise', 0.3, 'pop', 0.6),
            ('y1997', 0.4, 'pop', 0.4), ('deal', 1.4, 'pop', 0.5), ('tease1', 0.2, 'boom', 0.6), ('reports', 1.6, 'boom', 0.45),
            ('quarter', 1.2, 'boom', 0.55), ('tester', 1.2, 'ding', 0.5), ('done', 4.0, 'boom', 0.5), ('bookings', 0.3, 'boom', 0.55),
            ('price', 0.8, 'pop', 0.6), ('ticket', 2.6, 'boom', 0.5), ('next', 1.4, 'boom', 0.5), ('end', 0.3, 'pop', 0.6)]
    for sid, off, kind, gn in cues:
        if sid in st: put({'boom': boom, 'ding': ding, 'pop': pop}[kind](), st[sid] + off, gn)
    for k in ('n06',):
        if k in Ls: put(pop(), Ls[k] + Ds[k] * 0.42, 0.5); put(pop(), Ls[k] + Ds[k] * 0.58, 0.5)
    if 'n08' in Ls: put(boom(), Ls['n08'], 0.5)
    if 'n11' in Ls: put(ding(1320), Ls['n11'] + Ds['n11'] * 0.62, 0.5)
    if 'n18' in Ls: put(boom(), Ls['n18'] + Ds['n18'] * 0.32, 0.5)
    if 'n24' in Ls:
        for j in range(3): put(pop(), Ls['n24'] + Ds['n24'] * [0, 0.42, 0.66][j], 0.5)
        for j in range(16): put(tick(), Ls['n24'] + Ds['n24'] * 0.66 + j * 0.1, 0.4)
    if 'twist' in st: put(riser(1.8), st['twist'] - 1.7, 0.8); put(boom(), st['twist'] + 0.05, 0.9)
    if 'n35' in Ls: put(boom(), Ls['n35'] + Ds['n35'] * 0.4, 0.6)
    if 'n36' in Ls:
        for j, a in enumerate((0.18, 0.45, 0.75)): put(pop(), Ls['n36'] + Ds['n36'] * a, 0.5)
    if 'end' in st: put(ding(1318), st['end'] + 1.8, 0.5); put(ding(1760, 1.5), st['end'] + 2.4, 0.4)
else:   # explicit cue list [[t, kind, gain], ...] (Shorts)
    for t, kind, gn in SFX: put({'boom': boom, 'ding': ding, 'pop': pop, 'whoosh': whoosh, 'riser': riser}[kind](), t, gn)
mix = music + S * 0.8 + V[:, None] * 1.0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.95
w = wave.open(OUT, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
# listen-check: music level under narration vs. alone
vm = e > 0.5; mm = np.sqrt((music ** 2).mean(1))
print('ok', round(TOT, 2), 'music rms under voice', round(float(mm[vm].mean()), 4), 'alone', round(float(mm[~vm].mean()), 4) if (~vm).any() else '-')
