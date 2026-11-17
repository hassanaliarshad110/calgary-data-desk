#!/usr/bin/env python3
"""Cricket Kahani — 16-year-old Sachin and Waqar: one debut Test, two legends (Karachi, 15 Nov 1989).
Vertical 1080x1920.   python3 build.py [timeline|render|mix|cover|all]
index.html is assembled from consts.part + helpers (from ck_shoaib) + scenes.part by `python3 build.py page`."""
import os, sys, json, subprocess, re
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
SRC = '/home/claude/ck/tts_out'; AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True)
OUT_MP4 = os.path.join(HERE, 'CricketKahani_SachinWaqar_Karachi1989.mp4')
N = 8; step = sys.argv[1] if len(sys.argv) > 1 else 'all'
PK = json.load(open(os.path.join(ROOT, 'channels/cricketkahani/package.json')))['mix']
def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

if step == 'page':
    src = open(os.path.join(ROOT, 'demos/ck_shoaib/index.html')).read().split('\n')
    head, helpers = '\n'.join(src[:8]), '\n'.join(src[37:71])
    open(f'{HERE}/index.html', 'w').write(head + '\n' + open(f'{HERE}/consts.part').read() + helpers + '\n' + open(f'{HERE}/scenes.part').read())

if step in ('timeline', 'all'):
    for i in range(N):
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{SRC}/hi_{i}.wav', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', f'{AUD}/v{i}.wav')
    d = [round(dur(f'{AUD}/v{i}.wav'), 3) for i in range(N)]
    lead = [0.6] + [0.15] * (N - 1); tail = [0.25] * (N - 1) + [2.2]
    shots, t = [], 0
    for i in range(N):
        s = {'id': f's{i}', 'line': i, 'vo_at': lead[i], 'vo': d[i], 'dur': round(lead[i] + d[i] + tail[i], 3), 'start': round(t, 3)}
        t += s['dur']; shots.append(s)
    json.dump({'shots': shots, 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2), d)

if step in ('render', 'all'):
    env = dict(os.environ, W='1080', H='1920')
    subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full'] + sys.argv[2:], check=True, env=env)

if step in ('mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json')); S = {s['id']: s for s in tl['shots']}; T = tl['total']; M = A.Mix(T + 0.5)
    SFX = PK['sfx_scale']; _add = M.add; M.add = lambda x, at, g=1.0, voice=False: _add(x, at, g if voice else g * SFX, voice)
    for s in tl['shots']: M.add_file(f'{AUD}/v{s["line"]}.wav', s['start'] + s['vo_at'], 1.0, voice=True)
    n = A.noise(T); sw = 0.55 + 0.45 * np.sin(np.linspace(0, T * 0.9, len(n))) ** 2
    M.add(A.norm(A.bpf(n, 300, 2500) * sw, 0.5), 0, PK['crowd_bed'])
    cheer = A.norm(A.bpf(A.noise(3.0), 400, 3500) * np.concatenate([np.linspace(0, 1, int(A.SR * 0.4)), np.linspace(1, 0, int(A.SR * 2.6))]), 0.6)
    at = lambda sid, k: S[sid]['start'] + k
    rel = lambda sid, f: S[sid]['start'] + S[sid]['vo_at'] + S[sid]['vo'] * f
    M.add(A.whoosh(0.5), at('s0', 0.05), 0.7); M.add(A.impact_boom(1.4), at('s0', 0.55), 0.45); M.add(A.pop(), at('s0', 0.6), 0.4); M.add(A.pop(), at('s0', 0.95), 0.4); M.add(A.thud(), at('s0', 1.65), 0.5)
    M.add(A.swoosh_news(0.8), at('s1', 0.0), 0.5); M.add(A.pop(), at('s1', 0.3), 0.3); M.add(A.pop(), at('s1', 1.2), 0.3); M.add(A.pop(), at('s1', 2.3), 0.3)
    [M.add(A.footstep('hard', k), at('s2', 0.1 + k * 0.28), 0.25) for k in range(5)]
    cut = rel('s2', 0.47); M.add(A.whoosh(0.6), cut - 0.2, 0.6); [M.add(A.thud(), cut + 0.2 + k * 0.32, 0.18) for k in range(int((S['s2']['start'] + S['s2']['dur'] - cut - 0.4) / 0.32))]
    for h in (S['s3']['vo_at'] + 0.5, S['s3']['vo_at'] + S['s3']['vo'] * 0.2):
        M.add(A.whoosh(0.4), at('s3', h - 0.45), 0.5); M.add(A.bonk(), at('s3', h), 0.55); M.add(cheer, at('s3', h + 0.1), 0.35)
    b = rel('s3', 0.62); M.add(A.whoosh(0.4), b - 0.45, 0.6); M.add(A.slap(), b, 0.8); M.add(A.impact_boom(1.2), b + 0.05, 0.4); M.add(cheer, b + 0.2, 0.45); M.add(A.thud(), rel('s3', 0.62) + 0.85, 0.4)
    st = (S['s4']['vo'] * 0.55) / 4; [M.add(A.ticker_blip(), at('s4', 0.7 + k * st), 0.4) for k in range(4)]; M.add(A.ding(1320), at('s4', 0.7 + 3 * st), 0.3)
    M.add(A.swoosh_news(0.8), at('s5', 0.0), 0.4); M.add(A.thud(), at('s5', 1.0), 0.4)
    hb = rel('s5', 0.52); M.add(A.whoosh(0.7), hb - 0.7, 0.6); M.add(A.punch(), hb, 0.9); M.add(A.impact_boom(1.4), hb + 0.02, 0.4)
    [M.add(A.heartbeat(), hb + 0.6 + k * 1.0, 0.3) for k in range(int(S['s5']['start'] + S['s5']['dur'] - hb - 0.6))]
    M.add(A.pop(), rel('s6', 0) + 0.05, 0.3); M.add(A.impact_boom(1.2), rel('s6', 0.33), 0.35); M.add(cheer, rel('s6', 0.33) + 0.1, 0.35); M.add(A.ding(1320), rel('s6', 0.55), 0.3); M.add(A.chime_up(), rel('s6', 0.78), 0.3)
    [M.add(A.ticker_blip(), at('s7', 0.3 + k * 0.16), 0.25) for k in range(10)]; M.add(A.thud(), rel('s7', 0.6), 0.5)
    M.add(A.chime_up(), rel('s7', 0.82) + 0.1, 0.35); M.add(A.pop(), rel('s7', 0.82) + 0.5, 0.3); M.add(A.pop(), rel('s7', 0.82) + 1.3, 0.3)
    M.music(A.music_documentary(T + 1, bpm=84), g=PK['music_gain'], duck=PK['music_duck'], fade_out=2.0); M.render(f'{HERE}/mix.wav')
    open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
    sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
    # two-pass loudnorm to the channel target (-14 LUFS integrated, -1.5 dBTP)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{HERE}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(re.findall(r'\{[^{}]*\}', r)[-1])
    ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/mix.wav', '-af', ln, '-ar', '48000', f'{HERE}/mix_norm.wav')
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix_norm.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT_MP4)

if step in ('cover', 'all'):
    env = dict(os.environ, W='1080', H='1920')
    subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'still', 'cover.png', 'drawCover()'], check=True, env=env)
