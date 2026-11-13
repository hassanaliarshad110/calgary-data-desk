"""Build narration + ambience for one language: python3 mix.py <lang> <audio_dir>"""
import json, sys, subprocess, numpy as np, wave, pathlib
lang, adir = sys.argv[1], pathlib.Path(sys.argv[2])
OUT = pathlib.Path(__file__).parent / f'ep2_{lang}'
cfg = json.load(open(OUT / 'cfg.json'))
SR = 44100
starts, acc = [], 0.0
for s in cfg['scenes']: starts.append(acc); acc += s['dur']
total = acc
N = int(total * SR) + SR
vo = np.zeros(N, np.float32)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
for i in range(len(cfg['scenes'])):
    a = load(adir / f'{lang}_{i}.wav'); st = int((starts[i] + (cfg['lead'] if i == 0 else 0)) * SR)
    vo[st:st + len(a)] += a[:N - st]
rng = np.random.default_rng(1)
t = np.arange(N) / SR
# wind: smoothed noise with slow swells
w = rng.standard_normal(N).astype(np.float32)
for k in (0.02, 0.02): w = np.convolve(w, np.ones(int(SR * k)) / int(SR * k), mode='same')
w = w / (np.abs(w).max() + 1e-9) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 9.0) ** 2)
# low drone (D) with slow beating
drone = (np.sin(2 * np.pi * 73.4 * t) * .5 + np.sin(2 * np.pi * 110.0 * t + .3) * .3 + np.sin(2 * np.pi * 146.8 * t) * .12) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 7))
bed = w * 0.05
# fire crackle in scenes 4 and 6 (and the hook's last seconds)
def crackle(a, b, lvl):
    s, e = int(a * SR), int(b * SR); n = e - s
    c = np.zeros(n, np.float32); idx = rng.integers(0, n, int((b - a) * 70)); c[idx] = rng.uniform(-1, 1, len(idx))
    c = np.convolve(c, np.exp(-np.arange(200) / 30.0), mode='same')
    roar = rng.standard_normal(n).astype(np.float32); roar = np.convolve(roar, np.ones(400) / 400, mode='same') * 6
    env = np.minimum(1, np.minimum(np.arange(n) / (SR * 1.5), (n - np.arange(n)) / (SR * 1.5)))
    bed[s:e] += (c * .5 + roar * .3) * env * lvl
crackle(starts[3], starts[4] - .2, .35)
# door impact thud in scene 3
imp = starts[3] + cfg['scenes'][3]['dur'] * .25; s = int(imp * SR); n = int(SR * 1.2); tt = np.arange(n) / SR
thud = (np.sin(2 * np.pi * 55 * tt) + .5 * rng.standard_normal(n) * np.exp(-tt * 30)) * np.exp(-tt * 5)
bed[s:s + n] += thud.astype(np.float32) * .55
# score (per-scene moods)
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from score import build_score
MOODS = json.load(open(OUT.parent / 'moods.json'))
moods, imps = MOODS['moods'], {int(k): v * cfg['scenes'][int(k)]['dur'] for k, v in MOODS.get('impacts', {}).items()}
sc = build_score(starts, [s['dur'] for s in cfg['scenes']], moods, imps)
sc = np.pad(sc, (0, max(0, N - len(sc))))[:N]
# duck bed under voice
env = np.abs(vo); win = int(SR * .3); env = np.convolve(env, np.ones(win) / win, mode='same')
duck = 1 - 0.45 * np.clip(env / (env.max() * .25 + 1e-9), 0, 1)
duck_m = 1 - 0.6 * np.clip(env / (env.max() * .25 + 1e-9), 0, 1)
mix = vo * 1.0 + bed * duck + sc * 0.30 * duck_m
fade = int(SR * 2.0); end = int(total * SR); mix = mix[:end]; mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / (np.abs(mix).max() + 1e-9) * 0.89
with wave.open(str(OUT / 'mix.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
print('total', round(total, 2), 's')
