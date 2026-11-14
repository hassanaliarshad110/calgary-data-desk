"""Energetic news-Short score + SFX + mix. Music stays audible under the voice
(ducked to ~50%, not buried). Writes mix.wav (-14 LUFS target via ffmpeg after)."""
import numpy as np, json, wave
from scipy.signal import lfilter
SR = 44100
tl = json.load(open('timeline.json')); TOT = tl['total'] + 0.3; N = int(TOT * SR)
rng = np.random.default_rng(7)
def lp(x, a): return lfilter([1 - a], [1, -a], x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i + n] += sig[:n] * g * (1 - pan); R[i:i + n] += sig[:n] * g * (1 + pan)
BPM = 120; beat = 60 / BPM
prog = [57, 53, 48, 55]  # Am F C G roots (A3 F3 C3 G3)
nb = int(TOT / beat) + 1
first = tl['lines']['s02']['start']; twist = tl['lines']['s07']['start']; last = tl['lines']['s08']['start']
for b in range(nb):
    t0 = b * beat; bar = b // 4; root = prog[bar % 4]
    intensity = 0.7 if t0 < first else (1.0 if t0 < twist else 0.8)
    # kick (four on the floor)
    n = int(0.3 * SR); tt = np.arange(n) / SR; f = 50 + 90 * np.exp(-tt * 35)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.55 * intensity, t0)
    # clap/snare on 2 and 4
    if b % 2 == 1 and t0 >= first:
        n = int(0.18 * SR); x = rng.standard_normal(n); x = x - lp(x, 0.6); add(x * np.exp(-np.arange(n) / SR * 22) * 0.16, t0, 1, 0.1)
    # hats on 8ths / 16ths in the main section
    steps = 4 if (first <= t0 < twist) else 2
    for k in range(steps):
        n = int(0.04 * SR); x = rng.standard_normal(n); x = x - lp(x, 0.4)
        add(x * np.exp(-np.arange(n) / SR * 120) * (0.07 if k % 2 else 0.045), t0 + k * beat / steps, 1, -0.3)
    # pulsing bass 8ths
    for k in range(2):
        n = int(beat / 2 * SR * 0.9); tt = np.arange(n) / SR; f = hz(root - 12)
        s = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * tt)
        add(lp(s, 0.85) * np.exp(-tt * 5) * 0.16 * intensity, t0 + k * beat / 2)
    # arp 16ths (minor triad) in main section
    if first <= t0 < last + 6:
        tri = [0, 3, 7, 12] if root in (57,) else ([0, 4, 7, 12])
        for k in range(4):
            n = int(beat / 4 * SR * 0.8); tt = np.arange(n) / SR; f = hz(root + 12 + tri[(b * 4 + k) % 4])
            s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 18)
            add(s * 0.035, t0 + k * beat / 4, 1, 0.35 * (1 if k % 2 else -1))
    # pad per bar
    if b % 4 == 0:
        n = int(4 * beat * SR); tt = np.arange(n) / SR; pad = np.zeros(n)
        for iv in (0, 3, 7) if root == 57 else (0, 4, 7):
            for det in (-0.15, 0.15): pad += np.sin(2 * np.pi * (hz(root + iv) + det) * tt)
        env = np.minimum(1, tt / 0.3) * np.minimum(1, (tt[-1] - tt) / 0.4 + 0.01)
        add(lp(pad, 0.96) * env * 0.02, t0, 1, 0)
# riser into the twist, and drop at event hits
n = int(1.5 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); x = x - lp(x, 0.3 + 0.6 * 0)
add(lp(x, 0.7) * (tt / tt[-1]) ** 2 * 0.25, twist - 1.5)
def boom():
    n = int(1.4 * SR); tt = np.arange(n) / SR; f = 40 + 70 * np.exp(-tt * 7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.5); s += lp(rng.standard_normal(n), 0.9) * np.exp(-tt * 5) * 0.4; return s
def whoosh(d=0.6):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / n; return lp(x, 0.85) * np.sin(np.pi * tt) ** 2 * 0.6
def ding(f=1320, d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * 4) * 0.3
music = np.stack([L, R], 1)
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
put(boom(), 0.0, 0.7); put(boom(), tl['lines']['s01']['start'] + 1.25, 0.8)
for k in ('s02', 's03', 's04', 's05', 's06'):
    put(whoosh(), tl['lines'][k]['start'] - 0.35, 0.5); put(boom(), tl['lines'][k]['start'], 0.55)
put(ding(988), twist + 0.1, 0.5); put(boom(), last, 0.5); put(ding(1318), last + tl['lines']['s08']['dur'] * 0.7, 0.5)
mix = music + S + V[:, None] * 1.0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.95
w = wave.open('mix_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', round(TOT, 2))
