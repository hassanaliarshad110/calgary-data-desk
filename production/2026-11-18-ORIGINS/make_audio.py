"""Join narration WAVs into the voice track with exactly the timing of the scene (M.script: lead .3, gap .7 or the line's gap, tail).
   python3 make_audio.py film|1|2|3|4 OUT.wav"""
import json, sys, subprocess, wave
sys.path.insert(0, '/home/claude/work')
import episode as E
SR = 24000
D = '/home/claude/sp_out_final'
which, out = sys.argv[1], sys.argv[2]
part = 0 if which == 'film' else int(which)
def pcm(p): return subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
sil = lambda s: b'\x00\x00' * int(round(s * SR))
idx = [i for i, l in enumerate(E.L) if not part or l['ch'] == part]
data = sil(.3)
for i in idx:
    g = E.L[i]['gap'] if E.L[i]['gap'] is not None else .85
    data += pcm(f'{D}/v_{i}.wav') + sil(g)
e = 0 if part in (0, 4) else part
data += pcm(f'{D}/e_{e}.wav') + sil(3.2 if part else 4.2)
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
print(out, round(len(data) / 2 / SR, 3))
