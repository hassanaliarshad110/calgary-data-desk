"""Danger-first Susuman compilation (STRATEGY.md retention rules, Nov 2026), true 16:9.
0:00 cold open = the best episode's most exciting rescue moment (mid-action, own sound) + 2-4 word Roman hook + small corner badge
-> episodes best-first, each cut to start where its danger is first on screen (no narrator recap / setup scene),
each ending right after its narrator lesson (LIKE + SUBSCRIBE end card dropped) except the last episode, which keeps its end card.
Joins: 1 s whoosh slide (last lesson frame held, next episode slides in with its own sound). No title cards.
Every piece is gain-matched to -14 LUFS; final master libx264 crf 18 / AAC 192k.
Usage: python3 build_coldopen_comp.py <work> <out.mp4> <spec.json>
spec: {"gfx": dir with hook.png badge_s.png ep<N>.png,
       "cold": {"src":..., "start":s, "end":s},
       "eps": [{"ep":5, "src":..., "start":s, "end":s or null, "vend": optional s, "chapter":"..."}, ...]}
Writes <out>.chapters.json (episode start = start of the whoosh that brings it in; first chapter 0:00 includes the cold open)."""
import sys, os, json, subprocess, wave
import numpy as np
work, out, spec = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3])); os.makedirs(work, exist_ok=True)
G = spec['gfx']; SR = 44100; FPS = 30
VI = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
AI = ['-c:a', 'pcm_s16le', '-ar', str(SR), '-ac', '2']
SC = f'scale=1920:1080:flags=lanczos,fps={FPS},format=yuv420p'
def run(c): r = subprocess.run(c, capture_output=True, text=True); assert r.returncode == 0, r.stderr[-3000:]; return r.stderr
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
def gain_db(src, a, b):
    e = run(['ffmpeg', '-hide_banner', '-ss', str(a), '-to', str(b), '-i', src, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'])
    j = json.loads(e[e.rindex('{'):e.rindex('}') + 1]); g = -14 - float(j['input_i'])
    return max(min(g, 6.0), -6.0), float(j['input_tp'])
def whoosh(path, d=0.8):
    rng = np.random.default_rng(7); n = int(SR * d); t = np.arange(n) / SR
    x = rng.standard_normal(n); y = np.zeros(n); lp = 0.0; bp = 0.0
    for i in range(n):  # sweeping state-variable band-pass (900 Hz -> 3 kHz -> 600 Hz)
        f = 600 + 2400 * np.sin(np.pi * min(t[i] / d * 1.3, 1.0)) ** 2; k = 2 * np.sin(np.pi * f / SR)
        hp = x[i] - lp - 0.9 * bp; bp += k * hp; lp += k * bp; y[i] = bp
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 3; y = y * env; y = y / np.abs(y).max() * 0.35  # ~ -9 dBFS peak
    st = np.stack([y * (0.6 + 0.4 * t / d), y * (1.0 - 0.4 * t / d)], 1)  # left->right pan, matches slideleft
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
WH = os.path.join(work, 'whoosh.wav'); whoosh(WH)
pieces = []; chapters = []
def body(src, a, b, o, gdb, ovl=None, fade_out=True, vend=None):
    """trim [a,b) of src (b=None: to the end), gain gdb, optional overlays [(png, x, y, t0, t1)];
    vend: source time where the picture holds its last frame while the sound finishes (burned-in caption switches to LIKE/SUBSCRIBE before the lesson audio ends)"""
    if os.path.exists(o): return o  # cached piece (delete it to rebuild)
    ins = ['-ss', f'{a:.3f}'] + (['-to', f'{b:.3f}'] if b else []) + ['-i', src]
    hold = f',trim=end={vend - a:.3f},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=5' if vend else ''
    fc = f'[0:v]{SC},setpts=PTS-STARTPTS{hold}[v0]'; last = 'v0'
    for k, (png, x, y, t0, t1) in enumerate(ovl or []):
        ins += ['-loop', '1', '-i', png]
        fc += f';[{k + 1}:v]format=rgba,fade=t=in:st={t0}:d=0.25:alpha=1,fade=t=out:st={t1 - 0.3}:d=0.3:alpha=1[o{k}];[{last}][o{k}]overlay={x}:{y}:shortest=1:enable=\'between(t,{t0},{t1})\'[v{k + 1}]'; last = f'v{k + 1}'
    L = (b - a) if b else (dur(src) - a)
    af = f'asetpts=PTS-STARTPTS,aresample={SR},volume={gdb:.2f}dB' + (f',afade=t=out:st={L - 0.12:.3f}:d=0.12' if fade_out else '')
    fc += f';[{last}]format=yuv420p[v];[0:a]{af}[a]'
    run(['ffmpeg', '-y', *ins, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{L:.3f}', *VI, *AI, o]); return o
def trans(prev, src, a, o, gdb):
    """1 s: last frame of prev held, next episode (src from a) slides in with its own sound + whoosh"""
    if os.path.exists(o): return o  # cached piece
    png = o + '.last.png'; run(['ffmpeg', '-y', '-sseof', '-0.1', '-i', prev, '-update', '1', '-frames:v', '1', png])
    fc = (f'[0:v]{SC},trim=duration=1,setpts=PTS-STARTPTS[A];[1:v]{SC},trim=duration=1,setpts=PTS-STARTPTS[B];'
          f'[A][B]xfade=transition=slideleft:duration=1:offset=0,format=yuv420p[v];'
          f'[1:a]asetpts=PTS-STARTPTS,aresample={SR},volume={gdb:.2f}dB,afade=t=in:st=0:d=0.08[b];[2:a]aresample={SR}[w];[b][w]amix=inputs=2:normalize=0:duration=first[a]')
    run(['ffmpeg', '-y', '-loop', '1', '-t', '1.2', '-i', png, '-ss', f'{a:.3f}', '-t', '1.2', '-i', src, '-i', WH, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', '1', *VI, *AI, o]); return o
# cold open
c = spec['cold']; g, _ = gain_db(c['src'], c['start'], c['end'])
pieces.append(body(c['src'], c['start'], c['end'], os.path.join(work, 'p00_cold.mkv'), g,
                   [(os.path.join(G, 'hook.png'), 0, 0, 0.0, 3.6), (os.path.join(G, 'badge_s.png'), 1440, 960, 0.0, c['end'] - c['start'])]))
t = dur(pieces[-1]); print('cold open', round(t, 2), flush=True)
for i, e in enumerate(spec['eps'], 1):
    end = e['end']; last = i == len(spec['eps'])
    g, tp = gain_db(e['src'], e['start'], end if end else dur(e['src']))
    chapters.append({'ep': e['ep'], 'start': 0.0 if i == 1 else round(t, 2), 'chapter': e['chapter']})
    tr = trans(pieces[-1], e['src'], e['start'], os.path.join(work, f'p{i:02d}a_trans.mkv'), g); pieces.append(tr); t += dur(tr)
    pieces.append(body(e['src'], e['start'] + 1.0, end, os.path.join(work, f'p{i:02d}b_ep{e["ep"]}.mkv'), g,
                       [(os.path.join(G, f'ep{e["ep"]}.png'), 40, 36, 0.0, 3.2)], fade_out=not last, vend=e.get('vend'))); t += dur(pieces[-1])
    print('ep', e['ep'], 'gain', round(g, 2), 'dB, ends at', round(t, 2), flush=True)
lst = os.path.join(work, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in pieces))
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-g', '60',
     '-c:a', 'aac', '-b:a', '192k', '-ar', str(SR), '-ac', '2', '-movflags', '+faststart', out])
json.dump({'duration': round(dur(out), 2), 'chapters': chapters}, open(out + '.chapters.json', 'w'), indent=1, ensure_ascii=False)
print(open(out + '.chapters.json').read())
