#!/usr/bin/env python3
"""Sound design for Calgary Insight videos, synthesised here (no samples, no licences, no credits).

  python3 sfx.py mix --voice vo.wav --cues cues.json --music pulse --dur 31.5 --out mix.wav
  python3 sfx.py demo --out demo.wav          # every effect and bed, for a listen-check

cues.json: [{"t": 0.00, "sfx": "impact", "gain": -4}, {"t": 2.20, "sfx": "whoosh"}, ...]
Effects: impact, boom, whoosh, whoosh_rev, riser, tick, ticks (counter run: add "dur"), pop, ping, swell, click, stamp,
         thud, glitch, shutter, wind, city, rain, crowd_murmur (beds: add "dur")
Music beds (--music): story (slow minor pad, low pulse), pulse (bright 100 bpm plucks and kick), civic (sparse piano-like
         chords), suspense (drone, heartbeat, rising), none
The voice is kept on top: music is ducked under narration (sidechain), effects sit between; the mix is normalised to
about -14 LUFS (social) with a -1 dB true-peak ceiling.
"""
import argparse, json, math, os, subprocess, sys, tempfile
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(d * SR)) / SR


def env(n, a=.005, r=.2, curve=3.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n - na, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** curve; return e


def onepole(x, fc):
    """simple low-pass; fc may be an array (time-varying)"""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y


def bandnoise(d, lo, hi, color='white'):
    n = int(d * SR); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    if color == 'pink': X /= np.sqrt(np.maximum(f, 20))
    if color == 'brown': X /= np.maximum(f, 20)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)


def norm(x, peak=.9): return x / (np.abs(x).max() + 1e-9) * peak


def sweep(f0, f1, d, shape='exp'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if shape == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def fx(name, dur=None):
    if name == 'impact':   # number slam: sub drop + transient
        d = 1.4; t = t_(d); body = sweep(90, 38, d) * np.exp(-t * 3.2)
        click = bandnoise(d, 1500, 9000) * np.exp(-t * 60)
        return norm(body * .9 + click * .35)
    if name == 'boom':
        d = 2.5; t = t_(d); return norm(sweep(60, 30, d) * np.exp(-t * 1.6) + bandnoise(d, 20, 300, 'brown') * np.exp(-t * 2.5) * .6)
    if name in ('whoosh', 'whoosh_rev'):
        d = dur or .7; n = int(d * SR); t = t_(d); x = bandnoise(d, 150, 9000, 'pink')
        e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.2
        y = onepole(x, 400 + 6000 * e) * e
        y = norm(y); return y[::-1].copy() if name == 'whoosh_rev' else y
    if name == 'riser':
        d = dur or 2.0; t = t_(d); e = (t / d) ** 2
        return norm((sweep(200, 1600, d) * .35 + onepole(bandnoise(d, 300, 12000), 300 + 8000 * e)) * e)
    if name == 'tick':
        d = .05; t = t_(d); return norm(np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) + bandnoise(d, 3000, 9000) * np.exp(-t * 300) * .4, .6)
    if name == 'ticks':   # counter rolling: ticks that slow down
        d = dur or 1.5; y = np.zeros(int(d * SR) + SR // 10); tk = fx('tick'); pos = 0.0; k = 0
        while pos < d:
            i = int(pos * SR); y[i:i + len(tk)] += tk * (.6 + .4 * (1 - pos / d)); k += 1; pos += .035 + .12 * (pos / d) ** 2
        return norm(y, .6)
    if name == 'pop':
        d = .18; t = t_(d); return norm(sweep(900, 300, d) * np.exp(-t * 35))
    if name == 'ping':    # map pin / marker
        d = 1.2; t = t_(d); return norm((np.sin(2 * np.pi * 1320 * t) + .5 * np.sin(2 * np.pi * 1980 * t)) * np.exp(-t * 4.5), .55)
    if name == 'swell':
        d = dur or 2.5; t = t_(d); e = np.sin(np.pi * t / d) ** 2
        return norm(sum(np.sin(2 * np.pi * f * t) for f in (220, 277.2, 329.6, 440)) * e * .25 + onepole(bandnoise(d, 100, 6000, 'pink'), 1500) * e * .3, .6)
    if name == 'click':
        d = .03; t = t_(d); return norm(bandnoise(d, 1000, 8000) * np.exp(-t * 400), .5)
    if name == 'stamp':   # evidence label / badge landing
        d = .5; t = t_(d); return norm(sweep(140, 60, d) * np.exp(-t * 14) + bandnoise(d, 400, 4000) * np.exp(-t * 40) * .5, .8)
    if name == 'thud':
        d = .6; t = t_(d); return norm(sweep(70, 45, d) * np.exp(-t * 9), .8)
    if name == 'glitch':
        d = .35; y = bandnoise(d, 200, 10000); g = (np.floor(t_(d) * 40) % 3 == 0); return norm(y * g * np.exp(-t_(d) * 4), .5)
    if name == 'shutter':
        a = fx('click'); y = np.zeros(int(.12 * SR)); y[:len(a)] += a; y[int(.07 * SR):int(.07 * SR) + len(a)] += a * .7; return norm(y, .5)
    if name == 'wind':
        d = dur or 6; t = t_(d); x = bandnoise(d, 80, 2500, 'pink'); m = .6 + .4 * np.sin(2 * np.pi * .13 * t) * np.sin(2 * np.pi * .041 * t + 1)
        return norm(onepole(x, 500 + 700 * m) * m, .5)
    if name == 'city':
        d = dur or 6; return norm(bandnoise(d, 40, 900, 'brown') * .8 + bandnoise(d, 300, 3000, 'pink') * .15, .45)
    if name == 'rain':
        d = dur or 6; return norm(bandnoise(d, 800, 12000, 'pink') * .7 + bandnoise(d, 2000, 8000) * .3, .4)
    if name == 'crowd_murmur':
        d = dur or 6; t = t_(d); x = bandnoise(d, 250, 1800, 'pink'); return norm(x * (.7 + .3 * np.sin(2 * np.pi * 1.7 * t)), .35)
    raise SystemExit(f'unknown effect {name}')


def note(f, d, kind='pad'):
    t = t_(d)
    if kind == 'pad':
        y = sum(np.sin(2 * np.pi * f * (1 + dt) * t + ph) for dt, ph in ((0, 0), (.004, 1), (-.005, 2))) / 3
        y += .3 * np.sin(2 * np.pi * f * 2 * t); return y * env(len(t), .8, 1.2, 1.5)
    if kind == 'pluck':
        y = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 6)) * np.exp(-t * 6); return y * env(len(t), .002, .05)
    if kind == 'piano':
        y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.2 + k * 1.1)) / k ** 1.3 for k in range(1, 7)); return y * env(len(t), .003, .3)
    if kind == 'sub':
        return np.sin(2 * np.pi * f * t) * env(len(t), .05, .4)


def hz(n): return 440 * 2 ** ((n - 69) / 12)


def music(kind, d):
    n = int(d * SR) + SR; y = np.zeros(n)
    def put(sig, at, g=1.0):
        i = int(at * SR); j = min(n, i + len(sig)); y[i:j] += sig[:j - i] * g
    if kind == 'none': return y[:int(d * SR)]
    if kind in ('story', 'suspense'):
        prog = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)] if kind == 'story' else [(50, 53, 57), (50, 53, 56), (46, 50, 53), (49, 52, 56)]
        bar = 4.0; k = 0; at = 0
        while at < d:
            ch = prog[k % 4]
            for m in ch: put(note(hz(m), bar + 1.2, 'pad'), at, .16)
            put(note(hz(ch[0] - 12), bar, 'sub'), at, .22)
            if kind == 'suspense':
                for b in np.arange(0, bar, .75): put(fx('thud'), at + b, .35 * (1 + at / d))
            else:
                for b in (0, 2): put(fx('thud'), at + b, .18)
            k += 1; at += bar
        y += onepole(bandnoise(n / SR, 60, 400, 'brown'), 300) * .03
        if kind == 'suspense': y *= np.linspace(.6, 1.15, n)
    elif kind == 'pulse':
        bpm = 100; beat = 60 / bpm; prog = [(57, 64, 69, 72), (53, 60, 65, 69), (48, 55, 60, 64), (55, 62, 67, 71)]
        at = 0; b = 0
        while at < d:
            ch = prog[(b // 8) % 4]
            put(note(hz(ch[b % 4] + (12 if b % 8 >= 4 else 0)), .5, 'pluck'), at, .16)
            if b % 2 == 0: put(fx('thud'), at, .45)
            if b % 2 == 1: put(fx('click'), at, .25)
            if b % 8 == 0:
                for m in ch[:3]: put(note(hz(m), beat * 8 + .8, 'pad'), at, .07)
            at += beat / 2; b += 1
    elif kind == 'civic':
        prog = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]; bar = 3.2; at = 0; k = 0
        while at < d:
            ch = prog[k % 4]
            for i, m in enumerate(ch): put(note(hz(m), 2.6, 'piano'), at + i * .06, .22)
            put(note(hz(ch[0] - 12), 2.8, 'piano'), at + 1.6, .14)
            for m in ch: put(note(hz(m), bar + 1, 'pad'), at, .04)
            k += 1; at += bar
    else:
        raise SystemExit(f'unknown music {kind}')
    y = y[:int(d * SR)]; fade = min(len(y), int(1.5 * SR)); y[-fade:] *= np.linspace(1, 0, fade); y[:int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))
    return norm(y, .8)


def wav(path, x):
    import wave
    x = np.clip(x, -1, 1); a = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())


def mix(a):
    d = a.dur; tmp = tempfile.mkdtemp()
    fxbus = np.zeros(int(d * SR) + SR)
    for c in json.load(open(a.cues)) if a.cues else []:
        s = fx(c['sfx'], c.get('dur')) * 10 ** (c.get('gain', -6) / 20); i = int(c['t'] * SR); j = min(len(fxbus), i + len(s)); fxbus[i:j] += s[:j - i]
    fxbus = fxbus[:int(d * SR)]
    wav(f'{tmp}/fx.wav', np.clip(fxbus, -1, 1)); wav(f'{tmp}/music.wav', music(a.music, d) * 10 ** (a.music_gain / 20))
    inputs = ['-i', f'{tmp}/music.wav', '-i', f'{tmp}/fx.wav']
    if a.voice:
        inputs += ['-i', a.voice]
        filt = (f'[2:a]aresample={SR},apad=whole_dur={d},asplit=2[v][vsc];'
                f'[0:a][vsc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[mduck];'
                f'[mduck][1:a][v]amix=inputs=3:normalize=0:weights=1 1 1.6[m];'
                f'[m]loudnorm=I=-14:TP=-1:LRA=11[out]')
    else:
        filt = '[0:a][1:a]amix=inputs=2:normalize=0[m];[m]loudnorm=I=-14:TP=-1:LRA=11[out]'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', filt, '-map', '[out]', '-t', str(d), '-ar', str(SR), '-ac', '2', a.out], check=True)
    print(a.out)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['mix', 'demo', 'one'])
    ap.add_argument('--voice'); ap.add_argument('--cues'); ap.add_argument('--music', default='none'); ap.add_argument('--music-gain', type=float, default=-20)
    ap.add_argument('--dur', type=float); ap.add_argument('--out', required=True); ap.add_argument('--name')
    a = ap.parse_args()
    if a.cmd == 'one': wav(a.out, fx(a.name, a.dur)); print(a.out); return
    if a.cmd == 'demo':
        parts = []
        for nme in ['impact', 'whoosh', 'whoosh_rev', 'riser', 'ticks', 'pop', 'ping', 'stamp', 'swell', 'glitch', 'shutter']:
            parts += [fx(nme), np.zeros(SR // 3)]
        for m in ['story', 'pulse', 'civic', 'suspense']: parts += [music(m, 8) * .5, np.zeros(SR // 2)]
        wav(a.out, np.concatenate(parts) * .8); print(a.out); return
    if a.dur is None: raise SystemExit('--dur is required for mix')
    mix(a)


if __name__ == '__main__':
    main()
