#!/usr/bin/env python3
"""Trailer sound design for "Calgarians vs Corrupt Mafia" (synthesised: no samples, no licences, no credits).
   python3 audio.py --vo /home/claude/sp_out --out mix.wav
Voice: Kokoro am_michael (speed .9) via the studio-probe lane, pitched down 5% with a short room.
"""
import argparse, subprocess, sys, os
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../motion/engine'))
import sfx
from sfx import fx, bandnoise, sweep, norm

SR = sfx.SR
TOTAL = 31.1
N = int(TOTAL * SR)
rng = np.random.default_rng(11)
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)
def db(g): return 10 ** (g / 20)
def saw(f, d, det=0.0):
    ph = np.cumsum(np.full(int(d * SR), f * (1 + det)) / SR) + rng.random(); return 2 * (ph % 1) - 1
def put(bus, sig, at, g=0.0):
    i = int(at * SR); j = min(len(bus), i + len(sig)); bus[i:j] += sig[:j - i] * db(g)
def adsr(n, a, r, curve=2.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n - na, int(r * SR))); e[:na] = np.linspace(0, 1, na) ** .7; e[-nr:] *= np.linspace(1, 0, nr) ** curve; return e
def hz(n): return 440 * 2 ** ((n - 69) / 12)

def braam(d=3.2, notes=(38, 45, 50), bright=1.0):
    """big brass-like low hit (trailer 'braam'): detuned saws, opening/closing low-pass, saturation"""
    y = np.zeros(int(d * SR))
    for n in notes:
        for k in range(5): y += saw(hz(n), d, (k - 2) * .004)
    t = t_(d); fc = 180 + 2400 * bright * np.exp(-t * 2.2) * (1 - np.exp(-t * 30))
    out = np.zeros_like(y); s = 0.0; a = np.exp(-2 * np.pi * fc / SR)
    for i in range(len(y)): s = (1 - a[i]) * y[i] + a[i] * s; out[i] = s
    out = np.tanh(out * .6) * adsr(len(out), .03, d * .8, 1.6)
    sub = np.sin(2 * np.pi * np.cumsum(np.full(len(t), hz(notes[0]) / 2)) / SR) * np.exp(-t * 1.2)
    return norm(out + sub * .5)
def thunder(d=4.0, crack=1.0):
    t = t_(d); rum = lp(bandnoise(d, 20, 400, 'brown'), 160) * (np.exp(-t * .9) * (1 - np.exp(-t * 8)))
    rum *= 1 + .5 * np.sin(2 * np.pi * 3.1 * t) * np.sin(2 * np.pi * .7 * t)
    cr = hp(bandnoise(d, 300, 9000, 'pink'), 600) * np.exp(-t * 7) * crack
    return norm(rum + cr * .6)
def taiko(): d = 1.6; t = t_(d); return norm(sweep(130, 48, d) * np.exp(-t * 5) + lp(bandnoise(d, 40, 2000, 'brown'), 900) * np.exp(-t * 14) * .7)
def engine(d):
    t = t_(d); f = 38 + 4 * np.sin(2 * np.pi * .4 * t); ph = np.cumsum(f / SR); y = (2 * (ph % 1) - 1) + .5 * (2 * ((ph * 2.01) % 1) - 1)
    return norm(lp(np.tanh(y * 1.4), 220) * (.75 + .25 * np.sin(2 * np.pi * 11 * t)) + lp(bandnoise(d, 30, 300, 'brown'), 200) * .4)
def hiss(d): return norm(hp(bandnoise(d, 2000, 12000, 'pink'), 2500) * .5)
def pad(d, notes, kind='dark', bright=600):
    t = t_(d); y = np.zeros(len(t))
    for n in notes:
        for k in range(3): vib = 1 + .003 * np.sin(2 * np.pi * (4.6 + k * .3) * t + k); y += 2 * ((np.cumsum(hz(n) * (1 + (k - 1) * .005) * vib / SR) + k * .3) % 1) - 1
    y = lp(y, bright, 2); return norm(y * adsr(len(y), d * .35, d * .35, 1.2))
def ostinato(d, bpm, note=38, sub=4):
    step = 60 / bpm / (sub / 2); y = np.zeros(int(d * SR)); k = 0; tt = 0.0
    while tt < d - .05:
        n = int(.11 * SR); s = lp(saw(hz(note + (12 if k % 8 == 6 else 0)), .11), 900) * adsr(n, .004, .09, 2.5) * (1 if k % 2 == 0 else .65)
        put(y, s, tt); k += 1; tt += step
    return norm(y)
def heartbeat(): y = np.zeros(int(.9 * SR)); th = fx('thud'); put(y, th, 0); put(y, th * .7, .24); return norm(y)
def shimmer(d=2.0):
    t = t_(d); y = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * (1.5 + i * .3)) for i, f in enumerate([1760, 2217, 2637, 3520, 4186]))
    return norm(y * (1 - np.exp(-t * 40)), .5)
def piano(n, d=3.0):
    t = t_(d); f = hz(n); return norm(sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.2 + h * .9)) / h for h in (1, 2, 3, 4)) * (1 - np.exp(-t * 300)))
def revcym(d=1.6): t = t_(d); y = hp(bandnoise(d, 3000, 14000, 'pink'), 3000) * np.exp(-(d - t) * 3.5) * (t / d) ** 2; return norm(y)
def electric(d=.5): t = t_(d); return norm(np.sign(np.sin(2 * np.pi * 61 * t)) * bandnoise(d, 400, 6000) * .5 * np.exp(-t * 6) + sweep(1800, 300, d) * np.exp(-t * 9) * .4, .6)
def reverb(x, secs=2.6, wet=.3):
    ir = rng.standard_normal(int(secs * SR)) * np.exp(-np.arange(int(secs * SR)) / SR * (6.9 / secs)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 1.4

# ------------------------------------------------------------------ voice
def load_line(path, tempo=1.0, pitch=.95):
    af = f'asetrate={24000 * pitch:.0f},aresample={SR},atempo={tempo / pitch:.4f},highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', af, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)

def build(vo_dir, out):
    VO = np.zeros(N); MUS = np.zeros(N); FX = np.zeros(N); AMB = np.zeros(N)
    L = lambda i, **k: load_line(os.path.join(vo_dir, f'v_{i}.wav'), **k)
    v2 = L(2); cuts = [0, int(1.24 / .95 * 0 + 1.24 * SR), int(2.11 * SR), len(v2)]  # pitch keeps duration
    place = [(0, .30), (1, 3.95), (3, 11.00), (4, 13.45), (5, 18.65), (6, 21.55)]
    for i, at in place: put(VO, L(i), at)
    for k, at in enumerate([6.95, 8.25, 9.25]): put(VO, v2[cuts[k]:cuts[k + 1]], at)
    put(VO, L(7, tempo=1.08), 26.15)
    VO = reverb(VO, 1.1, .14)

    # ambience: rain the whole film (drops out on the silence beats), wind, city hum
    rain = fx('rain', TOTAL); put(AMB, rain, 0, -6)
    w = fx('wind', TOTAL); put(AMB, w, 0, -12)
    env = np.ones(N)
    for a, b in [(10.58, 10.95), (21.22, 21.42)]: env[int(a * SR):int(b * SR)] = .08
    AMB *= lp(env, 30)
    put(AMB, engine(3.4), 3.55, -6); put(AMB, hiss(3.2), 3.6, -16)
    put(AMB, engine(1.3), 16.2, -6)
    put(AMB, fx('crowd_murmur', 5.0), 13.2, -12); put(AMB, fx('crowd_murmur', 3.0), 18.6, -10)

    # thunder with every lightning flash
    for at, g in [(.10, -1), (2.37, -4), (5.52, -5), (6.92, -8), (21.46, -5), (24.32, -5)]: put(FX, thunder(4.0), at, g)

    # music
    put(MUS, pad(10.8, (38, 41, 45, 50), bright=420), 0, -9)                       # D minor drone, cold open to the tower
    put(MUS, ostinato(3.6, 128, 38), 6.85, -10)                                    # red: tension pulse
    put(MUS, piano(74, 2.5), 11.02, -12); put(MUS, piano(69, 2.5), 12.0, -14)      # the lone figure
    put(MUS, pad(3.6, (46, 50, 53, 58), bright=900), 12.75, -8)                    # the rise: B-flat major lift
    put(MUS, pad(5.4, (38, 45, 50, 53, 57), bright=1300), 16.1, -9)
    put(MUS, ostinato(5.1, 150, 38), 16.2, -8)                                     # montage drive
    put(MUS, pad(4.6, (38, 41, 45, 50), bright=700), 21.4, -9)                     # title bed
    put(MUS, pad(5.1, (38, 45, 50, 57), bright=500), 26.0, -11)                    # slate bed

    # hits and transitions
    put(FX, braam(3.4, (38, 45, 50), .8), 0.0, -2)
    put(FX, fx('whoosh', .5), 3.35, -6)
    put(FX, fx('whoosh', .4), 6.62, -5)
    for at in (6.8, 8.2, 9.2): put(FX, fx('impact'), at, -3); put(FX, electric(.45), at + .05, -12)
    put(FX, braam(3.0, (37, 44, 49), 1.0), 6.8, -3)
    put(FX, revcym(1.2), 9.4, -9); put(FX, fx('thud'), 10.6, -4)
    for at in (11.05, 11.75): put(FX, heartbeat(), at, -6)
    put(FX, fx('swell', 2.5), 12.6, -8)
    put(FX, revcym(1.0), 15.2, -10)
    for at in (16.2, 17.45, 18.7, 19.95): put(FX, taiko(), at, -2); put(FX, fx('whoosh', .3), at - .22, -10)
    for k in range(9): put(FX, electric(.3), 17.55 + k * .12, -16)                   # floors switching off
    put(FX, shimmer(2.2), 18.75, -10)                                                # the beacon lights
    put(FX, fx('riser', 2.0), 19.3, -6); put(FX, revcym(1.9), 19.35, -8)
    put(FX, braam(4.0, (38, 45, 50, 57), 1.0), 21.42, -2); put(FX, fx('boom'), 21.42, -1)  # TITLE
    put(FX, fx('impact'), 22.55, -3)                                                 # VS
    put(FX, braam(3.2, (37, 44, 49), .9), 23.2, -3); put(FX, fx('impact'), 23.2, -2) # CORRUPT MAFIA
    put(FX, shimmer(2.0), 23.7, -14)
    put(FX, fx('whoosh', .8), 26.1, -10); put(FX, fx('ping'), 27.35, -14)
    put(FX, braam(2.8, (38, 45, 50), .7), 30.25, -5); put(FX, fx('boom'), 30.25, -4)

    MUS = reverb(MUS, 3.0, .35); FX = reverb(FX, 2.4, .25)
    # duck music/ambience under the voice
    ve = lp(np.abs(VO), 8); ve = np.clip(ve / (ve.max() + 1e-9) * 3, 0, 1); duck = 1 - .45 * ve
    mix = VO * db(0) + MUS * db(-6) * duck + FX * db(-4) * (1 - .3 * ve) + AMB * db(-10) * duck
    fade = np.ones(N); fade[-int(.6 * SR):] = np.linspace(1, 0, int(.6 * SR)) ** 2; mix *= fade
    st = np.stack([mix, mix], 1)
    # widen non-voice slightly
    side = (MUS * db(-6) * duck + AMB * db(-10) * duck) * .25; st[:, 0] += np.roll(side, 240); st[:, 1] -= np.roll(side, 240)
    st /= np.abs(st).max() + 1e-9
    raw = out + '.raw.wav'
    import wave
    with wave.open(raw, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(st, -1, 1) * 32000).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=false', '-ar', str(SR), '-c:a', 'pcm_s16le', out], check=True); os.remove(raw)
    print(out)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--vo', required=True); ap.add_argument('--out', default='mix.wav'); a = ap.parse_args(); build(a.vo, a.out)
