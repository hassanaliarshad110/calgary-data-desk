#!/usr/bin/env python3
"""Audio -> lip-sync track. Writes per-frame loudness (0..1) that engine/core.js visemeAt() turns into mouth shapes.
  python3 lipsync.py out.json name1=voice1.wav name2=voice2.wav ...   (fps 30)
Output: {"fps":30, "tracks": {"name1": [..], ...}, "durs": {"name1": secs}}
Loudness = RMS per frame, emphasised in the 300-3400 Hz speech band, gated and normalised to the line's 95th percentile."""
import sys, json, numpy as np, os
sys.path.insert(0, os.path.dirname(__file__)); from audio import read, bpf, SR
FPS = 30
def track(path):
    x = bpf(read(path), 300, 3400); hop = SR // FPS; n = len(x) // hop
    r = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    ref = np.percentile(r, 95) or 1; v = np.clip(r / ref, 0, 1); v[v < 0.08] = 0
    v = np.convolve(v, [0.25, 0.5, 0.25], mode='same')  # smooth jitter
    return [round(float(a), 3) for a in v], round(len(x) / SR, 3)
if __name__ == '__main__':
    out = {'fps': FPS, 'tracks': {}, 'durs': {}}
    for arg in sys.argv[2:]:
        k, p = arg.split('=', 1); out['tracks'][k], out['durs'][k] = track(p)
    json.dump(out, open(sys.argv[1], 'w')); print('wrote', sys.argv[1], {k: v for k, v in out['durs'].items()})
