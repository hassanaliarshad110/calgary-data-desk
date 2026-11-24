#!/usr/bin/env python3
"""Cricket Kahani Shorts: shared build steps (timeline -> render -> mix -> cover), used by each episode's build.py.

An episode's build.py holds only what is its own: the output file name, the music and the sound cues.
    import ckbuild; ckbuild.run(__file__, out='CricketKahani_X.mp4', cues=CUES, music=('documentary', 84))
    python3 build.py [timeline|render|mix|cover|all]
Voice lines are read from $CK_TTS/<prefix>_<i>.wav (default /home/claude/ck/tts_out, prefix "hi"), as written by
probe/tts_ck.py on the budget-probe GitHub Actions lane. Mix levels come from channels/cricketkahani/package.json
(Hassan's rule: music and effects LOW, voice clearly on top) and the final mix is normalised to -14 LUFS.

A cue is (shot, mode, pos, sound, gain[, arg]): mode 'at' = pos seconds after the shot starts; 'rel' = pos as a
fraction of the shot's voice line (0 = first word, 1 = last word). sound = a function name in render/audio.py or 'cheer'."""
import os, sys, json, subprocess, re
import numpy as np


def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


def run(build_file, out, cues, music=('documentary', 84), n=8, cut=0.66, prefix=None, crowd=True, gap=0.25, tail_end=2.2):
    HERE = os.path.dirname(os.path.abspath(build_file)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
    sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
    SRC = os.environ.get('CK_TTS', '/home/claude/ck/tts_out'); PFX = prefix or os.environ.get('CK_PREFIX', 'hi')
    AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True); OUT = os.path.join(HERE, out)
    PK = json.load(open(os.path.join(ROOT, 'channels/cricketkahani/package.json')))['mix']
    step = sys.argv[1] if len(sys.argv) > 1 else 'all'; env = dict(os.environ, W='1080', H='1920')

    if step in ('timeline', 'all'):
        for i in range(n):
            sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{SRC}/{PFX}_{i}.wav', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', f'{AUD}/v{i}.wav')
        d = [round(dur(f'{AUD}/v{i}.wav'), 3) for i in range(n)]
        lead = [0.6] + [0.15] * (n - 1); tail = [gap] * (n - 1) + [tail_end]  # gap / tail_end: tighten to keep a Short within 60 s
        shots, t = [], 0
        for i in range(n):
            s = {'id': f's{i}', 'line': i, 'vo_at': lead[i], 'vo': d[i], 'dur': round(lead[i] + d[i] + tail[i], 3), 'start': round(t, 3)}
            if i == n - 1: s['cut'] = cut
            t += s['dur']; shots.append(s)
        json.dump({'shots': shots, 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2), d)

    if step in ('render', 'all'):
        subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full'] + sys.argv[2:], check=True, env=env)

    if step in ('mix', 'all'):
        tl = json.load(open(f'{HERE}/timeline.json')); S = {s['id']: s for s in tl['shots']}; T = tl['total']; M = A.Mix(T + 0.5)
        SFX = PK['sfx_scale']; _add = M.add; M.add = lambda x, at, g=1.0, voice=False: _add(x, at, g if voice else g * SFX, voice)
        for s in tl['shots']: M.add_file(f'{AUD}/v{s["line"]}.wav', s['start'] + s['vo_at'], 1.0, voice=True)
        if crowd:
            nz = A.noise(T); sw = 0.55 + 0.45 * np.sin(np.linspace(0, T * 0.9, len(nz))) ** 2
            M.add(A.norm(A.bpf(nz, 300, 2500) * sw, 0.5), 0, PK['crowd_bed'])
        cheer = A.norm(A.bpf(A.noise(3.0), 400, 3500) * np.concatenate([np.linspace(0, 1, int(A.SR * 0.4)), np.linspace(1, 0, int(A.SR * 2.6))]), 0.6)
        for c in cues:
            sid, mode, pos, name, g = c[:5]; arg = c[5:]
            if sid not in S: continue
            at = S[sid]['start'] + (pos if mode == 'at' else S[sid]['vo_at'] + S[sid]['vo'] * pos)
            if at < 0 or at > T: continue
            M.add(cheer if name == 'cheer' else getattr(A, name)(*arg), at, g)
        kind, bpm = music
        bed = A.music_suspense(T + 1) if kind == 'suspense' else A.music_news(T + 1, bpm=bpm) if kind == 'news' else A.music_documentary(T + 1, bpm=bpm)
        M.music(bed, g=PK['music_gain'], duck=PK['music_duck'], fade_out=2.0); M.render(f'{HERE}/mix.wav')
        open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
        sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
        # two-pass loudnorm to the channel target (-14 LUFS integrated, -1.5 dBTP)
        r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{HERE}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
        m = json.loads(re.findall(r'\{[^{}]*\}', r)[-1])
        ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/mix.wav', '-af', ln, '-ar', '48000', f'{HERE}/mix_norm.wav')
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix_norm.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT)
        print('wrote', OUT)

    if step in ('cover', 'all'):
        subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'still', 'cover.png', 'drawCover()'], check=True, env=env)
