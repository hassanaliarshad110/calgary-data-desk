#!/usr/bin/env python3
"""Studio audio library: original synthesized SFX, ambiences and music beds (numpy only, 44.1 kHz),
plus a mixer with voice ducking.  Everything here is generated from code, so it is royalty-free.

  python3 audio.py build <outdir>      -> writes the whole SFX / ambience / music library as WAV
  from audio import *                 -> use sfx functions, music beds and Mix in scene scripts
"""
import numpy as np, wave, os, sys, json
SR = 44100
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=0.2, sus=1.0):
    e = np.ones(n) * sus; ia = max(1, int(a * SR)); ir = max(1, int(r * SR))
    e[:ia] = np.linspace(0, 1, ia); e[-ir:] *= np.linspace(1, 0, ir) if ir < n else 1; return e
def expdec(n, k): return np.exp(-np.arange(n) / SR * k)
def lp(x, a):  # one-pole lowpass, a in (0,1]: smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def lpf(x, cutoff):  # fast FFT brickwall-ish lowpass
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > cutoff] *= np.exp(-(f[f > cutoff] - cutoff) / (cutoff * 0.3)); return np.fft.irfft(X, len(x))
def hpf(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f < cutoff] *= (f[f < cutoff] / cutoff) ** 2; return np.fft.irfft(X, len(x))
def bpf(x, lo, hi): return hpf(lpf(x, hi), lo)
def noise(d): return rng.uniform(-1, 1, int(SR * d))
def sine(f, d, ph=0): t = t_(d); return np.sin(2 * np.pi * (np.cumsum(np.broadcast_to(f, t.shape)) / SR) + ph) if np.ndim(f) else np.sin(2 * np.pi * f * t + ph)
def sweepf(f0, f1, d, curve='exp'):
    t = t_(d); k = t / d; f = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def norm(x, peak=0.9): m = np.max(np.abs(x)) or 1; return x / m * peak
def saw(f, d): t = t_(d); return 2 * ((t * f) % 1) - 1
def sq(f, d, duty=0.5): t = t_(d); return np.where((t * f) % 1 < duty, 1.0, -1.0)
def reverb(x, wet=0.25, size=0.6):
    out = x.copy()
    for dly, g in [(0.029, .5), (0.037, .45), (0.041, .4), (0.053, .35), (0.067, .3), (0.079, .25)]:
        d = int(dly * SR * (1 + size)); y = np.zeros(len(x) + d * 6)
        for k in range(6): y[d * k:d * k + len(x)] += x * (g * size) ** k * (0.9 ** k)
        out = out + wet * y[:len(x)] * 0.35
    return out
def write(path, x, sr=SR):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True); x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype('<i2').tobytes())
def read(path):
    with wave.open(path) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes(); a = np.frombuffer(w.readframes(n), '<i2').astype(float) / 32768
    a = a.reshape(-1, ch).mean(1)
    if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    return a

# ------------------------------------------------------------------ SFX
def whoosh(d=0.6, up=True):
    n = noise(d); k = t_(d) / d; e = np.sin(np.pi * k) ** 2
    lo = lpf(n, 2500) * e; return norm(bpf(lo, 300, 3000) * e)
def swoosh_news(d=0.9):  # broadcast transition: filtered noise + rising tone + sub hit
    w = whoosh(d) * 0.7; tone = sweepf(180, 1400, d) * np.sin(np.pi * t_(d) / d) ** 3 * 0.25
    hit = np.zeros(int(SR * d)); h = sine(55, 0.5) * expdec(int(SR * 0.5), 6); hit[-len(h):] += h[:len(hit)] * 0.0
    return norm(w + tone)
def pop(): d = 0.12; return norm(sweepf(900, 200, d) * expdec(int(SR * d), 40))
def boing(d=0.7): t = t_(d); f = 220 + 140 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(len(t), 4))
def slide_whistle(d=0.8, up=True): return norm(sweepf(500, 1800, d) if up else sweepf(1800, 400, d)) * env(int(SR * d), 0.02, 0.1) * 0.8
def bonk(): d = 0.35; x = sine(180, d) * expdec(int(SR * d), 18) + sine(420, d) * expdec(int(SR * d), 30) * 0.5 + lpf(noise(d), 3000) * expdec(int(SR * d), 60) * 0.6; return norm(x)
def slap(): d = 0.25; return norm(bpf(noise(d), 800, 6000) * expdec(int(SR * d), 35) + sine(150, d) * expdec(int(SR * d), 25) * 0.4)
def punch(): d = 0.4; return norm(sine(70, d) * expdec(int(SR * d), 12) + lpf(noise(d), 1800) * expdec(int(SR * d), 25) * 0.9)
def impact_boom(d=2.0): x = sine(45, d) * expdec(int(SR * d), 2.5) + lpf(noise(d), 600) * expdec(int(SR * d), 3) * 0.8; return norm(reverb(x, 0.3))
def thud(): d = 0.3; return norm(sine(90, d) * expdec(int(SR * d), 20) + lpf(noise(d), 500) * expdec(int(SR * d), 30))
def footstep(surface='hard', i=0):
    d = 0.18; base = noise(d) * expdec(int(SR * d), 45)
    if surface == 'hard': x = bpf(base, 600, 5000) + sine(110 + i * 7, d) * expdec(int(SR * d), 40) * 0.5
    elif surface == 'grass': x = bpf(noise(d), 1500, 9000) * expdec(int(SR * d), 25) * np.abs(noise(d)) ** 0.3
    elif surface == 'snow': x = bpf(noise(d * 1.4), 400, 3000) * expdec(int(SR * d * 1.4), 14) * (0.5 + 0.5 * np.abs(noise(d * 1.4)))
    else: x = lpf(base, 1200)
    return norm(x, 0.7)
def door_close():
    a = sine(80, .3) * expdec(int(SR * .3), 12) + lpf(noise(.3), 900) * expdec(int(SR * .3), 25)
    b = bpf(noise(.3), 2000, 6000) * expdec(int(SR * .3), 50) * .3
    return norm(np.concatenate([a + b, np.zeros(int(SR * .3))]))
def ding(f=1320): d = 1.2; return norm(sum(sine(f * k, d) * expdec(int(SR * d), 3 + k * 2) / k for k in (1, 2.76, 5.4)))
def chime_up(): return norm(np.concatenate([ding(1047)[:int(SR * .14)], ding(1319)[:int(SR * .14)], ding(1568)]))
def camera_shutter(): d = 0.15; x = bpf(noise(d), 2000, 9000) * expdec(int(SR * d), 60); return norm(np.concatenate([x, np.zeros(int(SR * .05)), x * 0.7]))
def typewriter_key(): d = 0.07; return norm(bpf(noise(d), 1500, 8000) * expdec(int(SR * d), 90) + sine(1800, d) * expdec(int(SR * d), 120) * 0.3)
def ticker_blip(): d = 0.08; return norm(sq(1760, d, 0.3) * expdec(int(SR * d), 50) * 0.5)
def riser(d=3.0): x = sweepf(80, 1200, d) * 0.3 + bpf(noise(d), 500, 6000) * (t_(d) / d) ** 2; return norm(x * (t_(d) / d) ** 1.5)
def magic_sparkle(d=1.2):
    x = np.zeros(int(SR * d))
    for i in range(18):
        s = int(rng.uniform(0, d - 0.3) * SR); f = rng.uniform(1800, 4200); g = ding(f)[:int(SR * 0.3)] * 0.4; x[s:s + len(g)] += g
    return norm(reverb(x, 0.4))
def explosion_sfx(d=2.5): return norm(impact_boom(d) * 0.7 + lpf(noise(d), 3000) * expdec(int(SR * d), 4) * 0.6)
def splash_sfx(d=0.8): x = bpf(noise(d), 300, 7000) * expdec(int(SR * d), 6) * (1 + 0.5 * np.sin(2 * np.pi * 30 * t_(d))); return norm(x)
def thunder(d=3.0): x = lpf(noise(d), 400) * (expdec(int(SR * d), 1.5)) * (1 + 0.6 * lpf(np.abs(noise(d)), 0.001 * 20)); return norm(x)
def cartoon_run(d=1.0): return norm(sum(np.roll(np.pad(footstep('hard', i) * .6, (0, int(SR * d))), int(i * SR * 0.09))[:int(SR * d)] for i in range(int(d / 0.09))))
def heartbeat(): return norm(np.concatenate([thud()[:int(SR * .15)], np.zeros(int(SR * .12)), thud()[:int(SR * .15)] * .7, np.zeros(int(SR * .6))]))
def glitch(d=0.5): x = sq(rng.uniform(100, 900), d, 0.4) * (rng.uniform(-1, 1, int(SR * d)) > 0.2) * 0.4 + bpf(noise(d), 2000, 8000) * 0.3; return norm(x * env(int(SR * d), .01, .1))

# ------------------------------------------------------------------ ambiences (loopable, crossfaded ends)
def loopify(x, xf=1.0):
    n = int(SR * xf); a = x[:n] * np.linspace(0, 1, n); b = x[-n:] * np.linspace(1, 0, n); return np.concatenate([x[n:-n], a + b])
def amb_rain(d=20): return norm(loopify(bpf(noise(d), 600, 9000) * 0.6 + lpf(noise(d), 400) * 0.4), 0.5)
def amb_wind(d=20): n = noise(d); m = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t_(d)) * np.sin(2 * np.pi * 0.13 * t_(d) + 1); return norm(loopify(lpf(n, 700) * m), 0.5)
def amb_city(d=20):
    x = lpf(noise(d), 300) * 0.5 + bpf(noise(d), 300, 2000) * 0.15
    for i in range(8):  # car passes
        s = rng.uniform(0, d - 4); p = int(s * SR); L = int(SR * 4); e = np.sin(np.linspace(0, np.pi, L)) ** 2; x[p:p + L] += lpf(noise(4), 900) * e * 0.6
    for i in range(5):
        s = int(rng.uniform(0, d - 1) * SR); h = sq(420, .3, .5) * env(int(SR * .3), .01, .05) * 0.08; x[s:s + len(h)] += h
    return norm(loopify(x), 0.5)
def amb_park(d=20):
    x = lpf(noise(d), 500) * 0.15
    for i in range(30):  # birds: FM chirps
        s = int(rng.uniform(0, d - .5) * SR); dd = rng.uniform(.08, .25); f0 = rng.uniform(2500, 4500)
        c = sweepf(f0, f0 * rng.uniform(.7, 1.4), dd) * env(int(SR * dd), .01, .05) * 0.25
        for k in range(rng.integers(1, 4)): x[s + k * int(SR * .12):s + k * int(SR * .12) + len(c)] += c
    return norm(loopify(x), 0.5)
def amb_office(d=20): x = lpf(noise(d), 200) * .4 + sine(120, d) * .03;  return norm(loopify(x + sum(np.pad(typewriter_key() * .2, (s, int(SR * d) - s - int(SR * .07)))[:int(SR * d)] for s in rng.integers(0, int(SR * (d - .1)), 60))), 0.4)
def amb_newsroom(d=20):
    x = amb_office(d) * 0.6; return norm(x + sine(60, len(x) / SR) * 0.04, 0.4)
def amb_fire(d=20):
    x = lpf(noise(d), 800) * .4
    for s in rng.integers(0, int(SR * (d - .05)), 400): c = bpf(noise(.02), 1500, 8000) * expdec(int(SR * .02), 200) * rng.uniform(.2, 1); x[s:s + len(c)] += c
    return norm(loopify(x), 0.5)
def amb_room_tone(d=20): return norm(loopify(lpf(noise(d), 250)), 0.15)

# ------------------------------------------------------------------ music beds
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f, d=0.5, bright=0.5):
    n = int(SR * d); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.996 + bright * 0.003)
    return out
def pad(freqs, d, bright=1200):
    x = sum(saw(f * (1 + dt), d) for f in freqs for dt in (-0.004, 0.0, 0.005)); return lpf(x, bright) * env(int(SR * d), 0.8, 1.2) / (len(freqs) * 3)
def piano(f, d=1.5): t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2 + k * 1.5)) / k ** 1.3 for k in range(1, 7)); return x * env(len(t), 0.003, 0.3)
def kick(): d = 0.4; return sweepf(140, 45, d) * expdec(int(SR * d), 9)
def snare(): d = 0.25; return bpf(noise(d), 1200, 8000) * expdec(int(SR * d), 22) * 0.7 + sine(190, d) * expdec(int(SR * d), 30) * 0.4
def hat(): d = 0.06; return hpf(noise(d), 7000) * expdec(int(SR * d), 70) * 0.35
def place(buf, x, at, g=1.0):
    s = int(at * SR); e = min(len(buf), s + len(x));
    if s < len(buf): buf[s:e] += x[:e - s] * g
def music_documentary(d=60, bpm=72):
    """Calm, cinematic: minor-key pad + sparse piano motif + low pulse (CalgaryInsight)."""
    out = np.zeros(int(SR * d)); beat = 60 / bpm; prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    bar = beat * 4
    for i in range(int(d / bar) + 1):
        ch = prog[i % 4]; place(out, pad([NOTE(n) for n in ch] + [NOTE(ch[0] - 12)], bar + 1.5, 1500), i * bar, 0.5)
        for j, n in enumerate([ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]):
            if (i + j) % 3 != 2: place(out, piano(NOTE(n), 2.0), i * bar + j * beat, 0.16)
        place(out, sine(NOTE(ch[0] - 24), beat * 2) * env(int(SR * beat * 2), 0.05, 0.6), i * bar, 0.18)
    out = reverb(out, 0.35); return norm(out * env(len(out), 2, 3), 0.8)
def music_news(d=40, bpm=120):
    """Driving broadcast bed: 4-on-floor, synth stabs, rising arps (News Channel)."""
    out = np.zeros(int(SR * d)); beat = 60 / bpm; prog = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]
    for b in range(int(d / beat)):
        at = b * beat; place(out, kick(), at, 0.7); place(out, hat(), at + beat / 2, 0.6)
        if b % 2 == 1: place(out, snare(), at, 0.45)
        ch = prog[(b // 8) % 4]
        if b % 4 == 0: place(out, lpf(sum(saw(NOTE(n), beat * 0.9) for n in ch), 2600) * env(int(SR * beat * .9), .005, .3) / 4, at, 0.35)
        for k in range(2): place(out, sq(NOTE(ch[(b * 2 + k) % 4] + 12), beat / 2 * .8, .3) * env(int(SR * beat / 2 * .8), .003, .05) * 0.12, at + k * beat / 2)
        place(out, saw(NOTE(ch[0] - 24), beat * .9) * env(int(SR * beat * .9), .005, .1) * 0.25, at)
    return norm(lpf(out, 9000) * env(len(out), .05, 2), 0.8)
def music_cartoon(d=40, bpm=128):
    """Bouncy comedy bed: oom-pah bass, plucked melody, woodblock (Cartoon Channel)."""
    out = np.zeros(int(SR * d)); beat = 60 / bpm; scale = [60, 62, 64, 65, 67, 69, 71, 72]; prog = [[48, 64, 67], [53, 65, 69], [55, 65, 71], [48, 64, 67]]
    mel = [0, 2, 4, 2, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 0]
    for b in range(int(d / beat)):
        at = b * beat; ch = prog[(b // 4) % 4]
        place(out, pluck(NOTE(ch[0] - (0 if b % 2 == 0 else -7)), beat * .9, .2), at, 0.5 if b % 2 == 0 else 0.35)
        if b % 2 == 1: place(out, sum(pluck(NOTE(n), beat * .5, .6) for n in ch[1:]) * 0.5, at, 0.35)
        place(out, bpf(noise(.04), 900, 2500) * expdec(int(SR * .04), 80), at + beat / 2, 0.25)
        n = mel[b % 16]; place(out, pluck(NOTE(scale[n] + 12), beat * .8, .7), at, 0.33)
    return norm(out * env(len(out), .02, 2), 0.8)
def music_suspense(d=30):
    out = pad([NOTE(45), NOTE(46), NOTE(52)], d, 700) * 0.6 + sine(NOTE(33), d) * 0.15
    pulse = np.zeros(int(SR * d))
    for i in range(int(d / 0.8)): place(pulse, heartbeat(), i * 0.8 * 2, 0.3)
    return norm(reverb(out + pulse * 0.4, 0.3) * env(int(SR * d), 3, 3), 0.8)
def sting_news(d=3.0):
    out = np.zeros(int(SR * d)); place(out, riser(1.0) * 0.5, 0); place(out, impact_boom(2.0), 1.0, 0.8)
    place(out, lpf(sum(saw(NOTE(n), 1.8) for n in [50, 57, 62, 66, 69]), 3000) * expdec(int(SR * 1.8), 1.5) / 5, 1.0, 0.8)
    return norm(reverb(out, 0.25))

# ------------------------------------------------------------------ mixer
class Mix:
    def __init__(self, dur): self.buf = np.zeros(int(SR * dur)); self.voice = np.zeros(int(SR * dur))
    def add(self, x, at, g=1.0, voice=False): place(self.voice if voice else self.buf, x, at, g)
    def add_file(self, path, at, g=1.0, voice=False): self.add(read(path), at, g, voice)
    def music(self, x, g=0.35, duck=0.35, fade_out=2.0):
        m = np.zeros_like(self.buf); m[:min(len(m), len(x))] = x[:len(m)]
        lvl = np.abs(self.voice); lvl = np.convolve(lvl, np.ones(4410) / 4410, mode='same'); gate = np.clip(lvl * 25, 0, 1)
        gate = np.convolve(gate, np.ones(8820) / 8820, mode='same')  # smooth attack/release
        m *= g * (1 - gate * (1 - duck)); n = int(fade_out * SR); m[-n:] *= np.linspace(1, 0, n); self.buf += m
    def render(self, path, peak=0.92):
        x = self.buf + self.voice; x = np.tanh(x * 1.1) / np.tanh(1.1); write(path, norm(x, peak)); return path

LIB = {
    'sfx': {'whoosh': whoosh, 'swoosh_news': swoosh_news, 'pop': pop, 'boing': boing, 'slide_whistle_up': lambda: slide_whistle(up=True), 'slide_whistle_down': lambda: slide_whistle(up=False),
            'bonk': bonk, 'slap': slap, 'punch': punch, 'impact_boom': impact_boom, 'thud': thud, 'footstep_hard_1': lambda: footstep('hard', 0), 'footstep_hard_2': lambda: footstep('hard', 3),
            'footstep_grass': lambda: footstep('grass'), 'footstep_snow': lambda: footstep('snow'), 'door_close': door_close, 'ding': ding, 'chime_up': chime_up, 'camera_shutter': camera_shutter,
            'typewriter_key': typewriter_key, 'ticker_blip': ticker_blip, 'riser': riser, 'magic_sparkle': magic_sparkle, 'explosion': explosion_sfx, 'splash': splash_sfx, 'thunder': thunder,
            'cartoon_run': cartoon_run, 'heartbeat': heartbeat, 'glitch': glitch, 'news_sting': sting_news},
    'ambience': {'rain': amb_rain, 'wind': amb_wind, 'city': amb_city, 'park_birds': amb_park, 'office': amb_office, 'newsroom': amb_newsroom, 'fire_crackle': amb_fire, 'room_tone': amb_room_tone},
    'music': {'documentary_calm_72bpm': lambda: music_documentary(60), 'news_bed_120bpm': lambda: music_news(40), 'cartoon_bouncy_128bpm': lambda: music_cartoon(40), 'suspense_drone': lambda: music_suspense(30)},
}

if __name__ == '__main__' and sys.argv[1:2] == ['build']:
    out = sys.argv[2]; index = []
    for cat, items in LIB.items():
        for name, fn in items.items():
            p = os.path.join(out, cat, name + '.wav'); x = fn(); write(p, x); index.append(dict(category=cat, name=name, path=os.path.relpath(p, out), secs=round(len(x) / SR, 2))); print(p, round(len(x) / SR, 2))
    json.dump(index, open(os.path.join(out, 'audio_index.json'), 'w'), indent=1)
