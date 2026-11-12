"""Build amp.js (lip-sync loudness per speaker per frame at 30 fps) from timeline.json and aud1/<id>.wav."""
import json, wave, numpy as np
TL = json.load(open('timeline.json')); N = int(TL['total'] * 30) + 30
amp = {}
for lid, l in TL['lines'].items():
    w = wave.open(f'aud1/{lid}.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; sr = w.getframerate()
    hop = sr // 30; fr = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(len(a) // hop)])
    fr = np.clip(fr / (np.percentile(fr, 95) + 1e-6), 0, 1)
    arr = amp.setdefault(l['sp'], [0.0] * N); s = int(round(l['abs'] * 30))
    for i, v in enumerate(fr):
        if s + i < N: arr[s + i] = round(float(v), 2)
open('amp.js', 'w').write('window.AMP=' + json.dumps(amp) + ';')
