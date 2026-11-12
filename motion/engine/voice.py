#!/usr/bin/env python3
"""Join the narration line WAVs (Kokoro, one per scene) into vo.wav with exactly the timing M.script() uses.

  python3 voice.py --dir sp_out --prefix v --n 6 --lead 0.3 --gap 0.4 --tail 1.6 --gap-after 1=0.9 --out vo.wav

lead = silence before line 0; gap = silence after each line (gap-after overrides one line: INDEX=SECONDS); tail = after the
last line. Use the same numbers in the scene's M.script(lines, {lead, gap, tail}) and each line's gapAfter.
"""
import argparse, subprocess, wave, os

ap = argparse.ArgumentParser()
ap.add_argument('--dir', required=True); ap.add_argument('--prefix', default='v'); ap.add_argument('--n', type=int, required=True)
ap.add_argument('--lead', type=float, default=.3); ap.add_argument('--gap', type=float, default=.4); ap.add_argument('--tail', type=float, default=1.5)
ap.add_argument('--gap-after', action='append', default=[]); ap.add_argument('--out', required=True)
a = ap.parse_args()
over = {int(k): float(v) for k, v in (x.split('=') for x in a.gap_after)}
SR = 24000
parts = []
def silence(sec): return b'\x00\x00' * int(round(sec * SR))
def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return raw
data = silence(a.lead)
for i in range(a.n):
    data += pcm(os.path.join(a.dir, f'{a.prefix}_{i}.wav'))
    data += silence(over.get(i, a.tail if i == a.n - 1 else a.gap))
with wave.open(a.out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
print(a.out, round(len(data) / 2 / SR, 3), 's')
